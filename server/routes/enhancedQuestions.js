// backend/routes/enhancedQuestions.js - API ROUTES FOR ENHANCED QUESTION SYSTEM

const express = require('express');
const router = express.Router();
const questionService = require('../services/enhancedQuestionService');
const aiGenerator = require('../services/aiQuestionGenerator');
const difficultyEngine = require('../services/difficultyEngine');
const webScraper = require('../services/webScrapingService');

/**
 * GET /api/questions/next
 * Get next adaptive question for user
 */
router.get('/next', async (req, res) => {
    try {
        const {
            userId,
            topic,
            subtopic,
            personality = 'nexon',
            gradeLevel = 8,
            mode = 'adaptive'
        } = req.query;

        if (!userId || !topic) {
            return res.status(400).json({
                success: false,
                error: 'userId and topic are required'
            });
        }

        const result = await questionService.getNextQuestion({
            userId,
            topic,
            subtopic,
            personality,
            gradeLevel: parseInt(gradeLevel),
            mode
        });

        res.json(result);
    } catch (error) {
        console.error('❌ [API] Get next question error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/questions/submit
 * Submit answer and get feedback
 */
router.post('/submit', async (req, res) => {
    try {
        const {
            userId,
            questionId,
            userAnswer,
            timeSpent,
            hintsUsed,
            sessionId,
            personality
        } = req.body;

        if (!userId || !questionId || userAnswer === undefined) {
            return res.status(400).json({
                success: false,
                error: 'userId, questionId, and userAnswer are required'
            });
        }

        const result = await questionService.submitAnswer({
            userId,
            questionId,
            userAnswer,
            timeSpent,
            hintsUsed,
            sessionId,
            personality
        });

        res.json(result);
    } catch (error) {
        console.error('❌ [API] Submit answer error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/questions/session
 * Get practice session with multiple questions
 */
router.get('/session', async (req, res) => {
    try {
        const {
            userId,
            topic,
            personality = 'nexon',
            questionsCount = 10,
            mode = 'adaptive'
        } = req.query;

        if (!userId || !topic) {
            return res.status(400).json({
                success: false,
                error: 'userId and topic are required'
            });
        }

        const result = await questionService.getPracticeSession({
            userId,
            topic,
            personality,
            questionsCount: parseInt(questionsCount),
            mode
        });

        res.json(result);
    } catch (error) {
        console.error('❌ [API] Get session error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/questions/difficulty
 * Get recommended difficulty for user and topic
 */
router.get('/difficulty', async (req, res) => {
    try {
        const { userId, topic } = req.query;

        if (!userId || !topic) {
            return res.status(400).json({
                success: false,
                error: 'userId and topic are required'
            });
        }

        const recommendation = await difficultyEngine.getRecommendedDifficulty(userId, topic);

        res.json({
            success: true,
            recommendation
        });
    } catch (error) {
        console.error('❌ [API] Get difficulty error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/questions/difficulty/stats
 * Get difficulty statistics for user
 */
router.get('/difficulty/stats', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const stats = await difficultyEngine.getDifficultyStats(userId);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('❌ [API] Get difficulty stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/questions/generate
 * Generate new questions using AI
 */
router.post('/generate', async (req, res) => {
    try {
        const {
            topic,
            subtopic,
            difficulty = 'medium',
            gradeLevel = 8,
            count = 5,
            personality = 'nexon',
            questionType = 'mixed'
        } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                error: 'topic is required'
            });
        }

        const questions = await aiGenerator.generateQuestions({
            topic,
            subtopic,
            difficulty,
            gradeLevel: parseInt(gradeLevel),
            count: parseInt(count),
            personality,
            questionType
        });

        res.json({
            success: true,
            questions,
            count: questions.length
        });
    } catch (error) {
        console.error('❌ [API] Generate questions error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/questions/generate/weak-topics
 * Generate questions for user's weak topics
 */
router.post('/generate/weak-topics', async (req, res) => {
    try {
        const { userId, count = 10 } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const questions = await aiGenerator.generateForWeakTopics(userId, parseInt(count));

        res.json({
            success: true,
            questions,
            count: questions.length
        });
    } catch (error) {
        console.error('❌ [API] Generate weak topics error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/questions/stats
 * Get user statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        const stats = await questionService.getUserStats(userId);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('❌ [API] Get stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/questions/performance
 * Get topic performance for user
 */
router.get('/performance', async (req, res) => {
    try {
        const { userId, topic } = req.query;

        if (!userId || !topic) {
            return res.status(400).json({
                success: false,
                error: 'userId and topic are required'
            });
        }

        const performance = await questionService.getTopicPerformance(userId, topic);

        res.json({
            success: true,
            performance
        });
    } catch (error) {
        console.error('❌ [API] Get performance error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/scraping/run
 * Manually trigger web scraping (admin only)
 */
router.post('/scraping/run', async (req, res) => {
    try {
        console.log('🕷️ [API] Starting manual scraping...');

        const results = await webScraper.runScheduledScraping();

        res.json({
            success: true,
            message: 'Scraping completed',
            results
        });
    } catch (error) {
        console.error('❌ [API] Scraping error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/scraping/stats
 * Get scraping statistics
 */
router.get('/scraping/stats', async (req, res) => {
    try {
        const stats = await webScraper.getScrapingStats();

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('❌ [API] Scraping stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/questions/feedback
 * Submit feedback about a question
 */
router.post('/feedback', async (req, res) => {
    try {
        const {
            userId,
            questionId,
            feedbackType,
            feedbackText,
            userDifficulty,
            userAccuracy
        } = req.body;

        if (!userId || !questionId || !feedbackType) {
            return res.status(400).json({
                success: false,
                error: 'userId, questionId, and feedbackType are required'
            });
        }

        const query = `
            INSERT INTO question_feedback (
                question_id, user_id, feedback_type, feedback_text,
                user_difficulty, user_accuracy
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `;

        const { pool } = require('../config/database');
        const result = await pool.query(query, [
            questionId,
            userId,
            feedbackType,
            feedbackText,
            userDifficulty,
            userAccuracy
        ]);

        res.json({
            success: true,
            feedbackId: result.rows[0].id,
            message: 'תודה על המשוב!'
        });
    } catch (error) {
        console.error('❌ [API] Feedback error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/questions/bank/stats
 * Get question bank statistics (admin)
 */
router.get('/bank/stats', async (req, res) => {
    try {
        const { pool } = require('../config/database');

        const query = `
            SELECT 
                source,
                difficulty,
                COUNT(*) as count,
                AVG(quality_score) as avg_quality,
                SUM(usage_count) as total_usage
            FROM question_bank
            WHERE is_active = true
            GROUP BY source, difficulty
            ORDER BY source, difficulty
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            stats: result.rows
        });
    } catch (error) {
        console.error('❌ [API] Bank stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/questions/difficulty/reset
 * Reset difficulty for a topic
 */
router.post('/difficulty/reset', async (req, res) => {
    try {
        const { userId, topic } = req.body;

        if (!userId || !topic) {
            return res.status(400).json({
                success: false,
                error: 'userId and topic are required'
            });
        }

        const result = await difficultyEngine.resetDifficulty(userId, topic);

        res.json({
            success: true,
            ...result,
            message: 'רמת הקושי אופסה בהצלחה'
        });
    } catch (error) {
        console.error('❌ [API] Reset difficulty error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;