const { pool } = require('../dbconnection');

async function addSeatsToRoom(roomId, seatAmount) {
  // insert seats into seat table, equal to amount defined in room db table
  let values = [...Array(seatAmount + 1).keys()].map((index) => `(${roomId}, ${index})`).join(','); // extra for the dealer seat. dealer seat is 0
  await pool.query(`INSERT INTO seat (room_id, number) VALUES ${values};`);
}

async function clearSeatsStatus(roomId) {
  let query = `UPDATE seat SET status = 'Inactive' WHERE room_id = $1`;
  let values = [roomId];
  await pool.query(query, values);
}

async function setSeatsStatus(roomId, status) {
  let query = `UPDATE seat SET status = $1 WHERE room_id = $2 AND account_active_id IS NOT NULL`;
  let values = [status, roomId];
  await pool.query(query, values);
}

async function assignAccountToSeat(accountId, seatId) {
  // Set any seats the player is in to inactive
  let query1 = `UPDATE seat SET status = 'Inactive' WHERE account_active_id = $1`;
  let values1 = [accountId];
  await pool.query(query1, values1);
  let query = `UPDATE seat SET account_active_id = $1 WHERE id = $2`;
  let values = [accountId, seatId];
  console.log('assignAccountToSeat', query, values);
  await pool.query(query, values);
}

module.exports = {
  addSeatsToRoom,
  clearSeatsStatus,
  setSeatsStatus,
  assignAccountToSeat,
}