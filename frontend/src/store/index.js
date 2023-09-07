import { createStore } from 'vuex'
import { generateDecks } from '@/old_components/data/deck';
import { createMockPlayers } from '@/old_components/data/players';
import { getUserId } from '@/old_components/data/user';

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

        // check if the user is sitting at a seat in the room already.
        state.user.seatId = data.userSeatId;
      }
      else {
        state.room.id = null;
        state.room.seats = null;
        state.room.players = null;
      }
    },

    UPDATE_UserSeat(state, data) {
      state.user.seatId = data;
    },
    UPDATE_Seats(state, data) {

      // find index of seat and update
      console.log("data", data)
      // const index = state.room.seats.findIndex(seat => seat.id === data.seats.id);
      state.room.seats = data;


      // console.log(state.room.seats)
      // state.activePlayers = data.activePlayers;
      // const oldIndex = state.activeSeats.findIndex(seat => seat.account_id === data.accountId);
      // const index = state.activeSeats.findIndex(seat => seat.id === data.seatId);
      // if (oldIndex !== -1) {
      //   state.activeSeats[oldIndex].account_id = null;
      // }
      // state.activeSeats[index].account_id = data.accountId;
      // console.log(state.activeSeats)
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




    UPDATE_ItemsDeck(state, deck) {
      state.deck = deck;
    },
    DELETE_ItemDeck(state, index) {
      state.deck.splice(index, 1);
    },
    UPDATE_ItemsPlayers(state, players) {
      state.players = players;
    },
    UPDATE_ItemsUser(state, user) {
      state.user = user;
    },
    UPDATE_ItemsPlayersPlayer(state, updatedPlayer) {
      let players = [...state.players.filter(player => player.id !== updatedPlayer.id),updatedPlayer];
      state.players = players;
    },
    UPDATE_ItemsPlayersPlayerHand(state, payload) {
      console.log(payload.playerIndex, payload.handIndex, payload.cardToRemove)
      state.players[payload.playerIndex].hands[payload.handIndex].splice(payload.cardToRemove, 1);
      // HERE
      console.log("Done")
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



    joinRoom({ commit }, {data}) {
      commit('UPDATE_Room', data);
    },
    leaveRoom({ commit }) {
      commit('UPDATE_Room', null);
    },

    // // Seats
    // updateSeat({ commit }, data) {
    //   // console.log("Inside leave");
    //   console.log(data)
    //   commit('UPDATE_ActiveRoomSeat', data);
    // },




    createGameDeck({ commit }, {numberOfDecks}) {
      commit('UPDATE_ItemsDeck', generateDecks(numberOfDecks));
    },
    async drawCard({ commit, state }, {playerId, handIndex}) {
      let randomCardIndex = Math.floor(Math.random() * state.deck.length);
      let drawnCard = state.deck[randomCardIndex];

      let player = state.players.find(player => player.id === playerId);
      player.hands[handIndex].push(drawnCard);

      commit('DELETE_ItemDeck', randomCardIndex);
      commit('UPDATE_ItemsPlayersPlayer', player);
      // return drawnCard
    },
    async defineSamplePlayers({commit}) {
      commit('UPDATE_ItemsPlayers', createMockPlayers());
    },
    async addHand({commit, state}, {playerId}) {
      let player = state.players.find(player => player.id === playerId);
      player.hands.push([]);
      commit('UPDATE_ItemsPlayersPlayer', player);
    },
    async defineUser({commit, state}) {
      let userId = getUserId();
      let user = state.user;
      user.id = userId;
      commit('UPDATE_ItemsUser', user);
    },
    async seatUser({commit, state}, {playerId, seatNumber}) {
      let user = state.user;
      let player = state.players.find(player => player.id === playerId);

      player.seat = seatNumber;
      user.seat = seatNumber;

      commit('UPDATE_ItemsUser', user);
      commit('UPDATE_ItemsPlayersPlayer', player);
    },
    async addPlayer({commit, state}, {seatNumber} ) {
      console.log(state.players.length)

      let playerIdArray = state.players.map(player => {return player.id} );
      let newId = 1;
      while (playerIdArray.includes(newId)) {
        newId += 1;
      }

      let newPlayer = {
        id: newId,
        name: `Added Player ${newId}`,
        seat: seatNumber,
        hands: [],
      }
      console.log("Ok")
      commit('UPDATE_ItemsPlayersPlayer', newPlayer);

    },
    async removePlayer({commit, state}, {seatNumber}) {
      let player = state.players.find(player => player.seat === seatNumber);

      if (state.user.id === player.id) {
        state.user.seat = null;
      }
      player.seat = null;

      player.hands = [];
      commit('UPDATE_ItemsPlayersPlayer', player);
    },
    async removeCardMatching({commit, state}, {playerId, handIndex, suit, face}) {
      let hand = state.players.find(player => player.id === playerId).hands[handIndex];
      let playerIndex = state.players.findIndex(player => player.id === playerId)
      let cardToRemove = hand.findIndex(card => card.suit == suit && card.face == face);
      console.log(cardToRemove)
      if (cardToRemove >= 0) {
        console.log("CARD TO REMOVE")
        commit('UPDATE_ItemsPlayersPlayerHand', {playerIndex, handIndex, cardToRemove});
      }
      console.log(playerIndex)
      console.log(commit, state, playerId, handIndex, suit, face)
    },
    async removeCardAtIndex({commit, state}, {playerId, handIndex, cardIndex} ) {
      let playerIndex = state.players.findIndex(player => player.id === playerId)
      commit('UPDATE_ItemsPlayersPlayerHand', {playerIndex, handIndex, cardToRemove: cardIndex});
    }
  },
})