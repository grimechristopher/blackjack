// connect the server as a socket client to the socket server
// const socket = require( './sockets/sockets.js');

// Make the data an array and access data based on what room the client is in

let data = {};

async function createRoom(roomName) {
  data[roomName] = {
    room: {},
    cards: [],
    seats: [],
    hands: [],
  }
}

module.exports = {
  data: data,
  createRoom: createRoom,
  // io: io,
  // socket: socket,

}