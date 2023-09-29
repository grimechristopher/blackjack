const { pool } = require('../dbconnection.js');
const cardService = require('./card.js');
const seatService = require('./seat.js');

const DECKS = 8;
const SEATS = 8;

async function getRooms() {
  try {
      const results = await pool.query(`SELECT * FROM room ORDER BY id;`);
      return results.rows;
  }
  catch (error) {
      console.error(error);
  }
}

async function getRoom(roomId) {
  try {
      const results = await pool.query(`SELECT * FROM room WHERE id = ${roomId};`);
      return results.rows[0];
  }
  catch (error) {
      console.error("Error getting room", error);
  }
}

async function createRoom() {
  try {
      let { rows } = await pool.query(`INSERT INTO room DEFAULT VALUES returning id;`);
      let roomId = rows[0].id; // get first (and only) room id
      // Part of the process of creating a room is adding cards and seats
      await addDeck(roomId, DECKS);
      await addSeats(roomId, SEATS);

      return roomId;
  }
  catch (error) {
    console.error("Error creating room", error);
  }
}

async function updateStatus(roomId, status) {
  try {
    await pool.query(`UPDATE room SET loop_status = '${status}' WHERE id = ${roomId};`);
  }
  catch (error) {
    console.error("Error activating room", error);
  }
}

async function updateRoundCount(roomId) {
  try {
    await pool.query(`UPDATE room SET round_count = round_count + 1 WHERE id = ${roomId};`);
  }
  catch (error) {
    console.error("Error activating room", error);
  }
}

async function deleteRoom(roomId) {
  try {
    await pool.query(`DELETE FROM room where id = ${roomId};`);
  }
  catch (error) {
    console.error("Error deleting room", error);  }
}

async function addDeck(roomId, decks) {
  // When the room is created, add deck of cards to the room
  await cardService.createDecks(roomId, decks);
}

async function addSeats(roomId, seats) {
  // When the room is created, add seats to the room
  await seatService.createSeats(roomId, seats);
}

async function assignAccount(roomId, userId) { // account service?
  try {
    await pool.query(`UPDATE account SET room_id = ${roomId} WHERE id = ${userId};`);
  }
  catch (error) {
    console.error("Error assigning account", error);
  }
}

async function unassignAccount(userId) {
  const room = await getPlayerRoom(userId)
  await pool.query(`UPDATE account SET room_id = null WHERE id = ${userId};`);
  return room;
}

async function getPlayerRoom(userId) {
  try {
    const player = await pool.query(`SELECT * FROM account WHERE id = ${userId};`)
    return player.rows[0].room_id;
  }
  catch (error) {
    console.error("Error getting player's room", error);
  }
}

async function getPlayers(roomId) {
  try {
    const fields = 'username';
    const results = await pool.query(`SELECT ${fields} FROM account WHERE room_id = ${roomId};`);
    return results.rows;
  }
  catch (error) {
    console.error("Error getting players", error);
  }
}

async function updateAction(roomId, action) {
  try {
    await pool.query(`UPDATE room SET current_action = '${action}' WHERE id = ${roomId};`);
  }
  catch (error) {
    console.error("Error updating action", error);
  }
}

// What a mess. Simplify this.
async function nextTurn(roomId) {
  try {
    const room = await getRoom(roomId);
    const seats = await seatService.getSeats(roomId);

    const activeSeats = seats.filter(seat => seat.status === 'Active' || seat.status === 'Finished'); // assumed sorted by room number

    // If turn === last element.number in activeSeats set turn to 0;
    if (room.current_turn === activeSeats[activeSeats.length - 1].number ) {
      // turn = 0;
      return await pool.query(`UPDATE room SET current_turn = 0 WHERE id = ${roomId};`);
    }

    // Strong suspicion that this can be done cleaner.
    let turn = room.current_turn;
    while (turn < activeSeats[activeSeats.length - 1].number) {
      turn += 1;
      if (activeSeats.find(seat => seat.number === turn)) {
        await pool.query(`UPDATE room SET current_turn = ${turn} WHERE id = ${roomId};`);
        return turn;
      }
    }
    await pool.query(`UPDATE room SET current_turn = 0 WHERE id = ${roomId};`);
    return turn;

  }
  catch (error) {
    console.error("Error updating turn", error);
  }
}

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  updateStatus,
  updateRoundCount,
  deleteRoom,
  assignAccount,
  unassignAccount,
  getPlayerRoom,
  getPlayers,
  updateAction,
  nextTurn,
}