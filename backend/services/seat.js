const { pool } = require('../dbconnection.js');

const USER_ID = 1;

async function createSeats(roomId, seats) {
  // Create an array of incrementing numbers then map it to form a array of values, one for the room id and one for the seat number
  let values = [...Array(seats + 1).keys()].map((index) => `(${roomId}, ${index})`).join(','); // extra for the dealer seat. dealer seat is 0
  await pool.query(`DELETE FROM seat WHERE room_id = ${roomId};`);
  await pool.query(`INSERT INTO seat (room_id, number) VALUES ${values};`);
}

async function getSeats(roomId) {
  // const cards = await pool.query(`SELECT * FROM card JOIN hand ON card.hand_id = hand.id JOIN seat ON hand.seat_id = seat.id WHERE seat.room_id = ${roomId};`)
  // const accounts = await pool.query(`SELECT * FROM account LEFT JOIN seat ON account.id = seat.account_id WHERE seat.room_id = ${roomId};`);

  // // Return in Object
  // /*
  // seat {
  //   id: 1,
  //   number: 1,
  //   account: {
  //     username: 'username',
  //   }
  //   hands: [
  //     {
  //       id: 1,
  //       cards: [
  //         {
  //           id: 1,
  //           value: 1,
  //         }
  //       ]
  //     }
  //   ]
  // }
  // */

  // let seats = {};

  // cards.rows.forEach((card) => {
  //   if (!seats.hasOwnProperty(card.number)) {
  //     seats[card.number] = {
  //       id: card.seat_id,
  //       number: card.number,
  //     }
  //   }
  // });

  const results = await pool.query(`SELECT * FROM seat WHERE room_id = ${roomId} ORDER BY number;`);
  return results.rows;

}

async function assignAccount(seat) {
  // No players in dealers seat
  if (seat.number === 0) {
    return;
  }
  await pool.query(`UPDATE seat SET status = 'Finished' WHERE account_id = ${USER_ID};`);
  await pool.query(`UPDATE seat SET account_id = ${USER_ID}, status = 'Ready' WHERE id = ${seat.id};`);
}

async function unassignAccount(seat) {
  await pool.query(`UPDATE seat SET status = 'Finished' WHERE account_id = ${USER_ID};`); // Actually leaves all seats.
  // await pool.query(`UPDATE seat SET account_id = ${USER_ID}, status = 'Ready' WHERE id = ${seat.id};`);
  // When the seat the user was sitting in has no hands. dont bother moving to Finished just set account id and status to null
  console.log(`SELECT * FROM seat JOIN hand ON hand.seat_id = seat.id WHERE seat.account_id = ${USER_ID} AND seat.status = 'Finished';`);
  await pool.query(`UPDATE seat
                    SET account_id = null, status = null
                    FROM seat s
                    LEFT JOIN hand h ON h.seat_id = s.id
                    WHERE seat.account_id = ${USER_ID}
                    AND seat.status = 'Finished'
                    AND h.id IS NULL;`
  );
}



module.exports = {
  createSeats,
  getSeats,
  assignAccount,
  unassignAccount,
}