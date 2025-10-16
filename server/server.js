// server/server.js - COMPLETE SINGLE FILE BACKEND
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
let db = null;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
async function initDatabase() {
    db = await open({
        filename: path.join(__dirname, '../database/nexon.db'),
        driver: sqlite3.Database
    });

    const count = await db.get('SELECT COUNT(*) as count FROM problems');
    console.log(`✅ Database connected: ${count.count} problems`);
    return db;
}

// ============== ROUTES ==============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Problems health
app.get('/api/problems/health', async (req, res) => {
    try {
        const result = await db.get('SELECT COUNT(*) as count FROM problems');
        const topics = await db.all('SELECT DISTINCT topic FROM problems');

        res.json({
            status: 'ok',
            database: 'connected',
            totalProblems: result.count,
            availableTopics: topics.map(t => t.topic)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get stats
app.get('/api/problems/stats', async (req, res) => {
    try {
        const total = await db.get('SELECT COUNT(*) as count FROM problems');
        const byTopic = await db.all('SELECT topic, COUNT(*) as count FROM problems GROUP BY topic');
        const byDifficulty = await db.all('SELECT difficulty, COUNT(*) as count FROM problems GROUP BY difficulty');

        const stats = {
            total: total.count,
            byTopic: {},
            byDifficulty: {}
        };

        byTopic.forEach(row => {
            stats.byTopic[row.topic] = row.count;
        });

        byDifficulty.forEach(row => {
            stats.byDifficulty[row.difficulty] = row.count;
        });

        console.log('📊 Stats requested:', stats);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get random problems
app.get('/api/problems/random', async (req, res) => {
    try {
        const { topic, difficulty, count = 1 } = req.query;

        let query = 'SELECT * FROM problems WHERE 1=1';
        const params = [];

        if (topic) {
            query += ' AND topic = ?';
            params.push(topic);
        }

        if (difficulty) {
            query += ' AND difficulty = ?';
            params.push(parseInt(difficulty));
        }

        query += ' ORDER BY RANDOM() LIMIT ?';
        params.push(parseInt(count));

        console.log('🔍 Random query:', { topic, difficulty, count });
        const problems = await db.all(query, params);
        console.log(`✅ Found ${problems.length} problems`);

        res.json(problems);
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get progressive problems
app.get('/api/problems/progressive', async (req, res) => {
    try {
        const { topic, difficulties, count = 1 } = req.query;

        let query = 'SELECT * FROM problems WHERE 1=1';
        const params = [];

        if (topic) {
            query += ' AND topic = ?';
            params.push(topic);
        }

        if (difficulties) {
            const diffArray = difficulties.split(',').map(d => parseInt(d));
            const placeholders = diffArray.map(() => '?').join(',');
            query += ` AND difficulty IN (${placeholders})`;
            params.push(...diffArray);
        }

        query += ' ORDER BY RANDOM() LIMIT ?';
        params.push(parseInt(count));

        console.log('🔍 Progressive:', { topic, difficulties, count });
        const problems = await db.all(query, params);
        console.log(`✅ Found ${problems.length} problems`);

        res.json(problems);
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all problems (with filters)
app.get('/api/problems', async (req, res) => {
    try {
        const { topic, difficulty, limit = 10, offset = 0 } = req.query;

        let query = 'SELECT * FROM problems WHERE 1=1';
        const params = [];

        if (topic) {
            query += ' AND topic = ?';
            params.push(topic);
        }

        if (difficulty) {
            query += ' AND difficulty = ?';
            params.push(parseInt(difficulty));
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const problems = await db.all(query, params);
        console.log(`✅ Query: ${problems.length} problems`);

        res.json(problems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk insert
app.post('/api/problems/bulk', async (req, res) => {
    try {
        const { problems } = req.body;

        if (!problems || !Array.isArray(problems)) {
            return res.status(400).json({ error: 'Invalid problems array' });
        }

        const insertStmt = await db.prepare(`
            INSERT INTO problems (
                question, answer, steps, hints, difficulty, 
                topic, category, subcategory, grade, tier
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let inserted = 0;
        for (const problem of problems) {
            try {
                await insertStmt.run(
                    problem.question,
                    problem.answer,
                    JSON.stringify(problem.steps || []),
                    JSON.stringify(problem.hints || []),
                    problem.difficulty,
                    problem.topic,
                    problem.category,
                    problem.subcategory,
                    problem.grade || '7-12',
                    problem.tier || problem.difficulty
                );
                inserted++;
            } catch (error) {
                console.error('Insert error:', error.message);
            }
        }

        await insertStmt.finalize();
        res.json({ count: inserted, total: problems.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    console.log(`❌ 404: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        availableRoutes: [
            'GET /api/health',
            'GET /api/problems/health',
            'GET /api/problems/stats',
            'GET /api/problems/random',
            'GET /api/problems/progressive',
            'GET /api/problems'
        ]
    });
});

// Start server
async function start() {
    try {
        await initDatabase();

        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log('🚀 NEXON BACKEND RUNNING!');
            console.log('='.repeat(60));
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`📊 Test: http://localhost:${PORT}/api/problems/health`);
            console.log('='.repeat(60) + '\n');
        });
    } catch (error) {
        console.error('❌ Failed to start:', error);
        process.exit(1);
    }
}

start();