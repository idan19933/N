import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'server', 'migrations');
    
    // Create migrations directory if it doesn't exist
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('Created migrations directory');
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Execute migrations that haven't been run yet
    for (const file of migrationFiles) {
      const { rows } = await client.query(
        'SELECT name FROM migrations WHERE name = $1',
        [file]
      );
      
      if (rows.length === 0) {
        console.log(`Running migration: ${file}`);
        const migrationSQL = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf8'
        );
        
        await client.query('BEGIN');
        try {
          await client.query(migrationSQL);
          await client.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
          console.log(`✓ Migration ${file} completed successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      } else {
        console.log(`⊘ Migration ${file} already executed, skipping`);
      }
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(error => {
  console.error('Failed to run migrations:', error);
  process.exit(1);
});
