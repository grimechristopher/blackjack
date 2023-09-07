const db = require('../query.js');

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

      socket.on('join room', async function (data) {
        console.log('join room', data.roomId);
        // console.log("ROOM", db.addPlayerToRoom(data.roomId))
        let roomInfo = await db.addPlayerToRoom(data.roomId);
        socket.emit('joined room', roomInfo);
      });

      socket.on('leave room', function (data) {
        console.log('leave room');
        db.removePlayerFromRoom(data.roomId);
        socket.emit('left room');
      });

      socket.on('delete room', function (data) {
        console.log('delete room');
        db.deleteRoom(data.roomId);
        socket.emit('deleted room');
      });

      socket.on('take seat', async function (data) {
        console.log('take seat');
        const seatInfo = await db.assignPlayerToSeat(data.seatId, data.roomId);
        console.log(seatInfo)
        socket.emit('assigned seat', seatInfo); // Need to change this to update everyone
      });



      socket.on('foo', function (data) {
        console.log('wtf');
      });

      socket.on('take seat', function (data) {
        console.log('sitting at table');
      });

      socket.on('leave seat', function (data) {
        console.log('sitting at table');
      });

      socket.on('disconnect', () => {
        console.log('user disconnected');

        // TODO: remove anyone disconnecting from the account_room table
      })

    });
  },
}