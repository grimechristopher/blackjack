const { data } = require('./gameData.js');
const seatModel = require('../models/seat.js');
const roomModel = require('../models/room.js');
const handModel = require('../models/hand.js');
const broadcaster = require('./broadcaster.js');
const gameLoop = require('./gameLoop.js');

// let playerInterval = null;

async function handleTurn(roomId, seatId) {
  // Set up an interval to check every half second if the player has made a decision
  // Set up a timeout to check it the player ran out of time
  // If the player made a decision or ran out of time then we want to move on with the loop.

  let counter = 0;
  await new Promise( (resolve, reject) => {
    let playerInterval = setInterval( async () => { 
      counter += 0.5;
      await broadcaster.updateActiveSeatTimer(data[roomId].room.name, counter)

      // Check if player has made a decision to stand
      if (data[roomId].room.player_action === 'Stand') {
        console.info(`Room ${roomId}: Player ${data[roomId].room.player_action}`);
        resolve(); // resolve the interval if player made a decision
        clearInterval(playerInterval);
      }

      // If player decided to hit
      if (data[roomId].room.player_action === 'Hit') {
        console.info(`Room ${roomId}: Player ${data[roomId].room.player_action}`);
        // Room action is reset 
        await roomModel.setAction(roomId, null); // Set the rooms action to null since the action has been completed
        data[roomId].room.player_action = null;
        // resolve(); // resolve the interval if player made a decision
        // clearInterval(playerInterval);

        // Check players hand value. handle bust on hand
        // if the player is over on all his hands then the turn is over
        // Otherwise if the player is under on at least one continue the turn and reset the action timer
        counter = 0;
      }

      if (counter >= 20) {
        console.info(`Room ${roomId}: Player ran out of time`)
        // Set seat to inactive
        seatModel.inactivateSeat(seatId, 'Inactive');
        broadcaster.updateGameDataObjects(roomId);
        resolve(); // resolve the interval if player ran out of time
        clearInterval(playerInterval);
      }
    }, 500); // every half second
  });
  // calculate hand total after turn 
  counter = 0; // reset the counter for the next turn
}

async function playerActionStand(playerId, roomId) {
  console.info(`${data[roomId].room.name}: Player ${playerId} is standing`)
  if (!data[roomId]) {
    console.error("Room not found");
    return;
  }
  // Check if player is in active seat
  try {
    let activeSeat = data[roomId].seats.filter(seat => seat.number === data[roomId].room.active_seat_number)[0];
    if (activeSeat.account_active_id === playerId) {
      await roomModel.setAction(roomId, 'Stand');
      data[roomId].room.player_action = 'Stand';
    }
    else {
      console.error(`Room ${roomId}: Player ${playerId}is not in active seat`);
    }
  }
  catch (error) {
    console.error("Player action error", error);
  }
}

async function playerActionHit(playerId, roomId, handId) {
  console.info(`${data[roomId].room.name}: Player ${playerId} is hitting`)
  if (!data[roomId]) {
    console.error("Room not found");
    return;
  }
  if (data[roomId].room.player_action !== null) {
    return; // player already took an action
  }
  // Check if player is in active seat
  try {
    let activeSeat = data[roomId].seats.find(seat => seat.number === data[roomId].room.active_seat_number);
    let activeHand = data[roomId].hands.find(hand => hand.seat_id === activeSeat.id && hand.id === handId);
    // Make sure the hand is in the seat the player is in
    if (activeSeat.account_active_id === playerId && activeHand.seat_id === activeSeat.id) {
      await roomModel.setAction(roomId, 'Hit');
      data[roomId].room.player_action = 'Hit';
      // Deal a card to the player
      await handModel.dealCard(handId, data[roomId].cards);
      await broadcaster.updateGameDataObjects(data[roomId].room.id);
    }
    else {
      console.error(`Room ${roomId}: Player ${playerId}is not in active seat`);
    }
  }
  catch (error) {
    console.error("Player action error", error);
  }
}

async function playerActionSplit(playerId, roomId, handId) {
  console.info(`${data[roomId].room.name}: Player ${playerId} is splitting`)
  if (!data[roomId]) {
    console.error("Room not found");
    return;
  }
  // Check if player is in active seat
  try {
    let activeSeat = data[roomId].seats.find(seat => seat.number === data[roomId].room.active_seat_number);
    let activeHand = data[roomId].hands.find(hand => hand.seat_id === activeSeat.id && hand.id === handId);
    // Make sure the hand is in the seat the player is in
    if (activeSeat.account_active_id === playerId && activeHand.seat_id === activeSeat.id) {
      await roomModel.setAction(roomId, 'Split');
      data[roomId].room.player_action = 'Split';
      // Split the hand
      await handModel.splitHand(activeHand, data[roomId].cards.filter(card => card.hand_id === handId));
      await broadcaster.updateGameDataObjects(data[roomId].room.id);
    }
    else {
      console.error(`Room ${roomId}: Player ${playerId}is not in active seat`);
    }
  }
  catch (error) {
    console.error("Player action error", error);
  }
}


module.exports = {
  handleTurn,
  playerActionStand,
  playerActionHit,
  playerActionSplit,
}