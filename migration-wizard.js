import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function header(text) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${text}`);
  console.log('='.repeat(60) + '\n');
}

function success(text) {
  console.log(`✅ ${text}`);
}

function info(text) {
  console.log(`ℹ️  ${text}`);
}

function error(text) {
  console.log(`❌ ${text}`);
}

async function main() {
  header('🚀 Database Schema Migration Wizard');
  
  console.log('This wizard will help you export your database schema.\n');
  console.log('Enter your database connection details:\n');
  
  const host = await question('Database host (default: localhost): ') || 'localhost';
  const port = await question('Database port (default: 5432): ') || '5432';
  const database = await question('Database name: ');
  const user = await question('Database user: ');
  const password = await question('Database password: ');
  
  if (!database || !user) {
    error('Database name and user are required!');
    rl.close();
    return;
  }
  
  info('Connecting to database and exporting schema...\n');
  
  const pool = new Pool({ host, port, database, user, password });
  
  try {
    const client = await pool.connect();
    
    const tablesQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    const tables = await client.query(tablesQuery);
    
    info(`Found ${tables.rows.length} tables`);
    
    let sql = `-- Exported Schema from ${database}\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n\n`;
    
    for (const table of tables.rows) {
      const tableName = table.tablename;
      
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = $1
        ORDER BY ordinal_position;
      `;
      const columns = await client.query(columnsQuery, [tableName]);
      
      sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      sql += columns.rows.map(col => {
        let def = `  ${col.column_name} ${col.data_type}`;
        if (col.character_maximum_length) def += `(${col.character_maximum_length})`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        return def;
      }).join(',\n');
      sql += '\n);\n\n';
    }
    
    const migrationsDir = path.join(process.cwd(), 'server', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
    const outputFile = path.join(migrationsDir, `${timestamp}_exported_schema.sql`);
    
    fs.writeFileSync(outputFile, sql);
    
    await client.release();
    await pool.end();
    
    success(`Schema exported to: ${outputFile}\n`);
    console.log('✅ Next steps:');
    console.log('1. Review the file: ' + outputFile);
    console.log('2. Test locally: npm run migrate');
    console.log('3. Commit: git add . && git commit -m "Add schema"');
    console.log('4. Deploy: git push origin main\n');
    
  } catch (err) {
    error(`Export failed: ${err.message}`);
  }
  
  rl.close();
}

main().catch(err => {
  error(`Error: ${err.message}`);
  process.exit(1);
});
