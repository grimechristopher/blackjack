export function generateStandardDeck() {
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

export function generateDecks (numberOfDecks) {
  let decks = [];

  for (let i = 0; i <  numberOfDecks; i++) {
    decks.push(...generateStandardDeck())
  }

  return decks;
}