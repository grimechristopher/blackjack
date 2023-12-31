import { createStore } from 'vuex'
// import { generateDecks } from '@/old_components/data/deck';
// import { createMockPlayers } from '@/old_components/data/players';
// import { getUserId } from '@/old_components/data/user';

let timerInterval = null;

export default createStore({
  state: {
    room: { // Want to move room stuff here
      id: null,


      deckLength: 0,
    },
    user: {
      // seat: null,
      isConnected: false,
      seatId: null,
    },
  },
  mutations: {
    // Connection
    UPDATE_User(state, data) {
      state.user.isConnected = data.isConnected;
    },
    UPDATE_Room(state, data) {
      console.log(data);
      if (data) {
        console.log(data);
        state.room.id = data.id;
        state.room.seats = data.seats;
        state.room.players = data.players;
        state.room.deckLength = data.deckLength;

        state.room.hands = data.hands;
        state.room.cards = data.cards;
        state.room.turn = 0;

        // check if the user is sitting at a seat in the room already.
        state.user.seatId = data.userSeatId;
      }
      else {
        state.room.id = null;
        state.room.seats = null;
        state.room.players = null;
        state.room.deckLength = null;

        state.room.hands = [];
        state.room.cards = [];
        state.room.turn = 0;
      }
    },

    UPDATE_UserSeat(state, data) {
      console.log(data);
      state.user.seatId = data;
    },
    UPDATE_Seats(state, data) {
      console.log("Updating Seats in store")
      if (data.find(seat => seat.id === state.user.seatId && seat.status === 'Finished') ) {
        state.user.seatId = null;
      }
      state.room.seats = data;
    },
    UPDATE_Hands(state, data) {
      state.room.hands = data;
    },
    UPDATE_Cards(state, data) {
      state.room.cards = data;
    },
    UPDATE_Timer(state, data) {
      state.room.timer = data.time;
      state.room.turn = data.seatNumber;
      clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        if (state.room.timer > 0) {
          state.room.timer -= 1;
        } else {
          clearInterval(timerInterval);
        }
      }, 1000)

    },




    UPDATE_ActiveRoomSeat(state, data) {
      console.log(data);
      state.user.seat = state.activeSeats.find(seat => seat.id === data.seatId);
      state.activePlayers = data.activePlayers;
      const oldIndex = state.activeSeats.findIndex(seat => seat.account_id === data.accountId);
      const index = state.activeSeats.findIndex(seat => seat.id === data.seatId);
      if (oldIndex !== -1) {
        state.activeSeats[oldIndex].account_id = null;
      }
      state.activeSeats[index].account_id = data.accountId;
      console.log(state.activeSeats)
    },
  },
  actions: {
    // Connection
    updateUserConnection({ commit }, {data}) {
      commit('UPDATE_User', data);
    },

    // Rooms
    updateRoom({ commit }, {data}) {
      commit('UPDATE_Room', data);
    },

    updateUserSeat({ commit }, {data}) {
      commit('UPDATE_UserSeat', data);
    },

    updateSeats({ commit }, {data}) {
      commit('UPDATE_Seats', data);
    },

    updateHands({ commit }, {data}) {
      console.log("Oh Wow heres the hands", data)
      commit('UPDATE_Hands', data);
    },

    updateCards({ commit }, {data}) {
      commit('UPDATE_Cards', data);
    },

    updateTurn({ commit }, {data}) {
      commit('UPDATE_Turn', data);
    },

    updateTimer({ commit }, {data}) {
      console.log("Timer", data)
      commit('UPDATE_Timer', data);
    },
  },
})