const app = require('./app');
const sockets = require('./sockets/sockets.js');

const PORT = process.env.PORT || 3001;

let server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const io = sockets.io(server);