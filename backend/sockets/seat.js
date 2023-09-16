const seatService = require('../services/seat.js');
const gameManager = require('../gameStateManager.js');

const USER_ID = 1;

module.exports = function(socket, io) {
  socket.on('take seat', async function (data) {
    await seatService.assignAccount(data);
    // let seats = await seatService.getSeats(data.room_id);

    gameManager.playerJoined(USER_ID);

    socket.emit('took seat', data.id); // Tell client that they are in a seat
    // io.to('Room_' + data.room_id).emit('player took seat', seats); // I already emit this information from the game manager
  });

  socket.on('leave seat', async function (data) {
    await seatService.unassignAccount(data);
    // let seats = await seatService.getSeats(data.room_id);

    gameManager.playerLeft(USER_ID);

    socket.emit('left seat', null); // Tell client that they left their seat
    // io.to('Room_' + data.room_id).emit('player left seat', seats);
  });

  socket.on('notifySeatsHaveChanged', async function (data) {
    io.to('Room_' + data.roomId).emit('seats updated', data.seats);
  });

  socket.on('notifyHandsHaveChanged', async function (data) {
    io.to('Room_' + data.roomId).emit('hands updated', data.hands);
  });

  socket.on('notifyCardsHaveChanged', async function (data) {
    io.to('Room_' + data.roomId).emit('cards updated', data.cards);
  });


  /// Actions
  // Game manager handles information sent to connected sockets
  socket.on('player hit', async function (data) {
    gameManager.playerHit(USER_ID, data.seatId, data.handId);
  });

  socket.on('player stand', async function (data) {
    gameManager.playerStand(USER_ID, data.seatId);
  });
}