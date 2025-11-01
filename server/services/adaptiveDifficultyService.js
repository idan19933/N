// server/services/adaptiveDifficultyService.js - ADAPTIVE DIFFICULTY ENGINE 🎯
import pool from '../config/database.js';

class AdaptiveDifficultyService {
    constructor() {
        this.DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

        // Thresholds for difficulty adjustment
        this.THRESHOLDS = {
            // Increase difficulty if accuracy is high
            INCREASE_ACCURACY: 85,  // 85% or higher → increase difficulty
            INCREASE_STREAK: 5,      // 5+ correct in a row → increase

            // Decrease difficulty if struggling
            DECREASE_ACCURACY: 40,   // Below 40% → decrease difficulty
            DECREASE_STREAK: 3,      // 3+ wrong in a row → decrease

            // Stay at current level
            STABLE_MIN: 60,         // 60-85% → stay at current level
            STABLE_MAX: 85
        };

        // Minimum questions before adjustment
        this.MIN_QUESTIONS = 3;

        // Recent window for analysis (last N questions)
        this.RECENT_WINDOW = 10;
    }

    /**
     * Get recommended difficulty for a student
     * @param {string} userId - Firebase UID
     * @param {string} topicId - Optional topic filter
     * @returns {Promise<Object>} Difficulty recommendation with reasoning
     */
    async getRecommendedDifficulty(userId, topicId = null) {
        try {
            console.log('🎯 Analyzing difficulty for user:', userId, 'topic:', topicId);

            // Get user's internal ID
            const userResult = await pool.query(
                'SELECT id FROM users WHERE firebase_uid = $1',
                [userId]
            );

            if (userResult.rows.length === 0) {
                console.log('⚠️ User not found, returning default');
                return {
                    difficulty: 'medium',
                    reason: 'no_data',
                    confidence: 0,
                    message: 'התחל מרמת בינוני'
                };
            }

            const internalUserId = userResult.rows[0].id;

            // Get performance data
            const performance = await this.getPerformanceMetrics(internalUserId, topicId);

            console.log('📊 Performance metrics:', performance);

            // Analyze and get recommendation
            const recommendation = this.analyzeAndRecommend(performance);

            console.log('✅ Difficulty recommendation:', recommendation);

            return recommendation;

        } catch (error) {
            console.error('❌ Error in getRecommendedDifficulty:', error);
            return {
                difficulty: 'medium',
                reason: 'error',
                confidence: 0,
                message: 'שגיאה בניתוח, ממשיך ברמת בינוני'
            };
        }
    }

    /**
     * Get comprehensive performance metrics
     */
    async getPerformanceMetrics(internalUserId, topicId = null) {
        let query = `
            SELECT 
                difficulty,
                is_correct,
                created_at,
                topic,
                subtopic
            FROM notebook_entries
            WHERE user_id = $1
        `;

        const params = [internalUserId];

        if (topicId) {
            query += ' AND topic = $2';
            params.push(topicId);
        }

        query += ' ORDER BY created_at DESC LIMIT 50';

        const result = await pool.query(query, params);
        const entries = result.rows;

        if (entries.length === 0) {
            return {
                totalQuestions: 0,
                recentQuestions: [],
                overallAccuracy: 0,
                recentAccuracy: 0,
                currentStreak: 0,
                streakType: null,
                difficultyBreakdown: {},
                trendDirection: 'stable',
                hasEnoughData: false
            };
        }

        // Recent window (last N questions)
        const recentEntries = entries.slice(0, this.RECENT_WINDOW);

        // Calculate overall accuracy
        const correctTotal = entries.filter(e => e.is_correct).length;
        const overallAccuracy = Math.round((correctTotal / entries.length) * 100);

        // Calculate recent accuracy
        const correctRecent = recentEntries.filter(e => e.is_correct).length;
        const recentAccuracy = Math.round((correctRecent / recentEntries.length) * 100);

        // Calculate current streak
        const streak = this.calculateStreak(entries);

        // Difficulty breakdown
        const difficultyBreakdown = this.analyzeDifficultyBreakdown(entries);

        // Trend analysis
        const trendDirection = this.analyzeTrend(entries);

        // Time-based analysis
        const timeAnalysis = this.analyzeTimePattern(entries);

        return {
            totalQuestions: entries.length,
            recentQuestions: recentEntries,
            overallAccuracy,
            recentAccuracy,
            currentStreak: streak.count,
            streakType: streak.type, // 'correct' or 'incorrect'
            difficultyBreakdown,
            trendDirection, // 'improving', 'declining', 'stable'
            timeAnalysis,
            hasEnoughData: entries.length >= this.MIN_QUESTIONS
        };
    }

    /**
     * Calculate current streak (consecutive correct/incorrect)
     */
    calculateStreak(entries) {
        if (entries.length === 0) {
            return { count: 0, type: null };
        }

        let count = 0;
        const firstResult = entries[0].is_correct;

        for (const entry of entries) {
            if (entry.is_correct === firstResult) {
                count++;
            } else {
                break;
            }
        }

        return {
            count,
            type: firstResult ? 'correct' : 'incorrect'
        };
    }

    /**
     * Analyze difficulty breakdown
     */
    analyzeDifficultyBreakdown(entries) {
        const breakdown = {
            easy: { total: 0, correct: 0, accuracy: 0 },
            medium: { total: 0, correct: 0, accuracy: 0 },
            hard: { total: 0, correct: 0, accuracy: 0 }
        };

        entries.forEach(entry => {
            const diff = entry.difficulty || 'medium';
            if (breakdown[diff]) {
                breakdown[diff].total++;
                if (entry.is_correct) {
                    breakdown[diff].correct++;
                }
            }
        });

        // Calculate accuracy for each difficulty
        Object.keys(breakdown).forEach(diff => {
            if (breakdown[diff].total > 0) {
                breakdown[diff].accuracy = Math.round(
                    (breakdown[diff].correct / breakdown[diff].total) * 100
                );
            }
        });

        return breakdown;
    }

    /**
     * Analyze performance trend over time
     */
    analyzeTrend(entries) {
        if (entries.length < 6) return 'stable';

        // Split into two halves
        const mid = Math.floor(entries.length / 2);
        const recent = entries.slice(0, mid);
        const older = entries.slice(mid);

        const recentCorrect = recent.filter(e => e.is_correct).length;
        const olderCorrect = older.filter(e => e.is_correct).length;

        const recentAccuracy = (recentCorrect / recent.length) * 100;
        const olderAccuracy = (olderCorrect / older.length) * 100;

        const difference = recentAccuracy - olderAccuracy;

        if (difference > 15) return 'improving';
        if (difference < -15) return 'declining';
        return 'stable';
    }

    /**
     * Analyze time patterns (time of day, day of week)
     */
    analyzeTimePattern(entries) {
        const now = new Date();
        const recentEntries = entries.filter(e => {
            const entryDate = new Date(e.created_at);
            const hoursDiff = (now - entryDate) / (1000 * 60 * 60);
            return hoursDiff <= 24; // Last 24 hours
        });

        return {
            todayQuestions: recentEntries.length,
            lastActivity: entries[0]?.created_at || null,
            isActive: recentEntries.length > 0
        };
    }

    /**
     * Main analysis and recommendation logic
     */
    analyzeAndRecommend(performance) {
        const {
            totalQuestions,
            recentAccuracy,
            overallAccuracy,
            currentStreak,
            streakType,
            difficultyBreakdown,
            trendDirection,
            hasEnoughData
        } = performance;

        // Not enough data yet
        if (!hasEnoughData) {
            return {
                difficulty: 'medium',
                reason: 'insufficient_data',
                confidence: 30,
                message: 'התחל מרמת בינוני - נאסוף עוד מידע',
                details: {
                    questionsNeeded: this.MIN_QUESTIONS - totalQuestions
                }
            };
        }

        let recommendedDifficulty = 'medium';
        let reason = '';
        let confidence = 0;
        let message = '';
        const details = {};

        // 🔥 HIGH PERFORMANCE - INCREASE DIFFICULTY
        if (recentAccuracy >= this.THRESHOLDS.INCREASE_ACCURACY ||
            (streakType === 'correct' && currentStreak >= this.THRESHOLDS.INCREASE_STREAK)) {

            // Find current highest difficulty with good performance
            if (difficultyBreakdown.hard.total > 0 && difficultyBreakdown.hard.accuracy >= 70) {
                recommendedDifficulty = 'hard';
                reason = 'mastery';
                confidence = 95;
                message = '🔥 אתה שולט בחומר! שומרים על רמת קושי גבוהה';
            } else if (difficultyBreakdown.medium.total > 0 && difficultyBreakdown.medium.accuracy >= 80) {
                recommendedDifficulty = 'hard';
                reason = 'ready_for_challenge';
                confidence = 85;
                message = '🚀 מצוין! זמן לעבור לשאלות קשות יותר';
            } else {
                recommendedDifficulty = 'medium';
                reason = 'maintain_medium';
                confidence = 75;
                message = '💪 ביצועים טובים! ממשיכים ברמת בינוני';
            }
        }

        // 🟡 STRUGGLING - DECREASE DIFFICULTY
        else if (recentAccuracy < this.THRESHOLDS.DECREASE_ACCURACY ||
            (streakType === 'incorrect' && currentStreak >= this.THRESHOLDS.DECREASE_STREAK)) {

            // Find appropriate easier difficulty
            if (difficultyBreakdown.easy.total > 0 && difficultyBreakdown.easy.accuracy < 60) {
                recommendedDifficulty = 'easy';
                reason = 'needs_foundation';
                confidence = 90;
                message = '🤗 בואו נתחיל מהבסיס - אין בושה בזה!';
            } else if (recentAccuracy < 30) {
                recommendedDifficulty = 'easy';
                reason = 'struggling';
                confidence = 85;
                message = '💙 בואו ניקח צעד אחורה ונחזק את הבסיס';
            } else {
                recommendedDifficulty = 'medium';
                reason = 'mild_struggle';
                confidence = 70;
                message = '💪 קצת מאתגר? ממשיכים ברמת בינוני';
            }
        }

        // ✅ STABLE - MAINTAIN CURRENT LEVEL
        else {
            // Determine current effective difficulty based on recent questions
            const recentDifficulties = performance.recentQuestions.map(q => q.difficulty || 'medium');
            const currentDifficulty = this.getMostFrequent(recentDifficulties);

            recommendedDifficulty = currentDifficulty;
            reason = 'optimal_level';
            confidence = 80;
            message = '✨ אתה ברמה המושלמת! ממשיכים כך';
        }

        // 📈 TREND ADJUSTMENT
        if (trendDirection === 'improving' && recommendedDifficulty === 'easy') {
            recommendedDifficulty = 'medium';
            reason = 'trending_up';
            message = '📈 אני רואה שיפור! בואו נעלה רמה';
        } else if (trendDirection === 'declining' && recommendedDifficulty === 'hard') {
            recommendedDifficulty = 'medium';
            reason = 'trending_down';
            message = '📉 בואו נתאמן עוד קצת ברמת בינוני';
        }

        // Build detailed explanation
        details.recentAccuracy = recentAccuracy;
        details.overallAccuracy = overallAccuracy;
        details.currentStreak = currentStreak;
        details.streakType = streakType;
        details.trendDirection = trendDirection;
        details.difficultyBreakdown = difficultyBreakdown;

        return {
            difficulty: recommendedDifficulty,
            reason,
            confidence,
            message,
            details
        };
    }

    /**
     * Helper: Get most frequent item in array
     */
    getMostFrequent(arr) {
        const frequency = {};
        let maxFreq = 0;
        let mostFrequent = arr[0];

        arr.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
            if (frequency[item] > maxFreq) {
                maxFreq = frequency[item];
                mostFrequent = item;
            }
        });

        return mostFrequent || 'medium';
    }

    /**
     * Update difficulty after each answer
     * Returns whether difficulty should change
     */
    async shouldAdjustDifficulty(userId, topicId, currentDifficulty, isCorrect) {
        try {
            const recommendation = await this.getRecommendedDifficulty(userId, topicId);

            // Check if recommended difficulty differs from current
            if (recommendation.difficulty !== currentDifficulty &&
                recommendation.confidence >= 70) {

                return {
                    shouldAdjust: true,
                    newDifficulty: recommendation.difficulty,
                    reason: recommendation.message,
                    confidence: recommendation.confidence
                };
            }

            return {
                shouldAdjust: false,
                currentDifficulty,
                reason: 'ממשיכים באותה רמה'
            };

        } catch (error) {
            console.error('❌ Error in shouldAdjustDifficulty:', error);
            return {
                shouldAdjust: false,
                currentDifficulty,
                reason: 'שגיאה בבדיקה'
            };
        }
    }

    /**
     * Get difficulty label in Hebrew
     */
    getDifficultyLabel(difficulty) {
        const labels = {
            easy: 'קל',
            medium: 'בינוני',
            hard: 'קשה'
        };
        return labels[difficulty] || 'בינוני';
    }

    /**
     * Get difficulty emoji
     */
    getDifficultyEmoji(difficulty) {
        const emojis = {
            easy: '🟢',
            medium: '🟡',
            hard: '🔴'
        };
        return emojis[difficulty] || '🟡';
    }
}

// Export singleton instance
const adaptiveDifficultyService = new AdaptiveDifficultyService();
export default adaptiveDifficultyService;