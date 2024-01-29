const gsmSpecator = new require('./spectator.js');

async function playerJoinedRoom(playerId, roomId) {
  gsmSpecator.playerJoinedRoom(playerId, roomId);
}

async function playerTookSeat(playerId, seatId) {
  gsmSpecator.playerJoinedRoom(playerId, seatId);
}

module.exports = {
  playerJoinedRoom,
  playerTookSeat,
};