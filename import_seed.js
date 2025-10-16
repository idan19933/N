import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, 'database', 'mathtutor.db');
const seedPath = path.join(__dirname, 'database', 'seed_problems.sql');

console.log('📊 Importing seed data...');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err);
        process.exit(1);
    }
});

const seed = fs.readFileSync(seedPath, 'utf8');

db.exec(seed, (err) => {
    if (err) {
        console.error('❌ Error importing seed data:', err);
        console.error(err.message);
        process.exit(1);
    }
    console.log('✅ Seed data imported successfully');

    db.get('SELECT COUNT(*) as count FROM math_problems', (err, row) => {
        if (err) {
            console.error('❌ Error counting problems:', err);
        } else {
            console.log(`📊 Total problems in database: ${row.count}`);
        }
        db.close();
        console.log('🎉 Import complete!');
    });
});