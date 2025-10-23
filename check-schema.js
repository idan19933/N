// check-users-schema.js - Check if users table allows auto-creation
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nexon',
    password: '12345678',
    port: 5432,
});

async function checkSchema() {
    try {
        const client = await pool.connect();

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 USERS TABLE SCHEMA:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const columns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);

        let canAutoCreate = true;
        const issues = [];

        columns.rows.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? '✅ nullable' : '❌ NOT NULL';
            const hasDefault = col.column_default ? `(default: ${col.column_default})` : '';

            console.log(`   ${col.column_name.padEnd(20)} ${col.data_type.padEnd(25)} ${nullable} ${hasDefault}`);

            // Check if column will block auto-creation
            if (col.is_nullable === 'NO' && !col.column_default && col.column_name !== 'id') {
                issues.push(col.column_name);
                canAutoCreate = false;
            }
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (canAutoCreate) {
            console.log('✅ Table schema allows auto-creation!\n');
        } else {
            console.log('⚠️  Table schema may block auto-creation!\n');
            console.log('Issues with these columns (NOT NULL without default):');
            issues.forEach(col => {
                console.log(`   - ${col}`);
            });
            console.log('\n💡 Fix by making them nullable or adding defaults.\n');
        }

        // Test auto-create
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🧪 TESTING AUTO-CREATE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const testUid = 'test-auto-create-' + Date.now();

        try {
            const result = await client.query(
                'INSERT INTO users (firebase_uid, name, email) VALUES ($1, $2, $3) RETURNING id',
                [testUid, 'Test User', null]
            );

            console.log(`✅ Auto-create works! Created user with ID: ${result.rows[0].id}\n`);

            // Clean up
            await client.query('DELETE FROM users WHERE firebase_uid = $1', [testUid]);
            console.log('🧹 Cleaned up test user\n');

        } catch (error) {
            console.log('❌ Auto-create failed:', error.message);
            console.log('\n💡 You may need to adjust the INSERT query in userRoutes.js\n');
        }

        client.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

checkSchema();