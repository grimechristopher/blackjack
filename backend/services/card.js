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

async function getDeck(roomId) {
  const response = await pool.query(`SELECT * FROM card WHERE room_id = ${roomId} AND hand_id IS NULL;`);
  return response.rows;
}

async function getCardsInHands(roomId) {
  const response = await pool.query(`SELECT * FROM card WHERE room_id = ${roomId} AND hand_id IS NOT NULL;`);
  return response.rows;
}

async function initialDeal(roomId, hands) {
  // deal each provided hand id two cards.
  const deck = await getDeck(roomId);

  let cards = deck.sort(() => 0.5 - Math.random()).slice(0, hands.length * 2); // 2 cards for each active player and the dealer
  let values = [];
  for (let i = 0; i < hands.length; i++) {
    values.push(`(${cards[i+i].id},${hands[i].id}),(${cards[i+i+1].id},${hands[i].id})`);
  }
  // Update cards in deck with new hand ids
  await pool.query(`UPDATE card AS c
                    SET id = a.id, hand_id = a.hand_id
                    FROM unnest(ARRAY[${values.join(",")}]) a(id INTEGER, hand_id INTEGER)
                    WHERE c.id = a.id;`
                  );
}

async function dealCard(roomId, handId) {
  const deck = await getDeck(roomId);
  const card = deck.sort(() => 0.5 - Math.random()).slice(0, 1)[0];
  await pool.query(`UPDATE card SET hand_id = ${handId} WHERE id = ${card.id};`);
}

async function getCurrentPlayersCards(roomId) {
  try {
    const cards = await pool.query(`SELECT card.* FROM card JOIN hand ON card.hand_id = hand.id JOIN seat ON hand.seat_id = seat.id JOIN room ON room.current_turn = seat.number WHERE seat.room_id = ${roomId} AND seat.number = room.current_turn;`)
    return cards.rows;
  }
  catch (error) {
    console.error("Error getting players cards", error);
  }
}

module.exports = {
  createDecks,
  getRemainingDeckLength,
  getCardsInHands,
  initialDeal,
  dealCard,
  getCurrentPlayersCards,
}