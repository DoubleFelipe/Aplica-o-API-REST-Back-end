const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const sslEnabled = process.env.DATABASE_SSL === 'true' || isProduction;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false
});

pool.on('error', (error) => {
  console.error('Erro inesperado no pool PostgreSQL:', error.message);
});

module.exports = pool;
