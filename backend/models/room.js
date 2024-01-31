const { pool } = require('../dbconnection.js');

async function findAllRooms() {
  let query = `SELECT * FROM room`;
  let results = await pool.query(query);
  return results.rows;
}

async function findRoom(roomId) {
    let query = `SELECT * FROM room WHERE id = $1`;
    let values = [roomId];
    let results = await pool.query(query, values);
    return results.rows[0];
}

async function setRoomStatus(roomId, status){
  let query = `UPDATE room SET status = $1 WHERE id = $2`;
  let values = [status, roomId];
  await pool.query(query, values);
}

async function setActiveSeat(roomId, seatNumber) {
  let query = `UPDATE room SET active_seat_number = $1 WHERE id = $2`;
  let values = [seatNumber, roomId];
  await pool.query(query, values);
}

async function setAction(roomId, action) {
  let query = `UPDATE room SET player_action = $1 WHERE id = $2`;
  let values = [action, roomId];
  await pool.query(query, values);
}

module.exports = {
  findAllRooms,
  findRoom,
  setRoomStatus,
  setActiveSeat,
  setAction,
} 