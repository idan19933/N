// server/routes/notebookRoutes.js - FIXED: ONLY MANUAL SAVES
import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * Helper function to get internal user ID from Firebase UID
 */
async function getUserIdFromFirebaseUid(firebaseUid) {
    try {
        const result = await pool.query(
            'SELECT id FROM users WHERE firebase_uid = $1',
            [firebaseUid]
        );
        
        if (result.rows.length > 0) {
            return result.rows[0].id;
        }
        return null;
    } catch (error) {
        console.error('❌ Error looking up user:', error);
        return null;
    }
}

/**
 * Save to notebook - ONLY when user explicitly clicks "save"
 * This should NOT be called automatically for every wrong answer
 */
router.post('/save', async (req, res) => {
    try {
        const { 
            userId,
            studentId,
            topic,
            subtopic,
            title,
            content,
            type,
            summary,
            notes,
            tags
        } = req.body;

        console.log('📔 Manually saving to notebook:', {
            userId,
            topic,
            title: title?.substring(0, 50) + '...'
        });

        // Get internal user ID if userId provided
        let internalUserId = null;
        if (userId) {
            internalUserId = await getUserIdFromFirebaseUid(userId);
        }

        // Insert into notebook
        const result = await pool.query(
            `INSERT INTO notebook_entries 
            (user_id, student_id, topic, subtopic, title, content, type, summary, notes, tags, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
            RETURNING *`,
            [
                internalUserId,
                studentId || null,
                topic,
                subtopic || null,
                title,
                typeof content === 'object' ? JSON.stringify(content) : content,
                type || 'note',
                summary || null,
                notes || null,
                tags || null
            ]
        );

        console.log('✅ Saved to notebook successfully');

        res.json({
            success: true,
            entry: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error saving to notebook:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save to notebook',
            error: error.message
        });
    }
});

/**
 * Get all notebook entries for a user
 */
router.get('/entries/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const internalUserId = await getUserIdFromFirebaseUid(userId);
        
        if (!internalUserId) {
            return res.json({
                success: true,
                entries: []
            });
        }

        const result = await pool.query(
            `SELECT * FROM notebook_entries 
            WHERE user_id = $1
            ORDER BY created_at DESC`,
            [internalUserId]
        );

        res.json({
            success: true,
            entries: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('❌ Error fetching notebook entries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch entries',
            error: error.message
        });
    }
});

/**
 * Get notebook entries by topic
 */
router.get('/entries/:userId/:topic', async (req, res) => {
    try {
        const { userId, topic } = req.params;

        const internalUserId = await getUserIdFromFirebaseUid(userId);
        
        if (!internalUserId) {
            return res.json({
                success: true,
                entries: []
            });
        }

        const result = await pool.query(
            `SELECT * FROM notebook_entries 
            WHERE user_id = $1 AND topic = $2
            ORDER BY created_at DESC`,
            [internalUserId, topic]
        );

        res.json({
            success: true,
            entries: result.rows
        });

    } catch (error) {
        console.error('❌ Error fetching topic entries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch entries',
            error: error.message
        });
    }
});

/**
 * Update notebook entry
 */
router.put('/entry/:entryId', async (req, res) => {
    try {
        const { entryId } = req.params;
        const { title, content, notes, tags, summary } = req.body;

        const result = await pool.query(
            `UPDATE notebook_entries 
            SET title = COALESCE($1, title),
                content = COALESCE($2, content),
                notes = COALESCE($3, notes),
                tags = COALESCE($4, tags),
                summary = COALESCE($5, summary),
                updated_at = NOW()
            WHERE id = $6
            RETURNING *`,
            [title, content, notes, tags, summary, entryId]
        );

        res.json({
            success: true,
            entry: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Error updating entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update entry',
            error: error.message
        });
    }
});

/**
 * Delete notebook entry
 */
router.delete('/entry/:entryId', async (req, res) => {
    try {
        const { entryId } = req.params;

        await pool.query(
            'DELETE FROM notebook_entries WHERE id = $1',
            [entryId]
        );

        res.json({
            success: true,
            message: 'Entry deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting entry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete entry',
            error: error.message
        });
    }
});

export default router;
