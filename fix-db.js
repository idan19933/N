import pg from 'pg';
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
        console.log('🔍 Checking foreign key constraints...\n');
        const client = await pool.connect();

        // Check foreign keys
        const fkCheck = await client.query(`
            SELECT
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.table_name = 'notebook_entries' 
            AND tc.constraint_type = 'FOREIGN KEY'
        `);

        if (fkCheck.rows.length > 0) {
            console.log('🔗 Foreign Key Constraints:');
            fkCheck.rows.forEach(fk => {
                console.log(`   ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
            });
            console.log('');

            // Get the foreign table name
            const foreignTable = fkCheck.rows[0].foreign_table_name;

            // Check if table exists and get sample IDs
            console.log(`📊 Checking ${foreignTable} table...\n`);

            const count = await client.query(`SELECT COUNT(*) FROM ${foreignTable}`);
            console.log(`   Total records: ${count.rows[0].count}`);

            if (parseInt(count.rows[0].count) > 0) {
                const sample = await client.query(`SELECT * FROM ${foreignTable} LIMIT 5`);
                console.log(`\n📄 Sample ${foreignTable}:\n`);
                sample.rows.forEach((row, i) => {
                    console.log(`   ${i+1}. ID: ${row.id || row.student_id} | Name: ${row.name || row.full_name || 'N/A'}`);
                });

                console.log('\n✅ Use one of these IDs for testing!');
                console.log(`\nExample:`);
                console.log(`curl http://localhost:3001/api/notebook/stats?userId=${sample.rows[0].id || sample.rows[0].student_id}\n`);
            } else {
                console.log(`\n⚠️  ${foreignTable} table is empty!`);
                console.log('\nOptions:');
                console.log('1. Add a student to the table');
                console.log('2. Remove the foreign key constraint (run: node remove-fk.js)');
            }
        } else {
            console.log('✅ No foreign key constraints found!\n');
        }

        client.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

check();