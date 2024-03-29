const { pool } = require('../dbconnection.js');

const {data, createRoom} = require('./gameData.js');

const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000', {
  autoConnect: true
});

socket.on('connect', function (socket) {
  console.info('Socket broadaster is connected to the server');
});

let connectedClientsInRoomCount = 0;

// TODO: I need to make sure the results are always sorted.
async function updateGameDataObjects(roomId) {
  if (!data[roomId]) {
    await createRoom(roomId); // Creates a new room in data object if one doesn't exist
  }
  // Update all information about the room and tell the socket clients in the room
  const roomResults = await pool.query('SELECT * FROM room WHERE id = $1', [roomId]);
  data[roomId].room = roomResults.rows[0];
  // Get cards in room
  const cardResults = await pool.query('SELECT * FROM card WHERE room_id = $1', [roomId]);
  data[roomId].cards = cardResults.rows;
  // Get seats in room
  const seatResults = await pool.query(
    `SELECT 
      seat.id, seat.number, seat.room_id, seat.account_active_id, seat.account_next_id, seat.status, 
      active_account.id as active_account_id, active_account.username as active_account_username, active_account.is_bot as active_account_is_bot,
      waiting_account.id as waiting_account_id, waiting_account.username as waiting_account_username, waiting_account.is_bot as waiting_account_is_bot
    FROM seat 
    LEFT JOIN account AS active_account 
      ON seat.account_active_id = active_account.id 
    LEFT JOIN account AS waiting_account 
      ON seat.account_next_id = waiting_account.id 
    WHERE seat.room_id = $1
    ORDER BY seat.number`,
    [roomId]);
  data[roomId].seats = seatResults.rows;
  // Get hands in room through seats
  const handResults = await pool.query('SELECT hand.id, hand.seat_id, seat.number as seat_number, hand.round_result, hand.final_value FROM hand JOIN SEAT ON hand.seat_id = seat.id WHERE room_id = $1', [roomId]);
  data[roomId].hands = handResults.rows;

  // Update the connected sockets
  socket.emit('emit_updateGame', {
    roomName: data[roomId].room.name, 
    data: {
      room: data[roomId].room,
      cards: data[roomId].cards,
      seats: data[roomId].seats,
      hands: data[roomId].hands,
    }
  });
}

async function requestConnectedClientsCount(roomName) {
  // Determine number of clients connected to the room. Used to determine if the room is empty of spectators
  await new Promise(resolve => socket.emit('request connected clients count', {
    roomName: roomName,
  }, (response) => resolve(connectedClientsInRoomCount = response)))
  return connectedClientsInRoomCount;
}

async function updateActiveSeatTimer(roomName, time) {
  console.log(`Room ${roomName}: ${time} seconds left on the active seat timer`)
  socket.emit('emit_updateActiveSeatTimer', {
    roomName: roomName,
    timeLeft: 20 - Math.floor(time),
  })
}



module.exports = {
  io: io,
  socket: socket,
  updateGameDataObjects: updateGameDataObjects,
  requestConnectedClientsCount: requestConnectedClientsCount,
  updateActiveSeatTimer: updateActiveSeatTimer,
}