const { pool } = require('./dbconnection.js');

const MAX_SEATS = 8;

async function addPlayerToRoom(roomId) {
  // TODO: Calculate userId
  let userId = 1;

  // Check if user is in account_room table
  // if not then add user id and room id to account_room table
  // return success
  try {
    let { rows } = await pool.query(`INSERT INTO account_room (account_id, room_id) VALUES (${userId}, ${roomId});`);
    console.log(rows);
  }
  catch (error) {
    if (error.code === '23505') {
      console.log('User already in room');
      // return;
    }
    else {
      console.log(error);
    }
  }

  // gather room data
  // console.log(tableSeats);
  let deckLength = await pool.query(`SELECT COUNT(*) FROM card WHERE room_id = ${roomId};`);
  let seats = await pool.query(`SELECT * FROM seat WHERE room_id = ${roomId} ORDER BY seat_number;`);
  let playersInRoom = await pool.query(`SELECT * FROM account_room JOIN account ON account_room.account_id = account.id WHERE room_id = ${roomId};`);
  let activePlayers = await pool.query(`SELECT * FROM account WHERE id IN (SELECT account_id FROM seat WHERE room_id = ${roomId});`);
  const roomInfo = {
    deckLength: deckLength.rows[0].count, // gotta be a better way to do this
    seats: seats.rows,
    playersInRoom: playersInRoom.rows,
    activePlayers: activePlayers.rows,
    roomId: roomId, // Sure why not pass this back
  }
  console.log(roomInfo)
  return roomInfo;

}

async function removePlayerFromRoom(roomId) {
  // TODO: Calculate userId
  let userId = 1;

  // delete row with user id and room id from account_room table
  try {
    console.log(`DELETE FROM account_room WHERE account_id = ${userId} AND room_id = ${roomId};`)
    let { rows } = await pool.query(`DELETE FROM account_room WHERE account_id = ${userId} AND room_id = ${roomId};`);
    console.log(rows);
  }
  catch (error) {
    if (error.code === '42703') {
      console.log('User already not in room');
      return;
    }
    console.log(error);
  }
}

async function createRoom(roomId) {
  // delete row with user id and room id from account_room table
  try {
    // console.log(`DELETE FROM account_room WHERE account_id = ${userId} AND room_id = ${roomId};`)
    let { rows } = await pool.query(`INSERT INTO room DEFAULT VALUES returning id;`);
    console.log(rows);
    return rows;
  }
  catch (error) {
    // if (error.code === '42703') {
    //   console.log('User already not in room');
    //   return;
    // }
    console.log(error);
  }
}

async function deleteRoom(roomId) {
  let { rows } = await pool.query(`DELETE FROM room where id = ${roomId};`);
}

async function addCardsToRoom(roomId, decksAmount) {
  try {
    // Create decks
    // Insert into cards table
    const cards = await createDecks(decksAmount);
    // console.log(cards)

    let values = cards.map((card) => `(${card.value}, '${card.face}', '${card.suit}', ${roomId})`).join(',');
    await pool.query(`INSERT INTO card (card_value, face, suit, room_id) VALUES ${values};`);
    // Card will be a db table
    // Columns needed are value, face?, suit, room, and I suppose hand.
    // Lack of hand id would mean the card is in the deck
    // Dealer can be hand 0;
    // Do I also need a player id?



    // let { rows } = await pool.query(`INSERT INTO room DEFAULT VALUES returning id;`);
    // console.log(rows);
    // return rows;
  }
  catch (error) {
    console.log(error);
  }
}

async function createDecks(amount) {
  let decks = [];

  for (let i = 0; i <  amount; i++) {
    decks.push(...createDeck())
  }

  return decks;
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

async function addSeatsToRoom(roomId, amount) {
  // let result = await pool.query(`SELECT * FROM seat WHERE room_id = ${roomId};`);
  // let tableSeats = result.rowCount;

  // if (tableSeats !== MAX_SEATS) {
    // Create an array of incrementing numbers then map it to form a array of values, one for the room id and one for the seat number
    let values = [...Array(amount+1).keys()].map((i) => `(${roomId}, ${i})`).join(','); // extra for the dealer seat. dealer seat is 0
    await pool.query(`DELETE FROM seat WHERE room_id = ${roomId};`);
    await pool.query(`INSERT INTO seat (room_id, seat_number) VALUES ${values};`);
  // }
}

async function assignPlayerToSeat(seatId, roomId) {
  const userId = 1;

  console.log("Seat id:", seatId);

  // dont allow players in dealers seats


  // remove player from other seats. // Probably should add a check to see if the player can sit at new seat first?
  await pool.query(`UPDATE seat SET account_id = null WHERE account_id = ${userId}`);

  // Sit player at seat and return seat info.
  let { rows } = await pool.query(`UPDATE seat SET account_id = ${userId} WHERE id = ${seatId} AND account_id IS NULL AND seat_number != 0 RETURNING account_id;`);
  console.log(roomId)
  let activePlayers = await pool.query(`SELECT * FROM account WHERE id IN (SELECT account_id FROM seat WHERE room_id = ${roomId});`);


  if (rows.length > 0) {
    return {
      accountId: rows[0].account_id,
      seatId: seatId,
      activePlayers: activePlayers.rows,
    }
  }
  return null;
}


// async function createDeckCards

module.exports = {
  addPlayerToRoom,
  removePlayerFromRoom,
  createRoom,
  addCardsToRoom,
  addSeatsToRoom,
  deleteRoom,
  assignPlayerToSeat,
}