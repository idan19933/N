// add-firebase-uid-column.js
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nexon',
    password: '12345678',
    port: 5432,
});

async function addFirebaseUidColumn() {
    try {
        console.log('🔧 Adding firebase_uid column to users table...\n');
        const client = await pool.connect();

        // Add firebase_uid column
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE
        `);
        console.log('✅ firebase_uid column added!\n');

        // Create index
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_firebase_uid 
            ON users(firebase_uid)
        `);
        console.log('✅ Index created!\n');

        // Show current users
        const users = await client.query('SELECT id, firebase_uid FROM users');
        console.log('📊 Current users:');
        users.rows.forEach(user => {
            console.log(`   ID: ${user.id}, Firebase UID: ${user.firebase_uid || 'NULL'}`);
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎯 NEXT STEPS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. Login to your app');
        console.log('2. Open console (F12) and find your Firebase UID');
        console.log('3. Run: node link-firebase-uid.js YOUR_FIREBASE_UID');
        console.log('');

        client.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

addFirebaseUidColumn();