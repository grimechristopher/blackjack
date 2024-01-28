const {data} = require('./gameData.js');
const broadcaster = require('./broadcaster.js');
const botAi = require('./botAi.js');

const roomModel = require('../models/room.js');
const seatModel = require('../models/seat.js');
const handModel = require('../models/hand.js');

async function start(roomId) {
  console.info(`${data[roomId].room.name}: Starting a new game loop` );
  // Set the room status to active
  roomModel.setRoomStatus(data[roomId].room.id, 'Active');
  data[roomId].room.status = 'Active';
  // Set the rooms taken seats to active 
  await seatModel.setSeatsStatus(data[roomId].room.id, 'Active');

  while (data[roomId].room.status === 'Active') {
    // console.log('\n\n\n\n\n\n\n\n\n\n\n\n ACTIVE TABLE')
   /// //// //// /// GAME LOOP
    // Remove all hands in room through seats
    // Create a hand for each seat
    await handModel.resetHands(data[roomId].room.id);
    
    await dealInitialCards(roomId);
    // Move to the next player
    const playerSeats = data[roomId].seats.sort((a, b) => a.number - b.number).filter(seat => seat.number !== 0 && seat.account_active_id !== null);
  
    for (let seat of playerSeats) {
      console.info(`${data[roomId].room.name}: Moving to next player in seatId ${seat.id}`);
      if (seat.is_bot) {
        await handleBotTurn(roomId, seat.id);
      }
      else {
        await handlePlayerTurn(seat.id);
      }
      // await handModel.moveTurnToNextPlayer(seat.id);
      // await broadcaster.updateGameDataObjects(data[roomId].room.id);
    }
  
    // Dealers Turn
  
    // /// ///// //////  End loop
    await debugEndLoop(roomId)
  }

  




}

async function dealInitialCards(roomId) {
  console.info(`${data[roomId].room.name}: Start dealing cards`);
  await broadcaster.updateGameDataObjects(data[roomId].room.id);
  // Give each active player cards // Should I use a for of loop here?
  // Each active seat has a hand and only each active seat has a hand
  // If I need to pause to give UI and players time then a loop should allow for that
  // Blackjack, each player gets 2 cards.
  for (let i of [1, 2]) {
    // Deal first to players in order of seat number
    const playerHands = data[roomId].hands.filter(hand => hand.seat_number !== 0);
    for (let hand of playerHands) {
      console.info(`${data[roomId].room.name}: Dealing cards to player handId ${hand.id} in seatId ${hand.seat_id}`);
      await handModel.dealCard(hand.id, data[roomId].cards);
      // Update clients after each card
      await broadcaster.updateGameDataObjects(data[roomId].room.id);
    }
    // Now deal to the dealer
    const dealerHand = data[roomId].hands.filter(hand => hand.seat_number === 0)[0]; // Only should be one dealer seat
    console.info(`${data[roomId].room.name}: Dealing cards to dealer handId ${dealerHand.id} in seatId ${dealerHand.seat_id}`);
    await handModel.dealCard(dealerHand.id, data[roomId].cards);
    // Update clients after each card
    await broadcaster.updateGameDataObjects(data[roomId].room.id);
  }  
}

async function handleBotTurn(roomId, seatId) {
  await botAi.handleTurn(roomId, seatId);
}

async function handlePlayerTurn(seatId) {
  console.log("Player turn", seatId);
}


async function debugEndLoop(roomId) {
  // If theres still sockets spectating then continue the loop. If not then end the loop
  try {
    let socketsCount = await broadcaster.requestConnectedClientsCount(data[roomId].room.name);
    console.log(socketsCount)
    // const sockets = await broadcaster.socket.in(data[roomId].room.id).fetchSockets();
    // const socketIds = sockets.map(socket => socket.id);
    if (socketsCount > 0) {
      console.info(`${data[roomId].room.name}: DEBUG There are still sockets spectating. Continuing the game loop`);
      return;
    }
    console.info(`${data[roomId].room.name}: DEBUG Ending the game loop`);
    await roomModel.setRoomStatus(data[roomId].room.id, 'Inactive');
    data[roomId].room.status = 'Inactive';
  }
  catch (error) {
    console.error(`${data[roomId].room.name}: ERROR Ending the game loop`, error);
    await roomModel.setRoomStatus(data[roomId].room.id, 'Inactive');
    data[roomId].room.status = 'Inactive';
  }
}

module.exports = {
  start,
};