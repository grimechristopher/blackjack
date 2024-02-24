// import gameManager from '../gameStateManager.js';
// const gameManager = require('../gameStateManager.js');
const jwt = require('jsonwebtoken');

module.exports = {
  io: (server) => {
    const { Server } = require("socket.io");
    const io = new Server(server, {
      cors: {
        origins: ["http://localhost:8080", "http://localhost:3000"],
      },
      withCredentials: true,
      cookie: true,
    });

    io.use((socket, next) => {
      // If the user is logged in then a jwt with user info will be sent with socket requests
      if (socket.request.headers.cookie) {
        // Parse the jwt-auth cookie
        let cookies = socket.request.headers.cookie.split('; ')
        let token;
        cookies.forEach(function(cookie) {
          if (cookie.indexOf("jwt-auth=") === 0) {
              token = cookie.substring("jwt-auth=".length);
          }
        });
        // Decode the token and store information in the socket connection
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.handshake.auth = decoded;
        }
        catch (error) {
          socket.handshake.auth = null;
          console.error("Error decoding jwt token: ", error.message)
        }
        
      }
      next();
    });


    io.on('connection', async (socket) => { //async correct?
      // import specific functionality
      require('./authentication.js')(socket, io);
      require('./room.js')(socket, io);
      require('./game.js')(socket, io);
      // require('./seat.js')(socket, io);

      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
  
    });

  },
}