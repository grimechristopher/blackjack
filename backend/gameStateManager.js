const io = require('socket.io-client');
const socket = io.connect('http://localhost:3001', {
  autoConnect: true
});

socket.on('connect', function (socket) {
  console.log('Server connected to the server! wow');
});

const roomService = require('./services/room.js');
const seatService = require('./services/seat.js');
const cardService = require('./services/card.js');
const accountService = require('./services/account.js');

let players = [];
let seats = [];
let hands = [];
let cards = [];
let room = {};


/*
I need to simplify/organize this heavily!
There is a room.current_turn that tracks who's turn it is.
There is a room.loop_status that tracks the activity of the loop. [Inactive, Beginning, Active, Finishing]
There is a room.current_action that tracks what action is being taken. [Start, Dealing, Moving, Calculating, Awaiting Input, Finished]
Room.round_count will track what round the game is on.  Nope actually will increment on any player action as well
There is a seat.status that tracks the status of the seat. [Ready, Active, Finished]

Room loop will handle the starting and stopping of the game loop.
The loop starts when a player joins an inactive room.
The loop Changes to a finishing state when all players leave the room.
An active loop will continue as long as a player is playing.
A beginning loop will prepare the game for the first turn.

current turn will track whos turn it is. and prevent other players from submitting actions.

current action will track what action the game loop should be performing
Start is before dealers first turn.
Dealing is when the dealer is starting the round
Moving is when the turn is changing from one player to the next
Calculating is when the loop is calculating the results of a players action
Awaiting Input is when the loop is waiting for a player to submit an action
Finished is when the loop is finished and the dealer is about to take their turn and calculate winners.

Seat status will determine
Ready - Player just took seat
Active - Player is playing currently
Finished - Player is finished playing

At the end of the round finished players will have their stats recorded and be removed. Ready players will move to active. Anyone sitting in the "on deck" position in a seat will be moved to seat and set as active
*/

// Loop Starter and Loop Ender
// A game starts when a player joins a game that is inactive
// A game ends when the last player leaves a game that is active
async function startLoop(userId) {
  // Grab stored game info from db
  const roomId = await roomService.getPlayerRoom(userId)
  await updateGameInfo(roomId);

  // Check if room is inactive OR finishing
  if (room.loop_status === 'Inactive' || room.loop_status === 'Finishing') {
    // Activate the room
    // Set loop status to begin
    console.log("First player joined")
    room.loop_status = 'Beginning';
    await roomService.updateStatus(roomId, 'Beginning'); // TODO
    // While loop status is begining or active run the game loop
    while (room.loop_status === 'Beginning' || room.loop_status === 'Active' || room.loop_status === 'Finishing') {
      console.log(room.loop_status);
      await handleState(roomId);
    }
  }
  // else: game loop is already running and nothing needs to trigger
}

async function endLoop(userId) {
  // Grab stored game info from db
  // let roomId = room.id;
  // if (userId) {
  //   roomId = await roomService.getPlayerRoom(userId);
  // }
  // // await updateGameInfo(roomId);

  // // Check to see if there are any active seats in the rooom and if not deactivate the room
  // roomId = await roomService.getPlayerRoom(userId);
  // const readySeats = seats.filter(seat => seat.status === 'Ready' || seat.status === 'Active');

  // if (readySeats.length === 0) {
  //   console.log("All Players Left")
  //   // room.loop_status = 'Finishing';
  //   await roomService.updateStatus(roomId, 'Finishing');
  // }
}


// Update all info about the game
async function updateGameInfo(roomId) {
  players = await roomService.getPlayers(roomId);
  seats = await seatService.getSeats(roomId);
  room = await roomService.getRoom(roomId);
}

async function handleState(roomId) {
  await updateGameInfo(roomId);

  if (room.loop_status === 'Inactive') {
    console.log("Inactive loop")
    // Do nothing
    return;
  }

  // Active, beginning, finishing all have actions the loop needs to complete
  // The action is determined by the current turn

  if (room.loop_status === 'Beginning') {
    // A new game is starting
    console.log('Room is beginning');
    room.loop_status = 'Active';
    room.current_action = 'Start';
    await roomService.updateStatus(room.id, 'Active');
    await roomService.updateAction(roomId, 'Start');
  }

  if (room.loop_status === 'Active' || room.loop_status === 'Finishing') { // ? or finishing?
    console.log("Room is active")
    console.log("Current turn is ", room.current_turn)


    if (room.current_action === 'Awaiting Input' && room.current_turn > 0) {
      await handlePlayersTurn(roomId, room.current_turn, room.round_count);
    }
    else if (room.current_action === 'Moving') {
      console.log("Moving seats")
      room.current_turn = await roomService.nextTurn(roomId)

      room.current_action = 'Awaiting Input';
      await roomService.updateAction(roomId, 'Awaiting Input');

      // Notify everyone that the active turn has changed.
      socket.emit('notifyTurnHasChanged', {
        roomId: roomId,
        turn: room.current_turn,
      });
    }
    else if (room.current_action === 'Start') {
      // Remove hands leftover from previous round and insert a single hand to all seats. Update count
      console.log("Handle Start");
      await seatService.updateStatuses(roomId);
      await seatService.refreshHands(roomId);
      await roomService.updateRoundCount(roomId);

      room.current_action = 'Dealing';
      await roomService.updateAction(roomId, 'Dealing');
    }
    else {
      // This is the dealers turn
      await handleDealersTurn(roomId);
    }
  }

  console.log("handle state end");
}

async function handleDealersTurn(roomId) {
  // Dealers action depends on what the current action is.
  if (room.current_action === 'Dealing') {

    // Dealer will be dealing cards to all active players
    hands = await seatService.getHands(roomId); // only players/seats with status of active will have hands

    if (hands.length <= 1) {
      console.log("WELL LOOK AT WHAT WE HAVE HERE")
      // room.current_action === 'Finished'
      // room.loop_status = 'Finishing';
      // await roomService.updateAction(roomId, 'Finished');
      // await roomService.updateStatus(room.id, 'Finishing')
      // return;
    }
    // Deal cards to active seats
    await cardService.initialDeal(roomId, hands);
    cards = await cardService.getCardsInHands(roomId);

    // Notify all in the room of changes to hands and cards
    socket.emit('notifyHandsHaveChanged', {
      roomId: roomId,
      hands: hands,
    });

    socket.emit('notifyCardsHaveChanged', {
      roomId: roomId,
      cards: cards,
    });

    // The current action is now moving the active seat to the next player.
    await roomService.updateAction(roomId, 'Moving');
  }

  else {
    // Made it around the table, it is the dealers turn to determine winner
    console.log("Loop is in else", room.current_action);
    console.log("Made it around the table")
    room.current_action = 'Finished';
    await roomService.updateAction(roomId, 'Finished'); // duh

    // DO DEALER DRAWING CARDS HERE !
    // Dealer Drawing cards if under 17.
    hands = await seatService.getHands(roomId);
    const dealersHand = hands.find(hand => hand.seat_id === seats.find(seat => seat.number === 0).id);
    const dealersCards = cards.filter(card => card.hand_id === dealersHand.id);

    // console.log("HANDS ARE :", hands);
    let dealersSum = 0;
    dealersSum = calculateHandValue(dealersCards);
    console.log("BEFORE", dealersSum);
    // (async () => {
      while (dealersSum < 17) {
        console.log("INSIDE")
        console.log("Dealer is drawing a card", dealersSum)
        await cardService.dealCard(roomId, dealersHand.id);
        cards = await cardService.getCardsInHands(roomId);
        updatedDealersCards = cards.filter(card => card.hand_id === dealersHand.id);
        dealersSum = calculateHandValue(updatedDealersCards);
      }
    // })
    console.log("AFTER")

    if (dealersSum > 21) {
      dealersSum = 0;
    }


    if (room.current_action === 'Finished') {
      // Calculate Winners and stuff
      determineRoundResults(roomId);

      await cardService.returnCards(roomId);
      console.log("Finished, cards are cleaned up");

      // Notify all in the room of changes to hands and cards
      hands = await seatService.getHands(roomId);
      cards = await cardService.getCardsInHands(roomId);
      socket.emit('notifyHandsHaveChanged', {
        roomId: roomId,
        hands: hands,
      });

      socket.emit('notifyCardsHaveChanged', {
        roomId: roomId,
        cards: cards,
      });
    }

    if (room.loop_status === 'Finishing') {
      console.log('Room is finishing')
      // TODO: Clean up
      room.loop_status = 'Inactive';
      await roomService.updateStatus(room.id, 'Inactive');
    }
    else if (room.loop_status === 'Active' || room.loop_status === 'Beginning') {
      console.log('Room is active')
      room.current_action = 'Start';
      await roomService.updateAction(roomId, 'Start'); // duh
    }
  }


}

async function handlePlayersTurn(roomId, seatNumber, roundCount) { // OMG this is seatNumber
  // Wait for players turn. If the player doesnt make an action in time move to next players turn.
  // If the timeout finishes and the current action is awaiting input and is still the same active seat then the player ran out of time and this loop continues
  // If the seat Id is different or the action is not awaiting input then the player made an action and this loop ends. The game continues with another loop started by the action.

  const seconds = 15;

  // Tell client timer for seat started
  socket.emit('notifyActionTimerStarted', {
    roomId: roomId,
    seatNumber: seatNumber,
    time: seconds,
    // roundCount: roundCount,
  });

  return await new Promise((resolve, reject) => {
    setTimeout(async () => {
      console.log("Inside timeout");
      await checkPlayersTurn(roomId, seatNumber, roundCount)
      resolve();
    }, seconds * 1000);
  });
}

async function checkPlayersTurn(roomId, seatNumber, roundCount) {
  console.log("Checking players turn in room", roomId);
  await updateGameInfo(roomId);
  // console.log(room.current_action, room.current_turn, seatNumber, room.round_count, roundCount)
  if (room.current_action === 'Awaiting Input' && room.current_turn === seatNumber && room.round_count === roundCount) {
    console.log("Player LEFT.")
    // Player ran out of time. No calculations should be necessary. Just move to next player.
    await roomService.updateAction(roomId, 'Moving');
    // Make player leave. Set to finished
    const seat = seats.find(seat => seat.number === seatNumber);
    const accountId = await seatService.unassignAccount(seat.id); /// wow

    // // Check to see if there are any active seats in the rooom and if not deactivate the room
    // roomId = await roomService.getPlayerRoom(userId);
    // await updateGameInfo(roomId);
    seats = await seatService.getSeats(roomId);
    // console.log("Seats after player left", seats);
    const readySeats = seats.filter(seat => seat.status === 'Ready' || seat.status === 'Active');

    if (readySeats.length === 0) {
    //   console.log("All Players Left")
      // room.loop_status = 'Finishing';
      await roomService.updateStatus(roomId, 'Finishing');
    }

    // endLoop(accountId)// need user id
    // console.log(accountId)


    socket.emit('notifySeatsHaveChanged', {
      roomId: roomId,
      seats: seats,
    });
  }
  else {
    // Player made an action. Kill this loop.
    console.log("Player made decision.")
    room.loop_status === 'Inactive';
  }
}

async function determineRoundResults(roomId) {
  await updateGameInfo(roomId);
  // Get dealers cards
  // Compare sums to each of the players
  // Dealer is greater player lost, dealer is less player won, dealer is equal player pushed
  hands = await seatService.getHands(roomId);
  cards = await cardService.getCardsInHands(roomId);
  console.log(cards);


  let results = [];

  const dealersHand = hands.find(hand => hand.seat_id === seats.find(seat => seat.number === 0).id);
  const dealersCards = cards.filter(card => card.hand_id === dealersHand.id);

  // console.log("HANDS ARE :", hands);
  let dealersSum = calculateHandValue(dealersCards);
  if (dealersSum > 21) {
    dealersSum = 0;
  }

  console.log('dealers sum', dealersSum);

  hands.forEach(hand => {
    if (hand.id !== dealersHand.id) { // Skip dealers hand

      let playerCards = cards.filter(card => card.hand_id === hand.id);
      let playerSum = calculateHandValue(playerCards);

      // console.log(seats)
      const accountId = seats.find(seat => seat.id === hand.seat_id).account_id;
      let result = {
        seatId: hand.seat_id,
        accountId: accountId,
        sum: playerSum,
        win: 0,
        loss: 0,
        push: 0,
        blackjack: 0,
        bust: 0,
      };

      // Bust
      if (playerSum > 21) {
        result.bust = 1;
        result.loss = 1;
      }
      // blackjack
      if (playerSum === 21) {
        result.blackjack = 1;
      }
      if (playerSum < 21) {
        // compare to dealers sum
        if (playerSum > dealersSum) {
          result.win = 1;
        }
        if (playerSum === dealersSum) {
          result.push = 1;
        }
        if (playerSum < dealersSum) {
          result.loss = 1;
        }
      }
      results.push(result);
    }
  })

  console.log("Results", results, roomId);
  await accountService.recordResults(results);
  // try {
  // }
  // catch (error) {
  //   room.loop_status = 'Finishing'
  //   console.error("Error in game loop recording results", error);
  // }
}

function calculateHandValue(cards) {
  let sum = 0;
  let acesCount = cards.filter(card => card.value === 1).length;

  cards.forEach(card => {
    // Lower card values over 10 to 10. Why didn't I just make values of JQK all 10? No one knows.
    if (card.value > 10) {
      card.value = 10;
    }

    if (card.value === 1) {
      card.value = 11;
    }

    // add the card to the sum
    sum += card.value
  });

  // Handle Aces
  while (sum > 21 && acesCount > 0) {
    sum -= 10;
    acesCount -= 1;
  }

  return sum;

}

// Player Actions
// Start a new loop on player actions
async function playerStand(userId, seatId) {
  // Gather game info
  const roomId = await roomService.getPlayerRoom(userId)
  await roomService.updateRoundCount(roomId);
  console.log(seatId)
  const seat = await seatService.getSeat(seatId);
  await updateGameInfo(roomId);
  // Block other players from submitting actions
  if (!seat || !seat.number || room.current_turn !== seat.number || room.current_action !== 'Awaiting Input') {
    return;
  }

  // Set current action
  room.current_action = 'Calculating';
  await roomService.updateAction(roomId, 'Calculating');

  // Its the next players turn.
  await roomService.updateAction(roomId, 'Moving');
  // Start up the game loop.
  while (room.loop_status === 'Beginning' || room.loop_status === 'Active' || room.loop_status === 'Finishing') {
    console.log(room.loop_status);
    await handleState(roomId);
  }
}

async function playerHit(userId, seatId, handId) {
  console.log("Player Hit", userId, seatId, handId);
  // Gather game info
  const roomId = await roomService.getPlayerRoom(userId)
  await roomService.updateRoundCount(roomId);
  const seat = await seatService.getSeat(seatId);
  await updateGameInfo(roomId);

  if (!seat || !seat.number || room.current_turn !== seat.number || room.current_action !== 'Awaiting Input') {
    return;
  }

  // Set current action
  room.current_action = 'Calculating';
  await roomService.updateAction(roomId, 'Calculating');

  // Deal a card to the player
  // calculate if bust?
  // If bust next players turn if not bust awaiting input
  await cardService.dealCard(roomId, handId);

  // Notify all in the room of changes to hands and cards
  hands = await seatService.getHands(roomId);
  cards = await cardService.getCardsInHands(roomId);
  socket.emit('notifyHandsHaveChanged', {
    roomId: roomId,
    hands: hands,
  });
  socket.emit('notifyCardsHaveChanged', {
    roomId: roomId,
    cards: cards,
  });

  const cardsInHand = cards.filter(card => card.hand_id === handId);

  let sum = calculateHandValue(cardsInHand);

  // Bust
  if (sum > 21) {
    // Its the next players turn.
    await roomService.updateAction(roomId, 'Moving');

  }
  // blackjack
  if (sum === 21) {
    //blackjack
    // Its the next players turn.
    await roomService.updateAction(roomId, 'Moving');
  }
  if (sum < 21) {
    // Set current action
    room.current_action = 'Awaiting Input';
    await roomService.updateAction(roomId, 'Awaiting Input');
  }

  console.log("Cards in hand", cardsInHand);


  // Start up the game loop.
  while (room.loop_status === 'Beginning' || room.loop_status === 'Active' || room.loop_status === 'Finishing') {
    console.log(room.loop_status);
    await handleState(roomId);
  }
}

async function playerSplit(userId, seatId, handId) {
  // Gather game info
  const roomId = await roomService.getPlayerRoom(userId)
  await roomService.updateRoundCount(roomId);
  console.log(seatId)
  // const seat = await seatService.getSeat(seatId);
  await updateGameInfo(roomId);

  console.log(typeof (cards[0].hand_id), typeof (handId))

  // Check if player can split. get hand and check for two cards with same value.
  const cardsInHand = cards.filter(card => card.hand_id === handId);

  console.log('Splitting cards cards', cards)
  console.log('Splitting cards hand cards length', cardsInHand)

  if (cardsInHand.length !== 2) {
    return;
  }

  if (cardsInHand[0].value !== cardsInHand[1].value) {
    return;
  }

  // Create new hand for seat. Move 2nd card to that hand
  const newHandId = await seatService.addHand(seatId);
  console.log(cardsInHand[1].id, newHandId)
  await cardService.moveCard(cardsInHand[1].id, newHandId);

  // Notify all in the room of changes to hands and cards
  hands = await seatService.getHands(roomId);
  cards = await cardService.getCardsInHands(roomId);
  socket.emit('notifyHandsHaveChanged', {
    roomId: roomId,
    hands: hands,
  });
  socket.emit('notifyCardsHaveChanged', {
    roomId: roomId,
    cards: cards,
  });

  // Set current action
  room.current_action = 'Awaiting Input';
  await roomService.updateAction(roomId, 'Awaiting Input');

  // Start up the game loop.
  while (room.loop_status === 'Beginning' || room.loop_status === 'Active' || room.loop_status === 'Finishing') {
    console.log(room.loop_status);
    await handleState(roomId);
  }
}

// Need a functio to wait x seconds when animations are playing.
function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  startLoop,
  endLoop,

  playerStand,
  playerHit,
  playerSplit,
}