module.exports = async function(socket, io) {
  io.use((socket, next) => {
    console.log('socket.io middleware')
    // const { token } = socket.handshake.auth;
    // if (token !== "Test") {
    //   return next(new Error("authentication error"));
    // }
    next();
  });

  socket.on('emit_updateGame', async function (data) {
    socket.broadcast.to(data.roomName).emit('updateGame', data.data); // Probably could work on naming 
  });

  socket.on('request connected clients count', async function (data, callback) {
    const sockets = await io.in(data.roomId).fetchSockets();
    const socketIds = sockets.map(socket => socket.id);
    console.log("socketIds", socketIds);
    await callback(socketIds.length);
    // socket.emit('update connected clients count', {
    //   count: socketIds.length,
    // });
  });
};