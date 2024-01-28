const { pool } = require('../dbconnection');

async function resetHands(roomId) {
  try {
    // Remove leftover hands
    await pool.query(`DELETE FROM hand USING seat WHERE hand.seat_id = seat.id AND seat.room_id = $1;`, [roomId]);
    // Create a hand for each active seat and the dealer
    await pool.query(`INSERT INTO hand (seat_id) SELECT id FROM seat WHERE (room_id = $1 AND status = 'Active') OR (room_id = $1 AND number = 0);`, [roomId]);
  }
  catch (error) {
    console.error("error refreshing hands", error);
  }
}

async function dealCard(handId, deck) {
  try {
        // wait 1 second
        console.log("Waiting 1 second")
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Done waiting 1 second")
    // I only want cards that arent in a hand
    const undeltCards = deck.filter(card => card.hand_id === null); // remove cards with a han
    const card = undeltCards.sort(() => 0.5 - Math.random()).slice(0, 1)[0]; // Randomly shuffle array of deck and take the first card
    console.log('card', card);
    await pool.query(`UPDATE card SET hand_id = $1 WHERE id = $2`, [handId, card.id]);
    console.info(`Dealt card ${card.id} to handId ${handId}`);
  }
  catch (error) {
    console.error(`error dealing card to handId, ${handId}`, error);
  }
}

async function splitHand(hand, cards) {
  try {
    const newHand = await pool.query(`INSERT INTO hand (seat_id) VALUES ($1) RETURNING *`, [hand.seat_id]);
    console.log("newHand", newHand.rows[0]);
    console.log("cards", newHand.rows[0].id, cards);
    await pool.query(`UPDATE card SET hand_id = $1 WHERE id = $2`, [newHand.rows[0].id, cards[1].id]);
  }
  catch (error) {
    console.error("error splitting hand", error);
  }
}

module.exports = {
  resetHands,
  dealCard,
  splitHand,
}