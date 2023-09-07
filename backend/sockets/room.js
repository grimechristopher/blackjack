const io = require('../sockets/room.js');

function main() {
  io.of('room').on('connection', (socket) => {
    console.log('a new user connected');

  socket.on('joinRoom', function(data)  {
    socket.emit('join', {text: "MADE IT "});
    console.log('joining room');
  });

  socket.on('join room', function(data)  {
    console.log('join room');
  });

  socket.on('leave room', function(data)  {
    console.log('leave room');
  });

  socket.on('foo', function(data)  {
    console.log('wtf');
  });

  socket.on('take seat', function(data)  {
    console.log('sitting at table');
  });

  socket.on('leave seat', function(data)  {
    console.log('sitting at table');
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');

})
  });
}
