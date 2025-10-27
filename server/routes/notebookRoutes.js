import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Save exercise to notebook
router.post('/save-exercise', async (req, res) => {
    try {
        const { userId, exerciseData } = req.body;
        
        console.log('📝 Saving exercise to notebook:', {
            userId,
            topic: exerciseData.topic,
            isCorrect: exerciseData.isCorrect
        });

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const result = await pool.query(`
            INSERT INTO notebook_entries (
                firebase_uid,
                student_id,
                topic,
                subtopic,
                question_text,
                user_answer,
                correct_answer,
                is_correct,
                type,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id
        `, [
            userId,
            userId, // student_id = firebase_uid
            exerciseData.topic || 'Unknown',
            exerciseData.subtopic || '',
            exerciseData.question || '',
            exerciseData.studentAnswer || '',
            exerciseData.answer || '',
            exerciseData.isCorrect || false,
            'exercise'
        ]);

        console.log('✅ Exercise saved with ID:', result.rows[0].id);
        
        res.json({ 
            success: true, 
            message: 'Exercise saved successfully',
            entryId: result.rows[0].id
        });

    } catch (error) {
        console.error('❌ Error saving exercise:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save exercise',
            details: error.message 
        });
    }
});

// Get notebook entries
router.get('/entries', async (req, res) => {
    try {
        const { userId, topic, limit = 50 } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        let query = `
            SELECT * FROM notebook_entries 
            WHERE firebase_uid = $1
        `;
        const params = [userId];

        if (topic) {
            query += ` AND topic = $2`;
            params.push(topic);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await pool.query(query, params);

        console.log(`✅ Retrieved ${result.rows.length} entries for student ${userId}`);
        
        res.json({ 
            success: true, 
            entries: result.rows 
        });

    } catch (error) {
        console.error('❌ Error fetching entries:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch entries',
            details: error.message 
        });
    }
});

// Get recent entries
router.get('/recent', async (req, res) => {
    try {
        const { userId, limit = 5 } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const result = await pool.query(`
            SELECT * FROM notebook_entries 
            WHERE firebase_uid = $1
            ORDER BY created_at DESC 
            LIMIT $2
        `, [userId, limit]);

        res.json({ 
            success: true, 
            entries: result.rows 
        });

    } catch (error) {
        console.error('❌ Error fetching recent entries:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch recent entries' 
        });
    }
});

// Get notebook stats
router.get('/stats', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const result = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT topic) as topics,
                COUNT(*) as exercises,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct,
                ROUND(AVG(CASE WHEN is_correct THEN 100 ELSE 0 END), 2) as accuracy
            FROM notebook_entries
            WHERE firebase_uid = $1
        `, [userId]);

        const stats = result.rows[0];
        
        console.log(`✅ Stats for student ${userId}:`, stats);

        res.json({ 
            success: true, 
            stats: {
                total: parseInt(stats.total) || 0,
                topics: parseInt(stats.topics) || 0,
                exercises: parseInt(stats.exercises) || 0,
                correct: parseInt(stats.correct) || 0,
                accuracy: parseFloat(stats.accuracy) || 0
            }
        });

    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch stats' 
        });
    }
});

// Get entries by topic
router.get('/topic/:topicId', async (req, res) => {
    try {
        const { topicId } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const result = await pool.query(`
            SELECT * FROM notebook_entries 
            WHERE firebase_uid = $1 AND topic = $2
            ORDER BY created_at DESC
        `, [userId, topicId]);

        res.json({ 
            success: true, 
            entries: result.rows 
        });

    } catch (error) {
        console.error('❌ Error fetching topic entries:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch topic entries' 
        });
    }
});

// Delete entry
router.delete('/entry/:entryId', async (req, res) => {
    try {
        const { entryId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const result = await pool.query(`
            DELETE FROM notebook_entries 
            WHERE id = $1 AND firebase_uid = $2
            RETURNING id
        `, [entryId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Entry not found or unauthorized' 
            });
        }

        console.log(`✅ Deleted entry ${entryId}`);

        res.json({ 
            success: true, 
            message: 'Entry deleted successfully' 
        });

    } catch (error) {
        console.error('❌ Error deleting entry:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete entry' 
        });
    }
});

export default router;
