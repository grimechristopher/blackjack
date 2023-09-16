// import { reactive } from "vue";
// import { io } from "socket.io-client";
import io from 'socket.io-client'
import store from './store/index.js';

// export const state = reactive({
//   connected: false,
// });

const URL = process.env.NODE_ENV === "production" ? window.location : "http://localhost:3001";

export const socket = io(URL, {
  autoConnect: false,
  auth: {
    token: "Test"
  }
});

// Connection
socket.on("connect", () => {
  const data = {
    isConnected: true,
  }
  store.dispatch('updateUserConnection', {data});
  console.log("connected");
});

socket.on("disconnect", () => {
  const data = {
    isConnected: false,
  }
  store.dispatch('updateUserConnection', {data});
});

// Room
socket.on("joined room", (data) => {
  store.dispatch('joinRoom', {data});
});

socket.on("player joined room", (data) => {
  store.dispatch('updateRoom', {data});
});

// Seat
socket.on("took seat", (data) => {
  store.dispatch('updateUserSeat', {data});
});
socket.on("player took seat", (data) => {
  store.dispatch('updateSeats', {data});
});

socket.on("left seat", (data) => {
  store.dispatch('updateUserSeat', {data}); // data should === null
});

socket.on("player left seat", (data) => {
  store.dispatch('updateSeats', {data});
});

socket.on("hands updated", (data) => {
  store.dispatch('updateHands', {data});
});

socket.on("cards updated", (data) => {
  console.log("Indeed cards updated")
  store.dispatch('updateCards', {data});
});

socket.on("seats updated", (data) => {
  console.log("Indeed seats updated")
  store.dispatch('updateSeats', {data});
});





socket.on("left room", () => {
  store.dispatch('leaveRoom');
});

socket.on("deleted room", () => {
  store.dispatch('leaveRoom');
});

// Seat

// socket.on("assigned seat", (seatInfo) => {
//   // state.connected = true;
//   // store.dispatch('defineSamplePlayers');
//   console.log("dplayer assigned seat", seatInfo);
//   store.dispatch('updateSeat', seatInfo);
// });