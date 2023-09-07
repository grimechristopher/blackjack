<template>
  <div>
    <RoomsList />
    <GameRoom />
    <Debug />
  </div>
</template>

<script>
import { socket } from "@/socket";
import RoomsList from "@/components/RoomsList.vue"
import GameRoom from "@/components/GameRoom.vue"
import Debug from "@/components/Debug.vue"

export default {
  name: 'App',
  components: {
    RoomsList,
    GameRoom,
    Debug,
  },
  created: async function () {
    socket.connect();
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
