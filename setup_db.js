import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, 'database', 'mathtutor.db');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

console.log('🗄️  Setting up database...');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error creating database:', err);
        process.exit(1);
    }
    console.log('✅ Database created/opened at:', dbPath);
});

const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('❌ Error executing schema:', err);
        process.exit(1);
    }
    console.log('✅ Schema created successfully');
    db.close();
    console.log('🎉 Database setup complete!');
});