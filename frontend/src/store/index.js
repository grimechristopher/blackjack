import { createStore } from 'vuex'
import { generateDecks } from '@/components/data/deck';
import { createMockPlayers } from '@/components/data/players';
import { getUserId } from '@/components/data/user';

export default createStore({
  state: {
    activeRoomId: null,
    activeDeckLength: 0,
    activePlayers: [],
    activeSeats: [],
    playersInRoom: [],

    userInfo: {},

    deck: [],
    players: [],
    user: {},
  },
  mutations: {
    UPDATE_ActiveInfo(state, data) {
      if (data) {
        state.activeRoomId = data.roomId;
        state.activeDeckLength = data.deckLength;
        state.activeSeats = data.seats;
        state.playersInRoom = data.playersInRoom;
        state.activePlayers = data.activePlayers;
      }
      else {
        state.activeRoomId = null;
        state.activeDeckLength = 0;
        state.activePlayers = [];
        state.activeSeats = [];
        state.playersInRoom = [];
      }
    },
    UPDATE_ActiveRoomSeat(state, data) {
      console.log(data);
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
    joinRoom({ commit }, {data}) {
      // console.log("Inside joinroom", data);
      commit('UPDATE_ActiveInfo', data);
    },
    leaveRoom({ commit }) {
      console.log("Inside leave");
      commit('UPDATE_ActiveInfo', null);
    },
    updateSeat({ commit }, data) {
      // console.log("Inside leave");
      console.log(data)
      commit('UPDATE_ActiveRoomSeat', data);
    },




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