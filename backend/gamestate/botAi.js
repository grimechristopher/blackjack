const {data} = require('./gameData.js');
const broadcaster = require('./broadcaster.js');

const db = require('../dbconnection.js');
const handModel = require('../models/hand.js');

async function handleTurn(roomId, seatId) {
  console.log("Bot turn", seatId);
  // Get players hands and handle actions for each hand
  let hands = data[roomId].hands.filter(hand => hand.seat_id === seatId);
  let count = 0;
  while (count < hands.length) {
    const hand = hands[count];
    let cards = data[roomId].cards.filter(card => card.hand_id === hand.id);
    console.log("cards in Hand", cards);
    // If both cards are the same, split
    if (cards.length === 2 && cards[0].value === cards[1].value) {
      console.log("Split");
      await handModel.splitHand(hand, cards); // Handle spliting the hand
      await broadcaster.updateGameDataObjects(data[roomId].room.id); // update clients
      hands = data[roomId].hands.filter(hand => hand.seat_id === seatId); // update hands array to get new length
      console.log("Split done");
    }
    // Handle the hand. Second splits for the same hand aren't allowed. 
    cards = data[roomId].cards.filter(card => card.hand_id === hand.id);
    // Calculate the value of the hand
    // cards > 10 are worth 10
    // Ace is worth 1 or 11

    let handValue = calculateHandValue(cards);
    while (handValue < 17) {
      console.log("Hit");
      await handModel.dealCard(hand.id, data[roomId].cards);
      await broadcaster.updateGameDataObjects(data[roomId].room.id);
      cards = data[roomId].cards.filter(card => card.hand_id === hand.id);
      handValue = calculateHandValue(cards);
    }

    console.log("handValue", handValue);




    count += 1;
  }
}

function calculateHandValue(cards) {
  let handValue = 0;
  let aceCount = 0;
  for (let card of cards) {
    if (card.value > 10) {
      handValue += 10;
    }
    else if (card.value === 1) {
      handValue += 11;
      aceCount += 1;
    }
    else {
      handValue += card.value;
    }
  }
  // If the hand is over 21 and there are aces, make aces worth 1
  while (handValue > 21 && aceCount > 0) {
    handValue -= 10;
    aceCount -= 1;
  }

  return handValue;
}

module.exports = {
  handleTurn,
}