const { Pool } = require('pg');

const credentials = {
  user: 'postgres',
  host: 'localhost',
  database: 'cards',
  password: process.env.DB_PASSWORD,
  port: 5432,
}

const pool = new Pool(credentials);

module.exports = {
  pool,
}
