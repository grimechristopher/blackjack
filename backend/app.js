const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CORS
const cors = require("cors");
app.use(cors());

// Middleware to parse cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Import routes
const authRouter = require('./routes/auth.js');
// const roomRouter = require('./routes/room.js');

// use routes
// app.use("/api/room/", roomRouter);
app.use("/api/auth/", authRouter);

app.get('/api/', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;