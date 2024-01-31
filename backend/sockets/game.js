module.exports = async function(socket, io) {
  socket.on('emit_updateGame', async function (data) {
    socket.broadcast.to(data.roomName).emit('updateGame', data.data); // Probably could work on naming 
  });

  socket.on('emit_updateActiveSeatTimer', async function (data) {
    console.log("emit_updateActiveSeatTimer", data)
    socket.broadcast.to(data.roomName).emit('updateActiveSeatTimer', data.timeLeft);
  });

  socket.on('request connected clients count', async function (data, callback) {
    const sockets = await io.in(data.roomId).fetchSockets();
    const socketIds = sockets.map(socket => socket.id);

    await callback(socketIds.length);
  });
};