const { pool } = require('../dbconnection.js');

const {data} = require('./gameData.js');
const broadcaster = require('./broadcaster.js');
const gameLoop = require('./gameLoop.js');

const roomModel = require('../models/room.js');
const seatModel = require('../models/seat.js');
const cardModel = require('../models/card.js');

async function playerJoinedRoom(playerId, roomId) {
  if (playerId) {
    console.info(`Room ${roomId}: Player ${playerId} joined the room`);
  }
  else {
    console.info(`Room ${roomId}: Spectator joined the room`);
  }
  // The room needs to be validated. The correct number of cards needs to be in the deck. The correct number of seats needs to be assigned to the room.
  // If the validate fails. Delete the cards and seats from the room and set up the room again.
  const isValidRoom = await validateRoom(roomId);
  console.info(`${data[roomId].room.name}: is valid -- ${isValidRoom}`);
  if (!isValidRoom) {
    await pool.query('DELETE FROM card WHERE room_id = $1', [roomId]);
    await pool.query('DELETE FROM seat WHERE room_id = $1', [roomId]);
    await initializeRoom(roomId);
  }
  // Room is valid.
  // If room is inactive AND there are players in the seats (bots) then start the game. GIVE THE PEOPLE SOMETHING TO LOOK AT
  // Inactive room + players = bots and the game needs to start
  if (data[roomId].room.status === "Inactive" && data[roomId].seats.filter(seat => seat.account_active_id !== null).length > 0) {
    console.info(`${data[roomId].room.name}: is inactive and there are players at the table.`);
    await gameLoop.start(roomId);
  }
  else {
    // Game loop is either started or has no players
    console.info(`${data[roomId].room.name}: is active or there are no players at the table.`);
  }
}

async function validateRoom(roomId) {
  // Get room info
  try {
    await broadcaster.updateGameDataObjects(roomId);

    if (data[roomId].seats.length !== data[roomId].room.seats_amount + 1 && data[roomId].cards.length !== data[roomId].room.deck_amount * 52) {
      // +1 for dealer seat
      return false;
    }
    return true;
  }
  catch (err) {
    // If any of the queries fail, then the room is invalid.
    console.error(err);
    return false;
  }
}

async function initializeRoom() {
  try {
    await seatModel.addSeatsToRoom(data[roomId].room.id, data[roomId].room.seat_amount);
    await cardModel.addDecksToRoom(data[roomId].room.id, data[roomId].room.deck_amount);
    await roomModel.setRoomStatus(data[roomId].room.id, 'Inactive');

    // Update room info
    await broadcaster.updateGameDataObjects(data[roomId].room.id);
  }
  catch (err) {
    console.error(err);
  }
}


module.exports = {
  playerJoinedRoom,
  validateRoom,
  initializeRoom,
}
