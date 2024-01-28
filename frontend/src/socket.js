import io from 'socket.io-client'
import store from '@/store/index';

import seats from '@/data/seats';
import players from '@/data/players';
import hands from '@/data/hands';
import cards from '@/data/cards';
import player from '@/data/user';

const URL = process.env.NODE_ENV === "production" ? window.location : "http://localhost:3000";

export const socket = io(URL, {
  autoConnect: false,
  auth: {
    token: "Test"
  }
});

// Connection
socket.on("connect", () => {
  console.log("connected");
});

socket.on("updateRoomList", (data) => {
  store.dispatch('updateRoomList', data);
});

socket.on("userJoined Announcment", (data) => {
  console.log('joined ROOM', data)
});

socket.on("updateGame", (data) => {
  store.dispatch('updateRoom', data.room);
  store.dispatch('updateSeats', data.seats);
  store.dispatch('updateCards', data.cards);
  store.dispatch('updateHands', data.hands);
  // store.dispatch('updateAccounts', data.players);
  console.log('updateGame', data);
});




export function joinRoom() {
  console.log('joinRoom');
  // mock room info
  const room = {
    id: 1000,
    name: 'Room 1000',
    activeSeat: null,
    activeTurnTime: null,
  }
  store.dispatch('updateRoom', room);
  store.dispatch('updateUser', player);
  store.dispatch('updateSeats', seats);
  store.dispatch('updatePlayers', players);
  store.dispatch('updateHands', hands);
  store.dispatch('updateCards', cards);
}

export function addCardToHand(handId) {
  store.dispatch('addCardToHand', { handId } );
}

export function setActiveTurn(seatId) {
  store.dispatch('setActiveTurn', { seatId } );
}

export function joinSeat(seatId) {
  store.dispatch('sitPlayer', { seatId } );
}

export function leaveSeat(seatId) {
  store.dispatch('leaveSeat', { seatId } );
}

export function splitHand(handId) {
  store.dispatch('splitHand', { handId } );
}