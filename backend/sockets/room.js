// const db = require('../query.js');
const roomService = require('../services/room.js');
const seatService = require('../services/seat.js');
const cardService = require('../services/card.js');

const USER_ID = 1;

module.exports = function(socket, io) {
  socket.on('join room', async function (data) {
    try {
      const roomId = await roomService.unassignAccount(USER_ID);
      socket.leave('Room_' + roomId);
      // Join new room
      socket.join('Room_' + data.roomId);

      const response = await roomService.assignAccount(data.roomId, USER_ID);
      const players = await roomService.getPlayers(data.roomId);
      const seats = await seatService.getSeats(data.roomId);
      const userSeat = seats.find(seat => seat.account_id === USER_ID && seat.status === 'Ready'); // Will need to update for the multiple different statuses
      const deckLength = await cardService.getRemainingDeckLength(data.roomId);
      // const seats = await seatService.getSeats(data.roomId);

      if (response.hasTableReset) {
        handleTableReset(response.hasTableReset);
      }

      const roomInfo = {
        id: data.roomId,
        seats: seats,
        players: players,
        userSeatId: userSeat ? userSeat.id : null,
        deckLength: deckLength,
      }
      // Give everyone in the room including the sender all the information about the room. ?
      io.to('Room_' + data.roomId).emit('player joined room', roomInfo);
    }
    catch (error) {
      console.log(error);
    }
  });

  socket.on('leave room', async function (data) {
    const roomId = await roomService.unassignAccount(USER_ID);
    socket.leave('Room_' + roomId);
  });
}

async function handleTableReset() {
  console.log('TODO: Handle table reset')
}