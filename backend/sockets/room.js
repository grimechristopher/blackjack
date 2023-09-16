const roomService = require('../services/room.js');
const seatService = require('../services/seat.js');
const cardService = require('../services/card.js');

const USER_ID = 1;

module.exports = async function(socket, io) {

  // On Connection check to see if player is active in room seat and handle if true
  /// get auth headers to get user Id then do rest of logic
  const active = await seatService.getActiveSeat(USER_ID);

  if (active) {
    await updateRoom(active.room_id, socket, io);
  }

  socket.on('connection', async function () {
    console.log("user conenectf and handlign in room sockjet")
  });

  socket.on('join room', async function (data) {
    await updateRoom(data.roomId, socket, io);

  });

  socket.on('leave room', async function (data) {
    const roomId = await roomService.unassignAccount(USER_ID);
    socket.leave('Room_' + roomId);
  });
}

// Nothing to handle here. This should be handled in the game manager
// async function handleTableReset() {
//   console.log('TODO: Handle table reset')
// }

// This is too complex and needs to be broken down
async function updateRoom(roomId, socket, io) {
  try {
    await roomService.unassignAccount(USER_ID);
    socket.leave('Room_' + roomId);
    // Join new room
    socket.join('Room_' + roomId);

    await roomService.assignAccount(roomId, USER_ID);
    const players = await roomService.getPlayers(roomId);
    const seats = await seatService.getSeats(roomId);
    const userSeat = seats.find(seat => seat.account_id === USER_ID && seat.status === 'Ready'); // Will need to update for the multiple different statuses
    const deckLength = await cardService.getRemainingDeckLength(roomId);
    const hands = await seatService.getHands(roomId);
    const cards = await cardService.getCardsInHands(roomId);

    // Move logic to game manager?
    // if (response.hasTableReset) {
    //   handleTableReset(response.hasTableReset);
    // }

    const roomInfo = {
      id: roomId,
      seats: seats,
      players: players,
      userSeatId: userSeat ? userSeat.id : null,
      deckLength: deckLength,
      hands: hands,
      cards: cards,
    }
    // Give everyone in the room including the sender all the information about the room. ?
    io.to('Room_' + roomId).emit('player joined room', roomInfo);
  }
  catch (error) {
    console.log(error);
  }
}