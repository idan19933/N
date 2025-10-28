// server/routes/nexonRoutes.js - COMPLETE WITH NOTEBOOK & NEXON ASK ROUTES
import express from 'express';
import notebookService from '../services/notebookService.js';
import nexonAskService from '../services/nexonAskService.js';

const router = express.Router();

// ==================== NEXON ASK (INTELLIGENT CHAT) ROUTES ====================

// POST /api/chat/nexon-ask - Main chat endpoint with real data
router.post('/chat/nexon-ask', async (req, res) => {
    try {
        const { userId, message, conversationHistory } = req.body;

        if (!userId || !message) {
            return res.status(400).json({
                success: false,
                error: 'User ID and message required'
            });
        }

        console.log('💬 NexonAsk request from user:', userId);

        const result = await nexonAskService.generateResponse(
            userId,
            message,
            conversationHistory || []
        );

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('❌ NexonAsk chat error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/chat/topic-help/:topicId/:subtopicId - Get help for specific topic
router.get('/chat/topic-help/:topicId/:subtopicId', async (req, res) => {
    try {
        const { topicId, subtopicId } = req.params;
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }

        const result = await nexonAskService.getTopicHelp(userId, topicId, subtopicId);
        res.json(result);

    } catch (error) {
        console.error('❌ Topic help error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/chat/student-insights - Get student performance insights
router.get('/chat/student-insights', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }

        const context = await nexonAskService.getStudentContext(userId);

        if (!context) {
            return res.status(500).json({
                success: false,
                error: 'Could not load student data'
            });
        }

        res.json({
            success: true,
            insights: {
                summary: context.summary,
                weakTopics: context.weakTopics.slice(0, 5),
                strongTopics: context.strongTopics.slice(0, 5),
                recentActivity: context.recentActivity.slice(0, 10)
            }
        });

    } catch (error) {
        console.error('❌ Student insights error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== NOTEBOOK ROUTES ====================

// GET /api/notebook - Get all notebook entries for a user
router.get('/notebook', async (req, res) => {
    try {
        const studentId = req.query.userId || req.user?.id;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }

        const filters = {
            topic: req.query.topic
        };

        const result = await notebookService.getEntries(studentId, filters);
        res.json(result);
    } catch (error) {
        console.error('❌ Notebook route error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/notebook/stats - Get statistics about notebook entries
router.get('/notebook/stats', async (req, res) => {
    try {
        const studentId = req.query.userId || req.user?.id;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }

        const result = await notebookService.getStats(studentId);
        res.json(result);
    } catch (error) {
        console.error('❌ Notebook stats route error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/notebook - Add a new notebook entry
router.post('/notebook', async (req, res) => {
    try {
        const studentId = req.body.userId || req.user?.id;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }

        const result = await notebookService.addEntry(studentId, req.body);
        res.json(result);
    } catch (error) {
        console.error('❌ Add notebook entry route error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/notebook/recent - Get recent entries
router.get('/notebook/recent', async (req, res) => {
    try {
        const studentId = req.query.userId || req.user?.id;
        const limit = parseInt(req.query.limit) || 5;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }

        const result = await notebookService.getRecentEntries(studentId, limit);
        res.json(result);
    } catch (error) {
        console.error('❌ Recent entries route error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE /api/notebook/:id - Delete a notebook entry
router.delete('/notebook/:id', async (req, res) => {
    try {
        const studentId = req.body.userId || req.user?.id;
        const entryId = req.params.id;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                error: 'User ID required'
            });
        }

        const result = await notebookService.deleteEntry(entryId, studentId);
        res.json(result);
    } catch (error) {
        console.error('❌ Delete entry route error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== HEALTH CHECK ====================
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Nexon API is running',
        timestamp: new Date().toISOString()
    });
});

export default router;