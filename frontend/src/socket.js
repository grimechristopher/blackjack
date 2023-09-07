import { reactive } from "vue";
// import { io } from "socket.io-client";
import io from 'socket.io-client'
import store from './store/index.js';

export const state = reactive({
  connected: false,
  fooEvents: [],
  barEvents: []
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3001";

export const socket = io(URL, {
  autoConnect: false,
});

socket.on("connect", () => {
  state.connected = true;
  console.log("connected");
});

socket.on("joined room", (data) => {
  // state.connected = true;
  // store.dispatch('defineSamplePlayers');
  // console.log("Joined room", data);
  store.dispatch('joinRoom', {data});
});

socket.on("left room", () => {
  // state.connected = true;
  // store.dispatch('defineSamplePlayers');
  console.log("left room");
  store.dispatch('leaveRoom');
});

socket.on("deleted room", () => {
  // state.connected = true;
  // store.dispatch('defineSamplePlayers');
  console.log("deleted and left room");
  store.dispatch('leaveRoom');
});

socket.on("assigned seat", (seatInfo) => {
  // state.connected = true;
  // store.dispatch('defineSamplePlayers');
  console.log("dplayer assigned seat", seatInfo);
  store.dispatch('updateSeat', seatInfo);
});




socket.on("join", (data) => {
  // state.connected = true;
  console.log("Join back at fe", data);
});

socket.on("disconnect", () => {
  state.connected = false;
  console.log("disconnected")
});

socket.on("foo", (...args) => {
  state.fooEvents.push(args);
});

socket.on("bar", (...args) => {
  state.barEvents.push(args);
});