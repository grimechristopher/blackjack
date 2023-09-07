const express = require('express');
const app = express();

// CORS
const cors = require("cors");
app.use(cors());



app.get('/', (req, res) => {
  res.send('Hello World!');
});

const { pool } = require('./dbconnection.js');
const db = require('./query.js');

app.get('/create-user/', async (req, res) => { // doesnt do anything yet
  let { rows } = await pool.query('SELECT * FROM account;');
  res.json(rows);
})
app.get('/create-room/', async (req, res) => {
  // Create a room
  let roomIds = await db.createRoom();
  // Add n decks of cards to room

  // Should only ever be one row...
  const decks = 8;
  const seats = 8;
  db.addCardsToRoom(roomIds[0].id, decks);
  db.addSeatsToRoom(roomIds[0].id, seats);

  console.log("app.js",roomIds);
  res.json(roomIds);
})

app.get('/rooms/', async (req, res) => {
  let { rows } = await pool.query('SELECT * FROM room;');
  res.json(rows);
})

module.exports = app;