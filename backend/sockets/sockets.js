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

    io.on('connection', (socket) => {
      console.log('a new user connected');

      // Authentication
      const { token } = socket.handshake.auth;
      console.log(token);

      // import specific functionality
      require('./room.js')(socket, io);
      require('./seat.js')(socket, io);

      // On disconnect
      socket.on('disconnect', () => {
        console.log('user disconnected');

      })


      // Game Test Related

      socket.on('start game', () => {
        console.log('start game');
        gameManager.startGame();
        // io.emit('game started');
      })

    });
  },
}