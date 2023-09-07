const { pool } = require('../dbconnection.js');

// Join room
async function joinRoom(userId, roomId) {
    pool.query(`UPDATE account SET room_id = ${roomId} WHERE id = ${userId};`);
}

// leave room
async function leaveRoom(userId) {
    pool.query(`UPDATE account SET room_id = NULL WHERE id = ${userId};`);
}

// get account info
async function getAccountInfo(userId) {
    // Return name seat, room, hands, cards
}

module.exports = {
    joinRoom,
    leaveRoom,
  }