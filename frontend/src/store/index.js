import { createStore } from 'vuex'

// The entire apps open data will be kept in the store
// There will be data for the active game.

export default createStore({
  state: {
    // The game will have multiple rooms at once 
    rooms: [],
    // Seats will be an array of the current room's seats
    seats: [],
    // Each active player has a hand, hands are generated as soon as a round starts
    hands: [],
    // All the cards assigned to this room
    cards: [],
    // Object containing data about the current room
    room: {
      id: null,
      name: '',
      activeSeat: null,
      activeTurnTime: null,
    },
    dealer: {

    },
    user: {

    },

    // cards: suit, value, hand, room
    // hands: seat
    // seat: room, player, number, next player, status
    // -- seat can have status. ready, playing, leaving
    // room: name
    
  },
  actions: {
    updateRoomList({ commit }, data ) {
      commit('UPDATE_RoomList', data);
    },


    updateRoom({ commit } , data ) { 
      commit('UPDATE_Room', data);
    },
    updateUser({ commit }, data ) {
      commit('UPDATE_User', data);
    },
    updateSeats({ commit }, data ) {
      commit('UPDATE_Seats', data);
    },
    updatePlayers({ commit }, data ) {
      commit('UPDATE_Players', data);
    },
    updateHands({ commit }, data ) {
      commit('UPDATE_Hands', data);
    },
    updateCards({ commit }, data ) {
      commit('UPDATE_Cards', data);
    },
    addCardToHand({ commit }, data ) {
      commit('addCardToHand', data);
    },
    setActiveTurn({ commit }, data ) {
      commit('setActiveTurn', data);
    },

    sitPlayer({ commit }, data ) {
      commit('assignPlayerToSeat', data);
    },
    leaveSeat({ commit }, data ) {
      commit('unnasignPlayerFromSeat', data);
    },
    splitHand({ commit }, data ) {
      commit('splitHand', data);
    }
  },
  mutations: {
    initializeStore(state) {
			if(localStorage.getItem('store')) {
				// Replace the state object with the stored item
				this.replaceState(
					Object.assign(state, JSON.parse(localStorage.getItem('store')))
				);
			}
    },
    UPDATE_RoomList(state, data) {
      state.rooms = data;
    },

    UPDATE_Seats(state, data) {
      state.seats = data;
    },
    UPDATE_User(state, data) {
      state.user = data;
    },
    UPDATE_Room(state, data) {
      state.room = data;
    },
    UPDATE_Players(state, data) {
      state.players = data;
    },
    UPDATE_Hands(state, data) {
      state.hands = data;
    },
    UPDATE_Cards(state, data) {
      state.cards = data;
    },
    addCardToHand(state, data) {
      const undeltCards = state.cards.filter(card => card.handId === null);
      let randomCard = undeltCards[(Math.floor(Math.random() * undeltCards.length))];
      const cardIndex = state.cards.findIndex(card => card.id === randomCard.id);
      state.cards[cardIndex].handId = data.handId;
    },
    setActiveTurn(state, data) {
      state.room.activeSeat = data.seatId;
      state.room.activeTurnTime = 30;

      // Remove this in the future when handled by game state... 
      setTimeout(() => {
        state.room.activeSeat = null;
        state.room.activeTurnTime = null;
        clearInterval(activeTurnInterval);
      }, 30 * 1000);

      let activeTurnInterval = setInterval(() => {
        state.room.activeTurnTime -= 1;
      }, 1000);
    },
    assignPlayerToSeat(state, data) {
      const seatIndex = state.seats.findIndex(seat => seat.id === data.seatId);
      state.seats[seatIndex].playerId = state.user.id;
      state.players.push(state.user)
      state.user.seat = data.seatId;
    },
    unnasignPlayerFromSeat(state, data) {
      if (state.user.seat !== data.seatId) {
        return;
      }
      const seatIndex = state.seats.findIndex(seat => seat.id === data.seatId);
      state.seats[seatIndex].playerId = null;
      state.players = state.players.filter(player => player.id !== state.user.id);
      state.user.seat = null;
    },
    splitHand(state, data) {
      // Get hands seat
      const handIndex = state.hands.findIndex(hand => hand.id === data.handId);
      const hand = state.hands[handIndex];
      // Add new hand and assign to seat
      let newHand = { 
        id: state.hands.length + 12344,
        seat: hand.seat,
      }
      state.hands.push(newHand)
      // Get cards in hand
      const cardsInHand = state.cards.filter(card => card.handId === data.handId);
      // Move second card to new hand
      const secondCardIndex = state.cards.findIndex(card => card.id === cardsInHand[1].id);
      state.cards[secondCardIndex].handId = newHand.id;
      // Done.
    }

  },
})
