const { pool } = require('../dbconnection.js');

async function findByEmail(email) {
  let query = `SELECT * FROM account WHERE email = $1`;
  let values = [email];

  let results = await pool.query(query, values);
  return results.rows[0];
}

async function createAccount (account) {
  let query = `INSERT INTO account (username, email, password) VALUES ($1, $2, $3)`;
  let values = [account.username, account.email, account.password];
  
  return await pool.query(query, values);
}


module.exports = {
  findByEmail,
  createAccount,
} 