// server/routes/performanceRoutes.js
import express from 'express';
import pool from '../config/database.js';
import aiPerformanceAnalysis from '../services/aiPerformanceAnalysis.js';

const router = express.Router();

/**
 * GET /api/performance/live-stats - Get real-time performance statistics
 */
router.get('/live-stats', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing userId parameter'
            });
        }

        // Get user ID
        const userQuery = 'SELECT id FROM users WHERE firebase_uid = $1';
        const userResult = await pool.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            return res.json({
                success: true,
                stats: {
                    currentStreak: 0,
                    todayQuestions: 0,
                    todayAccuracy: 0,
                    realtimeAccuracy: 0,
                    currentDifficulty: 'medium',
                    suggestedDifficulty: 'medium',
                    performanceTrend: 'stable'
                }
            });
        }

        const studentId = userResult.rows[0].id;

        // Get current streak
        const streakQuery = `
            WITH daily_activity AS (
                SELECT 
                    DATE(created_at) as activity_date,
                    COUNT(*) as questions_count
                FROM notebook_entries
                WHERE student_id = $1
                GROUP BY DATE(created_at)
                ORDER BY activity_date DESC
            ),
            streak_calc AS (
                SELECT 
                    activity_date,
                    activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date DESC) - 1) * INTERVAL '1 day' as streak_group
                FROM daily_activity
            )
            SELECT 
                COUNT(DISTINCT activity_date) as current_streak
            FROM streak_calc
            WHERE streak_group = (
                SELECT streak_group 
                FROM streak_calc 
                WHERE activity_date = CURRENT_DATE
                LIMIT 1
            )
        `;

        const streakResult = await pool.query(streakQuery, [studentId]);
        const currentStreak = streakResult.rows[0]?.current_streak || 0;

        // Get today's statistics
        const todayQuery = `
            SELECT 
                COUNT(*) as total_today,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_today,
                ROUND(AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100) as accuracy_today
            FROM notebook_entries
            WHERE student_id = $1
                AND DATE(created_at) = CURRENT_DATE
        `;

        const todayResult = await pool.query(todayQuery, [studentId]);
        const todayStats = todayResult.rows[0];

        // Get last 10 questions for real-time accuracy
        const realtimeQuery = `
            SELECT 
                is_correct,
                difficulty,
                created_at
            FROM notebook_entries
            WHERE student_id = $1
            ORDER BY created_at DESC
            LIMIT 10
        `;

        const realtimeResult = await pool.query(realtimeQuery, [studentId]);
        const recentQuestions = realtimeResult.rows;

        const realtimeAccuracy = recentQuestions.length > 0
            ? Math.round((recentQuestions.filter(q => q.is_correct).length / recentQuestions.length) * 100)
            : 0;

        // Get current difficulty and suggested difficulty
        const currentDifficulty = recentQuestions[0]?.difficulty || 'medium';
        const suggestedDifficulty = await aiPerformanceAnalysis.getRealtimeDifficulty(userId);

        // Calculate performance trend
        let performanceTrend = 'stable';
        if (recentQuestions.length >= 5) {
            const firstHalf = recentQuestions.slice(5, 10);
            const secondHalf = recentQuestions.slice(0, 5);

            const firstAccuracy = firstHalf.filter(q => q.is_correct).length / firstHalf.length;
            const secondAccuracy = secondHalf.filter(q => q.is_correct).length / secondHalf.length;

            if (secondAccuracy > firstAccuracy + 0.2) {
                performanceTrend = 'improving';
            } else if (secondAccuracy < firstAccuracy - 0.2) {
                performanceTrend = 'declining';
            }
        }

        res.json({
            success: true,
            stats: {
                currentStreak: parseInt(currentStreak) || 0,
                todayQuestions: parseInt(todayStats.total_today) || 0,
                todayAccuracy: parseInt(todayStats.accuracy_today) || 0,
                realtimeAccuracy: realtimeAccuracy,
                currentDifficulty: currentDifficulty,
                suggestedDifficulty: suggestedDifficulty,
                performanceTrend: performanceTrend
            }
        });

    } catch (error) {
        console.error('❌ Error getting live stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get live statistics',
            error: error.message
        });
    }
});

/**
 * GET /api/ai/performance-analysis - Get AI performance analysis
 */
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing userId parameter'
            });
        }

        const analysis = await aiPerformanceAnalysis.analyzePerformance(userId);

        res.json(analysis);

    } catch (error) {
        console.error('❌ Error in performance analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze performance',
            error: error.message
        });
    }
});

/**
 * POST /api/performance/record-session - Record learning session data
 */
router.post('/record-session', async (req, res) => {
    try {
        const {
            userId,
            sessionDuration,
            questionsAttempted,
            correctAnswers,
            topicsCovered,
            averageTimePerQuestion
        } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Record session in database
        await pool.query(
            `INSERT INTO learning_sessions 
            (user_id, duration_minutes, questions_attempted, correct_answers, topics_covered, avg_time_per_question, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
                userId,
                sessionDuration,
                questionsAttempted,
                correctAnswers,
                JSON.stringify(topicsCovered),
                averageTimePerQuestion
            ]
        );

        // Trigger performance analysis update
        const analysis = await aiPerformanceAnalysis.analyzePerformance(userId);

        res.json({
            success: true,
            message: 'Session recorded successfully',
            analysis: analysis.analysis
        });

    } catch (error) {
        console.error('❌ Error recording session:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record session',
            error: error.message
        });
    }
});

/**
 * GET /api/performance/insights - Get performance insights
 */
router.get('/insights', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing userId parameter'
            });
        }

        const insights = await aiPerformanceAnalysis.getInsights(userId);

        res.json(insights);

    } catch (error) {
        console.error('❌ Error getting insights:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get insights',
            error: error.message
        });
    }
});

export default router;