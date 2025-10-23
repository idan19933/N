// debug-users.js
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nexon',
    password: '12345678',
    port: 5432,
});

async function debug() {
    try {
        const client = await pool.connect();

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 ALL USERS IN DATABASE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const users = await client.query('SELECT * FROM users ORDER BY id');

        if (users.rows.length === 0) {
            console.log('⚠️  No users found!\n');
        } else {
            users.rows.forEach((user, i) => {
                console.log(`User ${i + 1}:`);
                console.log(`   Database ID: ${user.id}`);
                console.log(`   Firebase UID: ${user.firebase_uid || '❌ NULL'}`);
                console.log(`   Name: ${user.name || 'NULL'}`);
                console.log(`   Email: ${user.email || 'NULL'}`);
                console.log('');
            });
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 NOTEBOOK ENTRIES:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const notebooks = await client.query('SELECT student_id, COUNT(*) as count FROM notebook_entries GROUP BY student_id');

        if (notebooks.rows.length === 0) {
            console.log('⚠️  No notebook entries found!\n');
        } else {
            notebooks.rows.forEach(nb => {
                console.log(`   Student ID ${nb.student_id}: ${nb.count} entries`);
            });
            console.log('');
        }

        client.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

debug();