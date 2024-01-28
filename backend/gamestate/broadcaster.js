const { pool } = require('../dbconnection.js');

const {data, createRoom} = require('./gameData.js');

const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000', {
  autoConnect: true
});

socket.on('connect', function (socket) {
  console.log('Server connected to the server! wow');
});

socket.on('update connected clients count', function (data){
  console.log('update count', data);
});

let connectedClientsInRoomCount = 0;

async function updateGameDataObjects(roomId) {
  if (!data[roomId]) {
    await createRoom(roomId);
  }
  console.log(data);
  const roomResults = await pool.query('SELECT * FROM room WHERE id = $1', [roomId]);
  data[roomId].room = roomResults.rows[0];
  // Get cards in room
  const cardResults = await pool.query('SELECT * FROM card WHERE room_id = $1', [roomId]);
  data[roomId].cards = cardResults.rows;
  // Get seats in room
  const seatResults = await pool.query('SELECT seat.id, seat.number, seat.room_id, seat.account_active_id, seat.account_next_id, seat.status, account.username, account.is_bot FROM seat LEFT JOIN account ON seat.account_active_id = account.id WHERE seat.room_id = $1 ORDER BY seat.number', [roomId]);
  data[roomId].seats = seatResults.rows;
  // Get hands in room through seats
  const handResults = await pool.query('SELECT hand.id, hand.seat_id, seat.number as seat_number FROM hand JOIN SEAT ON hand.seat_id = seat.id WHERE room_id = $1', [roomId]);
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

async function requestConnectedClientsCount(roomId) {
  console.log("Inside requestConnectedClientsCount")
  // let count = await new Promise((resolve) => {
    let count = await new Promise(resolve => socket.emit('request connected clients count', {
      roomId: roomId,
    }, (response) => resolve(connectedClientsInRoomCount = response)))
  //   socket.emit('request connected clients count', {
  //     roomId: roomId,
  //   }, (response) => { connectedClientsInRoomCount = response });
  // // }, resolve => resolve(response));
  console.log('count', connectedClientsInRoomCount, count);
  return connectedClientsInRoomCount;
}

module.exports = {
  io: io,
  socket: socket,
  updateGameDataObjects: updateGameDataObjects,
  requestConnectedClientsCount: requestConnectedClientsCount,
}