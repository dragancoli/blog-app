// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Testiranje konekcije
pool.connect((err) => {
    if (err) {
        console.error('Greška pri konekciji na bazu:', err.stack);
    } else {
        console.log('Uspešno konektovan na PostgreSQL bazu.');
    }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};