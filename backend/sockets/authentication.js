
module.exports = async function(socket, io) {

  socket.on('register', (data) => {
    console.log('register', data);
  });

  
};