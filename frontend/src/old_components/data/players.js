export function createMockPlayers() {
  let players = [];
  for (let i = 0; i < 3; i++) {
    let player = {
      id: i,
      name: `Tester ${i+1}`,
      seat: i*2+1,
      hands: [],
    }
    players.push(player);
  }
  let user = {
    id: 9,
    name: 'User',
    seat: null,
    hands: [],
  };
  let dealer = {
    id: 10,
    name: 'Dealer',
    seat: null,
    hands: [],
    isDealer: true,
  };

  players.push(user);
  players.push(dealer);

  return players;
}

export function createMockPlayer() {
  
}