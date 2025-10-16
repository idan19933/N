// server/server.js - COMPLETE WITH ALL ENDPOINTS
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let db;

async function initializeDatabase() {
    try {
        db = await open({
            filename: path.join(__dirname, '../database/mathtutor.db'),
            driver: sqlite3.Database
        });
        console.log('✅ Database connected');
        await db.run('PRAGMA foreign_keys = ON');
        return db;
    } catch (error) {
        console.error('❌ Database error:', error);
        throw error;
    }
}

initializeDatabase();

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', database: db ? 'Connected' : 'Disconnected' });
});

app.get('/api/problems/random', async (req, res) => {
    try {
        const { topic, level, count = 1 } = req.query;

        let query = 'SELECT * FROM math_problems';
        const params = [];
        const conditions = [];

        if (topic) {
            conditions.push('topic = ?');
            params.push(topic);
        }

        if (level) {
            conditions.push('level = ?');
            params.push(level);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY RANDOM() LIMIT ?';
        params.push(parseInt(count));

        const problems = await db.all(query, params);

        console.log(`✅ Returned ${problems.length} problems`);
        res.json(problems);
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/attempts', async (req, res) => {
    try {
        const { user_id, problem_id, is_correct, time_spent, hints_used, steps } = req.body;

        const result = await db.run(`
            INSERT INTO attempts (user_id, problem_id, is_correct, time_spent, hints_used, steps, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [user_id, problem_id, is_correct ? 1 : 0, time_spent || 0, hints_used || 0, steps, new Date().toISOString()]);

        res.json({ id: result.lastID, message: 'Attempt recorded' });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/analytics/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_attempts,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
                ROUND(AVG(time_spent), 2) as avg_time,
                ROUND(AVG(hints_used), 2) as avg_hints
            FROM attempts WHERE user_id = ?
        `, [userId]);

        const byTopic = await db.all(`
            SELECT 
                p.topic,
                COUNT(*) as attempts,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM attempts a
            JOIN math_problems p ON CAST(a.problem_id AS INTEGER) = p.id
            WHERE a.user_id = ?
            GROUP BY p.topic
        `, [userId]);

        res.json({ stats, byTopic });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Math Tutor API Server');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('='.repeat(50));
});

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    if (db) await db.close();
    process.exit(0);
});