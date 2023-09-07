// const db = require('../query.js');
const seatService = require('../services/seat.js');
const gameManager = require('../gameStateManager.js');

const USER_ID = 1;

module.exports = function(socket, io) {
  socket.on('take seat', async function (data) {
    await seatService.assignAccount(data);
    let seats = await seatService.getSeats(data.room_id);

    gameManager.playerJoined(USER_ID);

    socket.emit('took seat', data.id);
    io.to('Room_' + data.room_id).emit('player took seat', seats);
  });

  socket.on('leave seat', async function (data) {
    await seatService.unassignAccount(data);
    let seats = await seatService.getSeats(data.room_id);

    socket.emit('left seat', null);
    io.to('Room_' + data.room_id).emit('player left seat', seats);
  });
}
