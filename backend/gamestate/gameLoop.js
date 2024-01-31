const {data} = require('./gameData.js');
const broadcaster = require('./broadcaster.js');
const botAi = require('./botAi.js');
const playerControl = require('./playerControl.js');

const roomModel = require('../models/room.js');
const seatModel = require('../models/seat.js');
const handModel = require('../models/hand.js');
const cardModel = require('../models/card.js');
const accountModel = require('../models/account.js');

async function start(roomId) {
  console.info(`${data[roomId].room.name}: Starting a new game loop` );
  // Set the room status to active
  roomModel.setRoomStatus(data[roomId].room.id, 'Active');
  data[roomId].room.status = 'Active';
  // Set the rooms taken seats to active 
  // await seatModel.setSeatsStatus(data[roomId].room.id, 'Active');

  let currentTurn = 0;
  while (data[roomId].room.status === 'Active') {
    await roomModel.setActiveSeat(roomId, 0);
    await broadcaster.updateGameDataObjects(data[roomId].room.id);
   /// //// //// /// GAME LOOP
    // Remove all hands in room through seats
    // Create a hand for each seat
    if (currentTurn === 0) {
      // Set the rooms taken seats to active   
      await seatModel.setSeatsStatus(data[roomId].room.id, 'Active');

      await handModel.resetHands(data[roomId].room.id);
      await broadcaster.updateGameDataObjects(data[roomId].room.id);
      await dealInitialCards(roomId);
      // Move to the next player
      currentTurn = 1;
      // await roomModel.setActiveSeat(data[roomId].room.id, currentTurn);
      // await broadcaster.updateGameDataObjects(data[roomId].room.id);
    }
    
    const playerSeats = data[roomId].seats.sort((a, b) => a.number - b.number).filter(seat => seat.number !== 0 && seat.account_active_id !== null && seat.status === 'Active');  
    if (currentTurn > 0 && currentTurn <= playerSeats.length) {
      await roomModel.setActiveSeat(roomId, playerSeats[currentTurn - 1].number);
      await broadcaster.updateGameDataObjects(data[roomId].room.id);

      console.info(`${data[roomId].room.name}: Moving to next player in seatId ${playerSeats[currentTurn - 1].id}`);
      if (playerSeats[currentTurn - 1].is_bot) {
        await handleBotTurn(roomId, playerSeats[currentTurn - 1].id);
      }
      else {
        await handlePlayerTurn(roomId, playerSeats[currentTurn - 1].id);
        await roomModel.setAction(roomId, null); // Set the rooms action to null since turn has ended
        data[roomId].room.player_action = null;
      }

      currentTurn += 1;
    }
    
    if (currentTurn > playerSeats.length) {
      await roomModel.setActiveSeat(roomId, 0);
      await broadcaster.updateGameDataObjects(data[roomId].room.id);

      const dealerSeat = data[roomId].seats.filter(seat => seat.number === 0)[0];
      await handleDealersTurn(roomId, dealerSeat.id);
      // Dealers Turn
      await determineWinners(roomId);
  
      await finishRound(roomId);
      await broadcaster.updateGameDataObjects(data[roomId].room.id);
      // /// ///// //////  End loop
      await debugEndLoop(roomId)
      currentTurn = 0;
    }

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

async function handlePlayerTurn(roomId, seatId) {
  await playerControl.handleTurn(roomId, seatId);
}

async function handleDealersTurn(roomId, seatId) {
  await botAi.handleDealersTurn(roomId, seatId)
}

async function determineWinners(roomId) {
  // Wait 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000));
  // Loop through hands, compare to dealer, record win or loss.
  const playerSeats = data[roomId].seats.filter(seat => seat.account_active_id !== null);
  const dealerSeat = data[roomId].seats.filter(seat => seat.number === 0)[0];
  const dealerHand = data[roomId].hands.filter(hand => hand.seat_id === dealerSeat.id)[0];
  if (dealerHand.final_value > 21) {
    dealerHand.final_value = 0;
  }
  for (let seat of playerSeats) {
    let hands = data[roomId].hands.filter(hand => hand.seat_id === seat.id);
    for (let hand of hands) {
      console.info(`${data[roomId].room.name}: HandId: ${hand.id} Final value ${hand.final_value} vs Dealer Final value ${dealerHand.final_value}`);
      
      let bust = 0;
      let win = 0;
      let loss = 0;
      let push = 0;

      if (hand.final_value > 21) {
        loss += 1;
      }
      else if (hand.final_value === dealerHand.final_value) {
        push += 1;
      }
      else if (hand.final_value > dealerHand.final_value) {
        win += 1;
      }
      else {
        loss += 1;
      }

      await handModel.setRoundResult(hand.id, bust, win, loss, push);
      await broadcaster.updateGameDataObjects(data[roomId].room.id);

      await accountModel.upsertGameRecord(seat.account_active_id, {
        win: win,
        loss: loss,
        push: push,
      });
    }

  }

};

async function finishRound(roomId) {
  // Take all inactive seats and set them the active player to null
  await cardModel.clearCards(data[roomId].room.id);
  await seatModel.clearSeatsStatus(data[roomId].room.id);

  await broadcaster.updateGameDataObjects(data[roomId].room.id);
}

async function debugEndLoop(roomId) {
  // If theres still sockets spectating then continue the loop. If not then end the loop
  try {
    let socketsCount = await broadcaster.requestConnectedClientsCount(data[roomId].room.name);
    if (socketsCount > 0 && data[roomId].seats.filter(seat => seat.account_active_id !== null).length > 0) {
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