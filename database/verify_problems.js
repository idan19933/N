// verify_problems.js - CHECK DATABASE
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function verifyProblems() {
    const db = await open({
        filename: './database/mathtutor.db',
        driver: sqlite3.Database
    });

    console.log('🔍 Checking database...\n');

    // Check if table exists
    const tables = await db.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='math_problems'"
    );

    if (tables.length === 0) {
        console.log('❌ math_problems table does NOT exist!');
        console.log('💡 Run: node setup_db.js');
        await db.close();
        return;
    }

    console.log('✅ math_problems table exists');

    // Count problems
    const count = await db.get('SELECT COUNT(*) as count FROM math_problems');
    console.log(`📊 Total problems: ${count.count}\n`);

    if (count.count === 0) {
        console.log('⚠️  Database is empty!');
        console.log('💡 Run: node database/generate_large_repository.js\n');
    } else {
        // Show breakdown
        const breakdown = await db.all(`
            SELECT topic, level, COUNT(*) as count
            FROM math_problems
            GROUP BY topic, level
            ORDER BY topic, level
        `);

        console.log('📊 Problems by topic/level:');
        breakdown.forEach(b => {
            console.log(`  ${b.topic}/${b.level}: ${b.count}`);
        });
    }

    await db.close();
}

verifyProblems().catch(console.error);