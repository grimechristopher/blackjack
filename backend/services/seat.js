const { pool } = require('../dbconnection.js');

const USER_ID = 1;

async function createSeats(roomId, seats) {
  // Create an array of incrementing numbers then map it to form a array of values, one for the room id and one for the seat number
  let values = [...Array(seats + 1).keys()].map((index) => `(${roomId}, ${index})`).join(','); // extra for the dealer seat. dealer seat is 0
  await pool.query(`DELETE FROM seat WHERE room_id = ${roomId};`);
  await pool.query(`INSERT INTO seat (room_id, number) VALUES ${values};`);
}

async function getSeats(roomId) { // Room service ...
  const results = await pool.query(`SELECT * FROM seat WHERE room_id = ${roomId} ORDER BY number;`);
  return results.rows;
}

async function getHands(roomId) {
  const results = await pool.query(`SELECT hand.* FROM hand JOIN seat ON hand.seat_id = seat.id WHERE seat.room_id = ${roomId};`);
  return results.rows;
}

async function refreshHands(roomId) {
  // Clear any hands in room
  // Insert a hand for each seat in the room
  try {
    await pool.query(`DELETE FROM hand USING seat WHERE hand.seat_id = seat.id AND seat.room_id = ${roomId};`);
    await pool.query(`INSERT INTO hand (seat_id) SELECT id FROM seat WHERE (room_id = ${roomId} AND status = 'Active') OR (room_id = ${roomId} AND number = 0);`);
  }
  catch (error) {
    console.error("error refreshing hands", error);
  }
}

async function addHand(seatId) {
  try {
      const {rows} = await pool.query(`INSERT INTO hand (seat_id) VALUES (${seatId}) returning id;`);
      console.log(rows)
      let handId = rows[0].id;
      return handId;
  }
  catch (error) {
    console.error("error adding hand", error);
  }
}

async function assignAccount(seat) {
  // No players in dealers seat
  if (seat.number === 0) {
    return;
  }
  await pool.query(`UPDATE seat SET status = 'Finished' WHERE account_id = ${USER_ID};`);
  await pool.query(`UPDATE seat SET account_id = ${USER_ID}, status = 'Ready' WHERE id = ${seat.id};`);
  console.log("Assigned Player")
}

async function unassignAccount(seatId) { //
  console.log('seatId:', seatId);
  const seat = await getSeat(seatId);
  await pool.query(`UPDATE seat SET status = 'Finished' WHERE id = ${seatId};`);
  // When the seat the user was sitting in has no hands. dont bother moving to Finished just set account id and status to null
  // WTF THIS QUERY IS BROKEN
  // await pool.query(`UPDATE seat
  //                   SET account_id = null, status = null
  //                   FROM seat s
  //                   LEFT JOIN hand h ON h.seat_id = s.id
  //                   WHERE seat.account_id = ${USER_ID}
  //                   AND seat.status = 'Finished'
  //                   AND h.id IS NULL;`
  // );
  console.log(seat);
  if (seat) {
    return seat.account_id;
  }
  return null;
}

async function updateStatuses(roomId) {
  console.log("Updated Seat Statues")
  try {
    await pool.query(`UPDATE seat SET status = null, account_id = null WHERE (status = 'Finished' OR number = 0) AND room_id = ${roomId};`);
    await pool.query(`UPDATE seat SET status = 'Active' WHERE status = 'Ready';`);
    return seats = await getSeats(roomId);
  }
  catch (error) {
    console.error("error updating statuses", error);
  }
}

async function getRoom(seatId) {
  try {
    const results = await pool.query(`SELECT room.* FROM room JOIN seat ON seat.room_id = room.id WHERE seat.id = ${seatId};`);
    console.log(results.rows)
    return results.rows[0];
  }
  catch (error) {
    console.error("Error getting room", error);
  }
}


async function getSeat(seatId) {
  try {
    console.log(`SELECT * FROM seat WHERE id = ${seatId};`);
    const results = await pool.query(`SELECT * FROM seat WHERE id = ${seatId};`);
    return results.rows[0];
  }
  catch (error) {
    console.error("Error getting seat", error);
  }
}

async function getActiveSeat(userId) {
  try {
    const results = await pool.query(`SELECT * FROM seat WHERE account_id = ${userId} AND (status = 'Active' or status = 'Ready');`);
    return results.rows[0];
  }
  catch (error) {
    console.error("Error getting active player", error);
  }
}


module.exports = {
  createSeats,
  getSeats,
  getHands,
  refreshHands,
  addHand,
  assignAccount,
  unassignAccount,
  updateStatuses,
  getRoom,
  getSeat,
  getActiveSeat,
}