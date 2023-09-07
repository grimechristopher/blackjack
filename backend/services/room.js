const { pool } = require('../dbconnection.js');
const cardService = require('./card.js');
const seatService = require('./seat.js');

const DECKS = 8;
const SEATS = 8;

async function getRooms() {
  try {
      const results = await pool.query(`SELECT * FROM room;`);
      return results.rows;
  }
  catch (error) {
      console.error(error);
  }
}

async function getRoom(roomId) {
  try {
      const results = await pool.query(`SELECT * FROM room WHERE id = ${roomId};`);
      return results.rows;
  }
  catch (error) {
      console.error(error);
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
      console.error(error);
  }
}

async function deleteRoom(roomId) {
  try {
    await pool.query(`DELETE FROM room where id = ${roomId};`);
  }
  catch (error) {
      console.error(error);
  }
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

async function assignAccount(roomId, userId) {
  const hasTableReset = await verifyIntegrity(roomId);
  // await unassignAccount(userId)

  console.log(`UPDATE account SET room_id = ${roomId} WHERE id = ${userId};`);
  await pool.query(`UPDATE account SET room_id = ${roomId} WHERE id = ${userId};`);
  // TODO: Tell sockets if room is reset
  return {
    hasTableReset: hasTableReset,
  }
}

async function unassignAccount(userId) {
  const room = await getPlayerRoom(userId)
  await pool.query(`UPDATE account SET room_id = null WHERE id = ${userId};`);
  return room;
}

async function getPlayerRoom(userId) {
  const player = await pool.query(`SELECT * FROM account WHERE id = ${userId};`)
  return player.rows[0].room_id;

}

async function getPlayers(roomId) {
  const fields = 'username';
  const results = await pool.query(`SELECT ${fields} FROM account WHERE room_id = ${roomId};`);
  return results.rows;
}

async function getSeats(roomId) {
  const results = await pool.query(`SELECT * FROM seat WHERE room_id = ${roomId} ORDER BY number;`);
  return results.rows;
}

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  deleteRoom,
  assignAccount,
  unassignAccount,
  getPlayers,
  getSeats,
}