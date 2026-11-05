const { Pool } = require('pg');
const env = require('./env');

let pool = null;

if (env.DATABASE_URL && env.DATABASE_URL.trim() !== '') {
  const isSsl = env.DATABASE_URL.includes('sslmode=require') || env.NODE_ENV === 'production';
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: false } : false
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle pg client', err);
  });
}

module.exports = {
  pool,
  query: (text, params) => {
    if (!pool) {
      return Promise.reject(new Error('DATABASE_URL is not configured'));
    }
    return pool.query(text, params);
  }
};
