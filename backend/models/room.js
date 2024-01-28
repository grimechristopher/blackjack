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

module.exports = {
  findAllRooms,
  findRoom,
  setRoomStatus,
} 