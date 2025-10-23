// check-db.js
import 'dotenv/config';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load .env from server folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, 'server', '.env') });

const { Pool } = pg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'nexon',
    password: '12345678',
    port: 5432,
});

async function check() {
    try {
        console.log('🔐 Connecting to database:');
        console.log('   Database: nexon');
        console.log('   User: postgres');
        console.log('   Host: localhost:5432\n');

        const client = await pool.connect();
        console.log('✅ Connected successfully!\n');

        // Check if table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'notebook_entries'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log('❌ Table "notebook_entries" does not exist!\n');
            console.log('Run: node create-table.js\n');
            client.release();
            await pool.end();
            return;
        }

        console.log('✅ Table "notebook_entries" exists\n');

        // Check columns
        const columns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'notebook_entries'
            ORDER BY ordinal_position
        `);

        console.log('📋 Current columns:\n');
        const columnNames = [];
        columns.rows.forEach((col, i) => {
            columnNames.push(col.column_name);
            const marker = col.column_name === 'type' ? ' ✅' : '';
            console.log(`   ${i+1}. ${col.column_name.padEnd(15)} ${col.data_type}${marker}`);
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Check for type column
        if (!columnNames.includes('type')) {
            console.log('❌ Missing "type" column!\n');
            console.log('🔧 To fix, run: node fix-db.js\n');
        } else {
            console.log('✅ All required columns present!\n');

            // Count entries
            const count = await client.query('SELECT COUNT(*) FROM notebook_entries');
            console.log(`📊 Total entries: ${count.rows[0].count}\n`);
        }

        client.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

check();