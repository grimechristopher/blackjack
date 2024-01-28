const db = require('../models/room.js');
const gsm = require('../gamestate/entryPoints.js');

const seatModel = require('../models/seat.js');

function unassignAccount() {
  console.log('unassignAccount');
  
}

function assignAccount() {
  console.log('assignAccount');
}

module.exports = async function(socket, io) {
  io.use((socket, next) => {
    console.log('socket.io middleware')
    // const { token } = socket.handshake.auth;
    // if (token !== "Test") {
    //   return next(new Error("authentication error"));
    // }
    next();
  });

  socket.on('getRoomList', async function () {
    const roomList = await db.findAllRooms();
    socket.emit('updateRoomList', roomList);
  });

  socket.on('joinRoom', async function (data) {
    // TODO: Get id of player from token
    // User enters the room as a spectator
    const room = await db.findRoom(data.roomId);
    // Leave all other rooms so that user is not updated with those events
    socket.rooms.forEach(room => {if (room !== socket.id) {socket.leave(room);}});
    // Join the room socket
    socket.join(room.name);
    // Notify sockets that a new spectator has joined
    socket.broadcast.to(room.name).emit('userJoined Announcment', `Spectator has joined ${room.name}`);
    // Game state manager needs to handle a player joining the room.
    await gsm.playerJoinedRoom(null, data.roomId);
  });

  socket.on('assign seat', async function (data) {
    const accountId = 1; // Get account id from token
    seatModel.assignAccountToSeat(accountId, data.seatId);
  });
};