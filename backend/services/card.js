const { pool } = require('../dbconnection.js');

async function createDecks(roomId, decks) {
  let cards = [];

  for (let i = 0; i < decks; i++) {
    cards.push(...createDeck())
  }

  let values = cards.map((card) => `(${card.value}, '${card.face}', '${card.suit}', ${roomId})`).join(',');
  await pool.query(`INSERT INTO card (value, face, suit, room_id) VALUES ${values};`);
}

function createDeck() {
  let deck = [];

  let suits = ['clubs', 'diamonds', 'hearts', 'spades'];
  let cardsPerSuit = 13;

  for (let i = 0; i < suits.length; i++) {
    for (let j = 1; j <= cardsPerSuit; j++) {
      // Handle face
      let face = j;
      switch (face) {
        case 1:
          face = 'A';
          break;
        case 11:
          face = 'J';
          break;
        case 12:
          face = 'Q';
          break;
        case 13:
          face = 'K';
          break;
      }

      let card = {
        value: j,
        face: face,
        suit: suits[i],
      }
      deck.push(card);
    }
  }

  return deck;
}

async function getRemainingDeckLength(roomId) {
  const response = await pool.query(`SELECT COUNT(*) FROM card WHERE room_id = ${roomId} AND hand_id IS NULL;`);
  return response.rows[0].count;
}

module.exports = {
  createDecks,
  getRemainingDeckLength
}