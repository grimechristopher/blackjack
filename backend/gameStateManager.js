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

let players = [];
let seats = [];
let hands = [];
let room = {};


/*
I need to simplify/organize this heavily!
There is a room.current_turn that tracks who's turn it is.
There is a room.loop_status that tracks the activity of the loop. [Inactive, Begin, Active, Finishing]
There is a room.current_action that tracks what action is being taken. [Start, Dealing, Moving, Calculating, Awaiting Input, Finished]
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

async function handleState(roomId) {
  // Variables that determine the state of the game
  // room.current_turn
  // room.curent_action
  // room.isactive
  // seat.status
  console.log("handle state")
  await updateGameInfo(roomId); // Always start loop by grabbing the most up to date game info

  // Clean up table
  // Remove finished players and activate ready players
  await updateSeatStatuses(roomId);

  // Room is new. Set action to start and current turn to 0(Dealer)
  if (room.current_action === null) {
    room.current_action = 'Start';
    roomService.updateAction(roomId, 'Start');
  }

  if (room.current_turn === null) {
    room.current_turn = 0;
    roomService.nextTurn(roomId);
  }

  if (room.current_action === 'Start' && room.current_turn === 0) {
    handleDealersTurn(roomId);
  }
  if (room.current_action === 'Moving' && room.current_turn === 0) {
    console.log("Dealer is up and we need to calculate")
  }
  else if (room.current_turn > 0) {
    console.log("Current turn", room.current_turn)
    handlePlayersTurn(roomId);
  }
  else {
    // handle Error
    console.error("Error: Invalid game state. Current action is not Start and current turn is not 0(Dealer)", room.current_action, room.current_turn)
  }

}

async function playerJoined(userId) { // Start game loop
  await getGameInfo(userId); // Grab stored game info from db
  if (room.isactive === false || room.isactive === null) {
    room.isactive = true;
    await roomService.activateRoom(room.id);
  }
  // While game state is active ?
  while (room.isactive === true) {
    await handleState(room.id);
  }
}

async function playerLeft(userId) { // End game loop
  // Room should be deactivated if all players leave
  await getGameInfo(userId); // Grab stored game info from db
  readySeats = seats.filter(seat => seat.status === 'Ready' || seat.status === 'Active');
  if (readySeats.length === 0) {
    room.gameState = false;
    // Also deactivate the room in db.
    await roomService.deactivateRoom(room.id);
  }
}

async function getGameInfo(userId) {
  const roomId = await roomService.getPlayerRoom(userId)

  console.log("Geting Game Info")
  await updateGameInfo(roomId);
}

async function updateGameInfo(roomId) {
  console.log("Updating Game Info")
  players = await roomService.getPlayers(roomId);
  seats = await seatService.getSeats(roomId);
  room = await roomService.getRoom(roomId);
}

async function updateSeatStatuses(roomId) {
  seats = await seatService.updateStatuses(roomId);
}

async function handleDealersTurn(roomId) {
  roomService.updateAction(roomId, 'Dealing');
  await seatService.refreshHands(roomId);
  // Dealer will be dealing cards to all active players
  hands = await seatService.getHands(roomId); // only players/seats with status of active will have hands
  console.log("hands", hands)
  // Deal cards to active seats
  await cardService.initialDeal(roomId, hands);
  cards = await cardService.getCardsInHands(roomId);

  // Get the cards from the deck and update the cards with the hand.
  socket.emit('notifyHandsHaveChanged', {
    roomId: roomId,
    hands: hands,
  });

  socket.emit('notifyCardsHaveChanged', {
    roomId: roomId,
    cards: cards,
  });

  // Dealers turn is over.
  // update turn to next seat that is active.
  roomService.updateAction(roomId, 'Moving');
  roomService.nextTurn(roomId);

  // console.log(cards);
}

async function handlePlayersTurn(roomId) {
  // Handling Players Turn
  let currentSeat = seats.filter(seat => seat.number === room.current_turn);

  if (currentSeat.status !== 'Active' || currentSeat.status !== 'Finished') {
    roomService.nextTurn(roomId);
  }

  // Handle finshed by player Standing


  // If the player hit then the rooms status is calculating
  if (room.current_action === 'Calculating') {
    // Determine if player busted
    // Bust set hand status to bust move to next player
    // With the room Id get the cards in the hands of the seat the player is in

    // const user =
    // calculateHands(cards);
    console.log("Calculating")
    await calculateActiveHands(roomId);

    room.isactive = false; // TEMP to pause game loop
    // else set hand status to Awaitng Input
  }


  // roomService.updateAction(roomId, 'Awaiting Input');
}

async function playerHit(userId, seatId, handId) {
  // only users playing can make actions
  if (!userId || !seatId) {
    return;
  }
  // Check db for whos turn it is and if action is being waited for.
  const seat = await seatService.getSeat(seatId);
  room = await seatService.getRoom(seatId);
  const roomId = room.id;

  if (userId !== seat.account_id || seat.number !== room.current_turn || room.current_action !== 'Awaiting Input') {
    return;
  }

  // Give the player a card.
  await cardService.dealCard(roomId, handId);

  seats = await seatService.getSeats(roomId);
  cards = await cardService.getCardsInHands(roomId);
  socket.emit('notifySeatsHaveChanged', {
    roomId: roomId,
    seats: seats,
  });

  socket.emit('notifyCardsHaveChanged', {
    roomId: roomId,
    cards: cards,
  });

  await roomService.updateAction(roomId, 'Calculating');
  // room.current_action = 'Calculating'

}

async function playerStand(userId, seatId) {
  // only users playing can make actions
  if (!userId || !seatId) {
    console.log("Rjected")
    return;
  }
  // Check db for whos turn it is and if action is being waited for.


  console.log("Good");
}

async function calculateActiveHands(roomId) {
  const cards = await cardService.getCurrentPlayersCards(roomId);
  console.log("Cards found", cards)

  let bustCount = 0;
  const handIds = [...new Set(cards.map(card => card.hand_id))];

  console.log("Here")
  handIds.forEach((handId) => {
    const handSum = cards.filter(card => card.hand_id === handId).reduce((sum, card) => sum + card.value, 0);
    console.log(handSum);
    if (handSum > 21) {
      bustCount += 1;
    }
  });
  console.log("Here2")
  room.isactive = false; // TEMP to pause game loop
  if (bustCount === handIds.length) {
    // player is bust in all hands and cannot continue
    await roomService.updateAction(roomId, 'Moving');
    roomService.nextTurn(roomId);
  }
  else {
    // player can continue
    await roomService.updateAction(roomId, 'Awaiting Input');
  }

  console.log('hand ids')
}

module.exports = {
  playerJoined,
  playerLeft,

  playerHit,
  playerStand,
}
