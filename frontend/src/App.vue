<template>
  <div>
    <RoomsList />
    <GameRoom />
    <GameControls />
    <Debug />
  </div>
</template>

<script>
import { socket } from "@/socket";
import RoomsList from "@/components/RoomsList.vue"
import GameRoom from "@/components/GameRoom.vue"
import GameControls from "@/components/GameControls.vue"
import Debug from "@/components/Debug.vue"

export default {
  name: 'App',
  components: {
    RoomsList,
    GameRoom,
    GameControls,
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
