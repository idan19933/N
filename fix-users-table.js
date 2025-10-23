// fix-users-table.js - Make columns nullable for Firebase users
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nexon',
    password: '12345678',
    port: 5432,
});

async function fixTable() {
    try {
        console.log('🔧 Fixing users table for Firebase authentication...\n');
        const client = await pool.connect();

        // Make name nullable (we can get it from Firebase later)
        console.log('1. Making name nullable...');
        await client.query('ALTER TABLE users ALTER COLUMN name DROP NOT NULL');
        console.log('   ✅ Done\n');

        // Make email nullable (we can get it from Firebase later)
        console.log('2. Making email nullable...');
        await client.query('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
        console.log('   ✅ Done\n');

        // Make password nullable (using Firebase auth, not password)
        console.log('3. Making password nullable...');
        await client.query('ALTER TABLE users ALTER COLUMN password DROP NOT NULL');
        console.log('   ✅ Done\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Users table fixed!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Test auto-create
        console.log('🧪 Testing auto-create...\n');

        const testUid = 'test-' + Date.now();
        const result = await client.query(
            'INSERT INTO users (firebase_uid) VALUES ($1) RETURNING id',
            [testUid]
        );

        console.log(`✅ Success! Created user with ID: ${result.rows[0].id}\n`);

        // Clean up
        await client.query('DELETE FROM users WHERE firebase_uid = $1', [testUid]);
        console.log('🧹 Cleaned up test user\n');

        console.log('🎉 Ready to use!\n');

        client.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
        process.exit(1);
    }
}

fixTable();