let deck = [];
deck = generateDeckOfCards();

// add some cards to some hands
deck[0].handId = 101;
deck[1].handId = 201;
deck[22].handId = 101;
deck[34].handId = 201;
deck[35].handId = 202;
deck[51].handId = 202;
deck[25].handId = 202;
deck[29].handId = 203;
deck[44].handId =  333;
deck[47].handId =  333;
deck[48].handId =  3;
deck[19].handId =  3;

function generateDeckOfCards() {
    const suits = ['spades', 'hearts', 'diamonds', 'clubs',];

    let cardIndex = 0;
    suits.forEach(suit => {
      for (let index = 0; index < 13; index += 1) {
        deck.push({
          id: cardIndex,
          suit: suit,
          value: index + 1,
          handId: null,
          roomId: 1, // default for testing
        })
        cardIndex += 1;
      }
    })

    // Demo of a 'facedown card'
    deck.push({
      id: 53, // Unique values shouldn't be passed to the client, they can be used to identify cards
      suit: '',
      value: null,
      handId: null,
      roomId: 1,
    })

    return deck;
}

export default deck;