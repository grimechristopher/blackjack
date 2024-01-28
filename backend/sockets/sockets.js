// import gameManager from '../gameStateManager.js';
// const gameManager = require('../gameStateManager.js');
module.exports = {
  io: (server) => {
    const { Server } = require("socket.io");
    const io = new Server(server, {
      cors: {
        origins: ["http://localhost:8080",],
      }
    });

    io.use((socket, next) => {
      console.log('socket.io middleware')
      // const { token } = socket.handshake.auth;
      // if (token !== "Test") {
      //   return next(new Error("authentication error"));
      // }
      next();
    });


    io.on('connection', async (socket) => { //async correct?
      console.log('a new user connected');

      // // Authentication
      // const { token } = socket.handshake.auth;
      // console.log(token);

      // // import specific functionality
      require('./authentication.js')(socket, io);
      require('./room.js')(socket, io);
      require('./game.js')(socket, io);
      // require('./seat.js')(socket, io);

      // // On disconnect
      // socket.on('disconnect', () => {
      //   console.log('user disconnected');

      // })
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
  
      // socket.on('register', (data) => {
      //   console.log('register', data);
      // });

    });

  },
}