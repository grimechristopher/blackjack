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

async function upsertGameRecord(accountId, records) {
  // check if game record for the account exists
  let query = `SELECT * FROM account_record WHERE account_id = $1`;
  let values = [accountId];
  const accountRecords = await pool.query(query, values);  
  if (accountRecords.rows.length === 0) {
    // create game record for the account
    query = `INSERT INTO account_record (account_id, win, loss, push) VALUES ($1, $2, $3, $4)`;
    values = [accountId, records.win, records.loss, records.push];
    await pool.query(query, values);
  }
  else {
    // update game record for the account
    query = `UPDATE account_record SET win = win + $1, loss = loss + $2, push = push + $3 WHERE account_id = $4`;
    values = [records.win, records.loss, records.push, accountId];
    await pool.query(query, values);
  }
}

module.exports = {
  findByEmail,
  createAccount,
  upsertGameRecord,
} 