const db = require('../models/room.js');
const gsm = require('../gamestate/entryPoints.js');

const seatModel = require('../models/seat.js');

module.exports = async function(socket, io) {
  socket.on('getRoomList', async function () {
    const roomList = await db.findAllRooms();
    socket.emit('updateRoomList', roomList);
  });

  socket.on('joinRoom', async function (data) {
    // Spectator enters the room as a spectator
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
    const accountId = socket.handshake.auth?.id; // Get account id from token
    if (!accountId) {
      return;
    }

    await seatModel.assignAccountToSeat(accountId, data.seatId);
    await gsm.playerTookSeat(accountId, data.roomId, data.roomId);
  });

  socket.on('player action stand', async function (data) {
    const accountId = socket.handshake.auth?.id; // Get account id from token
    if (!accountId) {
      return;
    }
    await gsm.playerActionStand(accountId, data.roomId);
  });

};
