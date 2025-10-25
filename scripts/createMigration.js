import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Usage: npm run migrate:create <migration-name>');
  console.error('Example: npm run migrate:create add_users_table');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
const fileName = `${timestamp}_${migrationName}.sql`;
const migrationsDir = path.join(__dirname, '..', 'server', 'migrations');

// Ensure migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

const template = `-- Migration: ${migrationName}
-- Created: ${new Date().toISOString()}

-- Add your SQL commands here
-- Example:
-- CREATE TABLE IF NOT EXISTS example (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

`;

const filePath = path.join(migrationsDir, fileName);
fs.writeFileSync(filePath, template);

console.log(`✓ Migration file created: ${fileName}`);
console.log(`Location: ${filePath}`);
