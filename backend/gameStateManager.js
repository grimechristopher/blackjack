const db = require('./query.js');

const roomService = require('./services/room.js');
const seatService = require('./services/seat.js');

// const currentSeatNumbersTurn = null;

// const userId = 2;
// const USER_ID = 1;

// let gameInfo = {};
let gameState = 'Inactive';
let seatsTurn = 0;

let players = [];
let seats = [];
let room = {};

async function handleState() {
  if (gameState === 'Active') {
    // Check what turn it is
    if (room.curent_action === null) {
      // The state is not being handled
    }

  }
}

async function playerJoined(userId) {
  gameState = 'Active'; 
  await getGameInfo(userId);
  await handleState();
  // Refresh the players and seats
  // players = await roomService.getPlayers(data.roomId);
  // seats = await seatService.getSeats(data.roomId);

  // if (gameState === 'Inactive') {
  //   await resetGame();
  // }
}

async function resetGame() {
  // gameState = 'Active';
  // seatsTurn = 0;
  // await roomService.verifyIntegrity(data.roomId);
  // await startGame();
}

async function getGameInfo(userId) {
  const roomId = getPlayerRoom(userId)

  console.log("Geting Game Info")
  players = await roomService.getPlayers(roomId);
  seats = await seatService.getSeats(roomId);
  room = await roomService.getRoom(roomId);

}

module.exports = {
  playerJoined,
}
