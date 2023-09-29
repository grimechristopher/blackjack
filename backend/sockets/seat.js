const seatService = require('../services/seat.js');
const gameManager = require('../gameStateManager.js');

const USER_ID = 1;

module.exports = function(socket, io) {
  socket.on('take seat', async function (data) {
    await seatService.assignAccount(data);
    const seats = await seatService.getSeats(data.room_id);

    gameManager.startLoop(USER_ID);

    socket.emit('took seat', data.id); // Tell client that they are in a seat
    io.to('Room_' + data.room_id).emit('player took seat', seats); // Tell everyone in the room that seats have changed
  });

  socket.on('leave seat', async function (data) {
    // gameManager.endLoop(USER_ID);

    await seatService.unassignAccount(data.id);
    // let seats = await seatService.getSeats(data.room_id);

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

  // socket.on('notifyTurnHasChanged', async function (data) {
  //   io.to('Room_' + data.roomId).emit('turn updated', data.turn);
  // });

  socket.on('notifyActionTimerStarted', async function (data) {
    console.log('notifyActionTimerStarted')
    io.to('Room_' + data.roomId).emit('action updated', data);
  });

  /// Actions
  // Game manager handles information sent to connected sockets
  socket.on('player hit', async function (data) {
    gameManager.playerHit(USER_ID, data.seatId, data.handId);
  });

  socket.on('player stand', async function (data) {
    console.log('player stand', data)
    if (data.seatId) {
      gameManager.playerStand(USER_ID, data.seatId);
    }
  });

  socket.on('player split', async function (data) {
    console.log('player split', data)
    if (data.seatId) {
      gameManager.playerSplit(USER_ID, data.seatId, data.handId);
    }
  });
}