const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Parse DATABASE_URL if available, or use individual env vars
// DATABASE_URL="mysql://root:@localhost:3307/sistem_arsip_db"
const dbUrl = process.env.DATABASE_URL;
let connectionParams;

if (dbUrl) {
    connectionParams = dbUrl;
} else {
    connectionParams = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sistem_arsip_db',
        port: process.env.DB_PORT || 3306 // Default to 3306 if not specified, though env might have 3307
    };
}

const db = mysql.createPool(connectionParams);

module.exports = db;
