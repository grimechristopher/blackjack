const express = require('express');
const app = express();

// CORS
const cors = require("cors");
app.use(cors());

// Import routes
const roomRouter = require('./routes/room.js');

// use routes
app.use("/api/room/", roomRouter);

app.get('/api/', (req, res) => {
  res.send('Hello World!');
});

// const { pool } = require('./dbconnection.js');

module.exports = app;