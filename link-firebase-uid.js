// link-firebase-uid.js
// Usage: node link-firebase-uid.js YOUR_FIREBASE_UID
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nexon',
    password: '12345678',
    port: 5432,
});

async function linkFirebaseUid() {
    try {
        const firebaseUid = process.argv[2];

        if (!firebaseUid) {
            console.log('❌ Error: Firebase UID required!\n');
            console.log('Usage: node link-firebase-uid.js YOUR_FIREBASE_UID\n');
            console.log('Example: node link-firebase-uid.js abc-123-xyz-firebase-uid\n');
            process.exit(1);
        }

        console.log(`🔗 Linking Firebase UID to database user...\n`);
        console.log(`   Firebase UID: ${firebaseUid}\n`);

        const client = await pool.connect();

        // Update user 1 with Firebase UID
        const result = await client.query(
            'UPDATE users SET firebase_uid = $1 WHERE id = 1 RETURNING id, firebase_uid',
            [firebaseUid]
        );

        if (result.rows.length > 0) {
            console.log('✅ Successfully linked!\n');
            console.log('📊 Updated user:');
            console.log(`   Database ID: ${result.rows[0].id}`);
            console.log(`   Firebase UID: ${result.rows[0].firebase_uid}\n`);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎉 SETUP COMPLETE!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Now restart your app and test!');
            console.log('');
        } else {
            console.log('❌ User ID 1 not found in database\n');
        }

        client.release();
        await pool.end();

    } catch (error) {
        if (error.code === '23505') {
            console.error('❌ Error: This Firebase UID is already linked to another user!');
        } else {
            console.error('❌ Error:', error.message);
        }
        await pool.end();
        process.exit(1);
    }
}

linkFirebaseUid();