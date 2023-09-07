<template>
  <div>
    <button @click="joinRoom()">Join Room</button>
    <button @click="foo()">foo</button>
    <button @click="connect()">Connect</button>
    <button @click="disconnect()">Disconnect</button>
  </div>
</template>

<script>
import { socket } from "@/socket";

export default {
  name: "ConnectionManager",

  methods: {
    connect() {
      socket.connect();
    },
    disconnect() {
      socket.disconnect();
    },
    joinRoom() {
      // socket.joinRoom();
      console.log("Emit Function running")
      socket.emit('joinRoom', { test: 'Sent an event from the client!' });
    },
    foo() {
      socket.foo();
    }
  }
}
</script>