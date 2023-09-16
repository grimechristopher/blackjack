// import gameManager from '../gameStateManager.js';
const gameManager = require('../gameStateManager.js');

module.exports = {
  io: (server) => {
    const { Server } = require("socket.io");
    const io = new Server(server, {
      cors: {
        origins: ["http://localhost:8080",],
      }
    });

    io.on('connection', async (socket) => { //async correct?
      console.log('a new user connected');

      // Authentication
      const { token } = socket.handshake.auth;
      console.log(token);

      // import specific functionality
      await require('./room.js')(socket, io); // await correct?
      require('./seat.js')(socket, io);

      // On disconnect
      socket.on('disconnect', () => {
        console.log('user disconnected');

      })
    });
  },
}