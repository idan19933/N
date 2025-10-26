// server/config/database.js
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Only load .env in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

console.log('?? DATABASE_URL exists?', !!process.env.DATABASE_URL);
console.log('?? NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('? Database connected');
});

pool.on('error', (err) => {
    console.error('? Database error:', err);
});

export default pool;

