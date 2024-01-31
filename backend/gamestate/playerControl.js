const { data } = require('./gameData.js');
const seatModel = require('../models/seat.js');
const roomModel = require('../models/room.js');
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

      // Check if player has made a decision
      if (data[roomId].room.player_action !== null) {
        console.info(`Room ${roomId}: Player ${data[roomId].room.player_action}`);
        resolve(); // resolve the interval if player made a decision
        clearInterval(playerInterval);
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


module.exports = {
  handleTurn,
  playerActionStand,
}