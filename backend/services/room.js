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

async function deleteRoom(roomId) {
  try {
    await pool.query(`DELETE FROM room where id = ${roomId};`);
  }
  catch (error) {
    console.error("Error deleting room", error);  }
}

async function verifyIntegrity(roomId) {
  // room should have correct number of cards and seats
  const deckLength = await pool.query(`SELECT COUNT(*) FROM card WHERE room_id = ${roomId};`); // replace with Card Service?
  const seatLength = await pool.query(`SELECT COUNT(*) FROM seat WHERE room_id = ${roomId};`);
  if (deckLength.rows[0].count != DECKS * 52 || seatLength.rows[0].count != (SEATS + 1)) {
    await repairRoom(roomId);
    return true;
  }
  return false;
}

async function repairRoom(roomId) {
  console.error('Room is broken. Repairing...');
  // Delete any data that is there
  try {
    await pool.query(`DELETE FROM seat WHERE room_id = ${roomId};`);
    await pool.query(`DELETE FROM card WHERE room_id = ${roomId};`);
  }
  catch (error) {
    console.error('Error deleting seats and cards', error);
  }
  // Add cards and seats
  await addDeck(roomId, DECKS);
  await addSeats(roomId, SEATS);

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
    // console.log(`SELECT ${fields} FROM account WHERE room_id = ${roomId};`);
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

    console.log('update room turn', activeSeats)

    // If room turn is null set to 0
    // If turn === last element.number in activeSeats set turn to 0;

    // UPDATE THE DB so this check is not necessary NOT NULL and default 0
    if (room.current_turn === null || room.current_turn === activeSeats[activeSeats.length - 1].number ) {
      // turn = 0;
      return await pool.query(`UPDATE room SET current_turn = 0 WHERE id = ${roomId};`);
    }

    // Strong suspicion that this can be done cleaner.
    let turn = room.current_turn;
    while (turn < activeSeats[activeSeats.length - 1].number) {
      turn += 1;
      if (activeSeats.find(seat => seat.number === turn)) {
        // break;
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
  // activateRoom,
  // deactivateRoom,
  deleteRoom,
  assignAccount,
  unassignAccount,
  getPlayerRoom,
  getPlayers,
  updateAction,
  nextTurn,
}