const app = require('./app');
const sockets = require('./sockets/sockets.js');

const PORT = process.env.PORT || 3000;

let server = app.listen(PORT, () => {
  console.info(`Server listening on port ${PORT}`);
});

const io = sockets.io(server);