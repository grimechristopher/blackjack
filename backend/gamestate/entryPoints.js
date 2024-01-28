const gsmSpecator = new require('./spectator.js');

async function playerJoinedRoom(playerId, roomId) {
  gsmSpecator.playerJoinedRoom(playerId, roomId);
}

module.exports = {
  playerJoinedRoom,
};