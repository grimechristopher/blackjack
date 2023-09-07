const { Pool, Client } = require('pg');

const credentials = {
  user: 'postgres',
  host: 'localhost',
  database: 'cards',
  password: 'pgGrime06',
  port: 5432,
}

const pool = new Pool(credentials);

module.exports = {
  pool,
}
