const { pool } = require('../dbconnection');

async function addDecksToRoom(roomId, deckAmount) {
  let cards = [];

  for (let i = 0; i < deckAmount; i++) {
    cards.push(...createDeck())
  }

  let values = cards.map((card) => `(${card.value}, '${card.suit}', ${roomId})`).join(',');
  await pool.query(`INSERT INTO card (value, suit, room_id) VALUES ${values};`);
};

function createDeck() {
  let deck = [];

  let suits = ['clubs', 'diamonds', 'hearts', 'spades'];
  let cardsPerSuit = 13;

  for (let i = 0; i < suits.length; i++) {
    for (let j = 1; j <= cardsPerSuit; j++) {
      let card = {
        value: j,
        suit: suits[i],
      }
      deck.push(card);
    }
  }

  return deck;
};

module.exports = {
  addDecksToRoom,
};