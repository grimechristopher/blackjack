const { pool } = require('./dbconnection.js');

const MAX_SEATS = 8;

// Rooms
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
      console.error('User already in room');
      // return;
    }
    else {
      console.log(error);
    }
  }

  // gather room data
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
  return roomInfo;

}

async function removePlayerFromRoom(roomId) {
  // TODO: Calculate userId
  let userId = 1;

 // TODO
//  remove hands from player
// Remove player from seat


  // delete row with user id and room id from account_room table
  try {
    let { rows } = await pool.query(`DELETE FROM account_room WHERE account_id = ${userId} AND room_id = ${roomId};`);
  }
  catch (error) {
    if (error.code === '42703') {
      console.error('User already not in room');
      return;
    }
    console.log(error);
  }
}


async function updateDeck(cards) {
  // unnest array so postgresql can read it
  // let unnestedArray = "SELECT UNNEST(ARRAY['id']) as id, UNNEST(ARRAY['hand_id']) as hand_id, UNNEST(ARRAY['room_id']) as room_id FROM card;";
  // await pool.query(`UPDATE card SET (room_id, hand_id) = () WHERE id = ${userId}`);
  // let cardsJSONString = JSON.stringify(cards);
  let values = cards.map((card) => `(${card.id}, ${card.room_id}, ${card.hand_id})`).join(',');

  let query = `UPDATE card set (room_id, hand_id) = (values ${values}) AS v (id, room_id, hand_id) WHERE v.id = card.id;`;
  console.log(query);
  await pool.query(query);
  // "UPDATE card SET (room_id, hand_id) = ()"
}

// Seats
async function addSeatsToRoom(roomId, amount) {
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

async function unassignPlayerFromSeat(seatId, roomId) {
  const userId = 1;

  // Remove player from seat
  // Cards should leave hands ... after the round is over not when player gets up
  await pool.query(`UPDATE seat SET account_id = null WHERE account_id = ${userId}`);

  return null;
}

// GAME STATE INFO
async function getGameInfo(userId) {
  const room = await pool.query(`SELECT * FROM account_room JOIN room ON account_room.room_id = room.id WHERE account_id = ${userId};`);
  const seat = await pool.query(`SELECT * FROM seat WHERE account_id = ${userId} ORDER BY seat_number;`); // I dont think I care
  let players = await pool.query(`SELECT * FROM account JOIN seat ON account.id = seat.account_id WHERE account.id IN (SELECT account_id FROM seat WHERE room_id = ${room.rows[0].id}) ORDER BY seat_number;`);


  // Create hands for players that dont have a hand
  console.log("players:", players.rows);

  // hands have a relationship to players. Each hand has an account_id.
  // I want to insert a hand for each player sitting in this room that does not have a hand already.
  // To do that I need to get the id of each player that is sitting in a seat in this room that does not have a hand and insert a hand into the hand table with that account id.
  await pool.query(`INSERT INTO hand (account_id) SELECT account_id FROM seat WHERE room_id = ${room.rows[0].id} AND account_id NOT IN (SELECT account_id FROM hand) AND account_id IS NOT NULL;`);



  const hands = await pool.query(`SELECT * FROM hand WHERE account_id IN (SELECT account_id FROM seat WHERE room_id = ${room.rows[0].id});`) // Broken?
  const dealersHand = await pool.query(`SELECT * FROM card WHERE room_id = ${room.rows[0].id} AND hand_id = 0;`);
  const deck = await pool.query(`SELECT * FROM card WHERE room_id = ${room.rows[0].id} AND hand_id IS NULL;`)

  players.rows.forEach(player => {
    player.hands = hands.rows.filter(hand => hand.account_id === player.id);
  });

  console.log(players.rows)

  return {
    room: room.rows[0],
    seat: seat.rows[0],
    players: players.rows,
    dealersHand: dealersHand.rows,
    deck: deck.rows,
  }
}


module.exports = {
  addPlayerToRoom,
  removePlayerFromRoom,
  // createRoom,
  // addCardsToRoom,
  updateDeck,
  addSeatsToRoom,
  // deleteRoom,
  assignPlayerToSeat,
  unassignPlayerFromSeat,
  getGameInfo,
}