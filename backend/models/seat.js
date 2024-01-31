const { pool } = require('../dbconnection');

async function addSeatsToRoom(roomId, seatAmount) {
  // insert seats into seat table, equal to amount defined in room db table
  let values = [...Array(seatAmount + 1).keys()].map((index) => `(${roomId}, ${index})`).join(','); // extra for the dealer seat. dealer seat is 0
  await pool.query(`INSERT INTO seat (room_id, number) VALUES ${values};`);
}

async function clearSeatsStatus(roomId) {
  let query = `UPDATE seat SET account_active_id = null WHERE status = 'Inactive' AND room_id = $1`;
  let values = [roomId];
  await pool.query(query, values);
}

async function inactivateSeat(seatId) {
  let query = `UPDATE seat SET status = 'Inactive' WHERE id = $1`;
  let values = [seatId];
  await pool.query(query, values);
} 

async function setSeatsStatus(roomId, status) {
  // If account next is not null then move to active 
  // First move all players from inactive seats and replace them with the next player or null;
  let values1 = [roomId];
  let query1 = `UPDATE seat SET account_active_id = account_next_id WHERE room_id = $1 AND status = 'Inactive';`;
  await pool.query(query1, values1);
  // Second set all next players to null
  let query2 = `UPDATE seat SET account_next_id = NULL WHERE room_id = $1;`;
  await pool.query(query2, values1);
  // Update all seats that have a player in them to active
  let query = `UPDATE seat SET status = $1 WHERE room_id = $2 AND account_active_id IS NOT NULL`;
  let values = [status, roomId];
  await pool.query(query, values);
}

async function assignAccountToSeat(accountId, seatId) {
  // Set any seats the player is in to inactive
  let query1 = `UPDATE seat SET status = 'Inactive' WHERE account_active_id = $1`;
  let values1 = [accountId];
  await pool.query(query1, values1);
  // Set any seats where the player is next to null
  let query2 = `UPDATE seat SET account_next_id = NULL WHERE account_next_id = $1`;
  let values2 = [accountId];
  await pool.query(query2, values2);
  let query = `UPDATE seat SET account_next_id = $1 WHERE id = $2`;
  let values = [accountId, seatId];
  await pool.query(query, values);
}

module.exports = {
  addSeatsToRoom,
  clearSeatsStatus,
  inactivateSeat,
  setSeatsStatus,
  assignAccountToSeat,
}