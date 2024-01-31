const {data} = require('./gameData.js');
const broadcaster = require('./broadcaster.js');

const db = require('../dbconnection.js');
const handModel = require('../models/hand.js');

async function handleTurn(roomId, seatId) {
  console.info(`Room ${roomId}: Bot in seat ${seatId} is taking their turn`)
  // Get players hands and handle actions for each hand
  let hands = data[roomId].hands.filter(hand => hand.seat_id === seatId);
  let count = 0;
  while (count < hands.length) {
    const hand = hands[count];
    let cards = data[roomId].cards.filter(card => card.hand_id === hand.id);
    console.info(`Room ${roomId}: Bot in seat ${seatId} is taking their turn for hand ${hand.id} and has cards: ${cards}`)
    // If both cards are the same, split
    if (cards.length === 2 && cards[0].value === cards[1].value) {
      console.info(`Room ${roomId}: Bot in seat ${seatId} is splitting hand ${hand.id}`)
      await handModel.splitHand(hand, cards); // Handle spliting the hand
      await broadcaster.updateGameDataObjects(data[roomId].room.id); // update clients
      hands = data[roomId].hands.filter(hand => hand.seat_id === seatId); // update hands array to get new length
    }
    // Handle the hand. Second splits for the same hand aren't allowed. 
    cards = data[roomId].cards.filter(card => card.hand_id === hand.id);
    // Calculate the value of the hand
    // cards > 10 are worth 10
    // Ace is worth 1 or 11
    let handValue = await calculateHandValue(cards);
    while (handValue < 17) { // While loop since splitting could add more hands
      console.info(`Room ${roomId}: Bot in seat ${seatId} is hitting hand ${hand.id}`)
      await handModel.dealCard(hand.id, data[roomId].cards);
      await broadcaster.updateGameDataObjects(data[roomId].room.id);
      cards = data[roomId].cards.filter(card => card.hand_id === hand.id);
      handValue = await calculateHandValue(cards);
    }
    console.info(`Room ${roomId}: Bot in seat ${seatId} is standing on hand ${hand.id} with value ${handValue}`);
    count += 1; // increase counter to move to next hand. 
  }
}

async function calculateHandValue(cards) {
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

  await handModel.setFinalValue(cards[0].hand_id, handValue);
  return handValue;
}

async function handleDealersTurn(roomId, seatId) {
  // The dealer must take a card on 16 or less and stand on 17 or more
  // Get the dealers hand
  const dealerHand = data[roomId].hands.filter(hand => hand.seat_id === seatId)[0];
  // Cards in hand
  let cards = data[roomId].cards.filter(card => card.hand_id === dealerHand.id);
  let handValue = await calculateHandValue(cards);
  while (handValue < 17) {
    await handModel.dealCard(dealerHand.id, data[roomId].cards);
    await broadcaster.updateGameDataObjects(data[roomId].room.id);
    cards = data[roomId].cards.filter(card => card.hand_id === dealerHand.id);
    handValue = await calculateHandValue(cards);
  }
}

async function calculateFinalValue(roomId, handId) {

}

module.exports = {
  handleTurn,
  handleDealersTurn,
  calculateFinalValue,
}