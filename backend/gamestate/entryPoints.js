const gsmSpecator = new require('./spectator.js');
const playerControl = new require('./playerControl.js');
const gameLoop = new require('./gameLoop.js');

const broadcaster = require('./broadcaster.js');
const { data } = require('./gameData.js');

async function playerJoinedRoom(playerId, roomId) {
  gsmSpecator.playerJoinedRoom(playerId, roomId);
}

async function playerTookSeat(playerId, roomId, seatId) {
  console.info(`Room ${roomId}: Player ${playerId} in seat` );
  await broadcaster.updateGameDataObjects(roomId);
  // playerControl.playerTookSeat(playerId, roomId, seatId);
// async function playerTookSeat(playerId, roomId, seatId) {
  if (!data[roomId]) {
    console.error("Room not found");
    return;
  }
  if (data[roomId].room.status === 'Active') {
    console.info(`Room ${roomId}: is already active`);
    return;
  }
  else if (data[roomId].room.status === 'Inactive' && data[roomId].seats.filter(seat => seat.account_next_id !== null).length > 0) {
    // Begin gameloop
    console.info(`Room ${roomId}: Starting game loop` );
    await gameLoop.start(roomId);
    // console.info("Room is active");
  }
// };
}

async function playerActionStand(playerId, roomId) {
  await playerControl.playerActionStand(playerId, roomId);
}

async function playerActionHit(playerId, roomId, handId) {
  await playerControl.playerActionHit(playerId, roomId, handId);
}

async function playerActionSplit(playerId, roomId, handId) {
  await playerControl.playerActionSplit(playerId, roomId, handId);
}

module.exports = {
  playerTookSeat,
  playerJoinedRoom,
  playerActionStand,
  playerActionHit,
  playerActionSplit,
};