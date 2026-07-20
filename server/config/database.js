const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        logging: false, // ganti menjadi console.log untuk melihat query SQL
    });
} else {
    sequelize = new Sequelize(
        process.env.DB_NAME || 'sistem_arsip_db',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
        }
    );
}

module.exports = sequelize;
