// server/routes/adaptiveDifficultyRoutes.js - API ROUTES FOR ADAPTIVE DIFFICULTY 🎯
import express from 'express';
import adaptiveDifficultyService from '../services/adaptiveDifficultyService.js';

const router = express.Router();

/**
 * GET /api/adaptive/recommend - Get recommended difficulty for user
 * Query params: userId (required), topicId (optional)
 */
router.get('/recommend', async (req, res) => {
    try {
        const { userId, topicId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        console.log('🎯 [Adaptive] Getting recommendation for:', userId, 'topic:', topicId);

        const recommendation = await adaptiveDifficultyService.getRecommendedDifficulty(
            userId,
            topicId || null
        );

        console.log('✅ [Adaptive] Recommendation:', recommendation.difficulty, 'confidence:', recommendation.confidence);

        return res.json({
            success: true,
            recommendation
        });

    } catch (error) {
        console.error('❌ [Adaptive] Error getting recommendation:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get difficulty recommendation',
            details: error.message
        });
    }
});

/**
 * POST /api/adaptive/check-adjustment - Check if difficulty should be adjusted after answer
 * Body: { userId, topicId, currentDifficulty, isCorrect }
 */
router.post('/check-adjustment', async (req, res) => {
    try {
        const { userId, topicId, currentDifficulty, isCorrect } = req.body;

        if (!userId || !currentDifficulty) {
            return res.status(400).json({
                success: false,
                error: 'userId and currentDifficulty are required'
            });
        }

        console.log('🔄 [Adaptive] Checking adjustment:', {
            userId,
            topicId,
            currentDifficulty,
            isCorrect
        });

        const adjustment = await adaptiveDifficultyService.shouldAdjustDifficulty(
            userId,
            topicId || null,
            currentDifficulty,
            isCorrect
        );

        console.log('✅ [Adaptive] Adjustment result:', adjustment);

        return res.json({
            success: true,
            adjustment
        });

    } catch (error) {
        console.error('❌ [Adaptive] Error checking adjustment:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to check difficulty adjustment',
            details: error.message
        });
    }
});

/**
 * GET /api/adaptive/performance-summary - Get comprehensive performance summary
 * Query params: userId (required), topicId (optional)
 */
router.get('/performance-summary', async (req, res) => {
    try {
        const { userId, topicId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        console.log('📊 [Adaptive] Getting performance summary for:', userId);

        const recommendation = await adaptiveDifficultyService.getRecommendedDifficulty(
            userId,
            topicId || null
        );

        return res.json({
            success: true,
            summary: {
                currentDifficulty: recommendation.difficulty,
                confidence: recommendation.confidence,
                message: recommendation.message,
                reason: recommendation.reason,
                performance: recommendation.details,
                emoji: adaptiveDifficultyService.getDifficultyEmoji(recommendation.difficulty),
                label: adaptiveDifficultyService.getDifficultyLabel(recommendation.difficulty)
            }
        });

    } catch (error) {
        console.error('❌ [Adaptive] Error getting performance summary:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get performance summary',
            details: error.message
        });
    }
});

export default router;