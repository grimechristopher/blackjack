const { pool } = require('../dbconnection.js');

// Join room
async function joinRoom(userId, roomId) {
  pool.query(`UPDATE account SET room_id = ${roomId} WHERE id = ${userId};`);
}

// leave room
async function leaveRoom(userId) {
  pool.query(`UPDATE account SET room_id = NULL WHERE id = ${userId};`);
}

async function recordResults(results) {
  console.log("INSIDE ACCOUNT SERVICE", results)
  let values = [];
  for (let i = 0; i < results.length; i++) {
    values.push(`(${results[i].accountId},${results[i].win},${results[i].loss},${results[i].push},${results[i].blackjack},${results[i].bust})`);
  }
  try {
    const q = `UPDATE account AS b
              SET count_wins = b.count_wins + a.count_wins,
                  count_losses = b.count_losses + a.count_losses,
                  count_draws = b.count_draws + a.count_draws,
                  count_blackjacks = b.count_blackjacks + a.count_blackjacks,
                  count_busts = b.count_busts + a.count_busts
              FROM unnest(ARRAY[${values.join(",")}]) AS a (id INTEGER, count_wins INTEGER, count_losses INTEGER, count_draws INTEGER, count_blackjacks INTEGER, count_busts INTEGER)
              WHERE b.id = a.id;`;
    await pool.query(q);
  } catch (error) {
    console.error("Error recording results", error);
  }
}


module.exports = {
  joinRoom,
  leaveRoom,
  recordResults,
}