// server/routes/problems.js - ES Module Version
import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get random problems
router.get('/random', async (req, res) => {
    try {
        const { topic, level, count = 1 } = req.query;

        let query = 'SELECT * FROM math_problems WHERE 1=1';
        const params = [];

        if (topic) {
            query += ' AND topic = ?';
            params.push(topic);
        }

        if (level) {
            query += ' AND level = ?';
            params.push(level);
        }

        query += ' ORDER BY RANDOM() LIMIT ?';
        params.push(parseInt(count));

        const problems = await db.all(query, params);

        // Get steps and hints for each problem
        for (let problem of problems) {
            const steps = await db.all(
                'SELECT * FROM problem_steps WHERE problem_id = ? ORDER BY step_number',
                [problem.id]
            );

            const hints = await db.all(
                'SELECT * FROM problem_hints WHERE problem_id = ? ORDER BY hint_number',
                [problem.id]
            );

            problem.steps = steps;
            problem.hints = hints;

            // Update usage count
            await db.run(
                'UPDATE math_problems SET times_used = times_used + 1 WHERE id = ?',
                [problem.id]
            );
        }

        res.json(problems);
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
});

// Get problem by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await db.get(
            'SELECT * FROM math_problems WHERE id = ?',
            [id]
        );

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const steps = await db.all(
            'SELECT * FROM problem_steps WHERE problem_id = ? ORDER BY step_number',
            [id]
        );

        const hints = await db.all(
            'SELECT * FROM problem_hints WHERE problem_id = ? ORDER BY hint_number',
            [id]
        );

        problem.steps = steps;
        problem.hints = hints;

        res.json(problem);
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Failed to fetch problem' });
    }
});

// Get statistics
router.get('/stats/topics', async (req, res) => {
    try {
        const stats = await db.all(`
            SELECT
                topic,
                level,
                COUNT(*) as count,
                AVG(difficulty_score) as avg_difficulty,
                SUM(times_used) as total_uses
            FROM math_problems
            GROUP BY topic, level
            ORDER BY topic, level
        `);

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Record user attempt
router.post('/attempt', async (req, res) => {
    try {
        const { userId, problemId, isCorrect, timeSpent, hintsUsed } = req.body;

        await db.run(`
            INSERT INTO user_problem_history
                (user_id, problem_id, is_correct, time_spent, hints_used)
            VALUES (?, ?, ?, ?, ?)
        `, [userId, problemId, isCorrect ? 1 : 0, timeSpent, hintsUsed]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error recording attempt:', error);
        res.status(500).json({ error: 'Failed to record attempt' });
    }
});

export default router;