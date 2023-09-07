<template>
  <div>{{ $store.state.user }}
    <div v-if="userHasSeat">
      <p><button @click="startGame">Start Game</button></p>
    </div>
    <div v-if="!userHasSeat">
      Take a seat
    </div>
  </div>
</template>

<script>
import { socket } from "@/socket";

export default {
  name: "GameControls",
  components: { },
  data: function () {
    return {

    };
  },
  computed: {
    userHasSeat: function () {
      if (this.$store.state.user) {
        return this.$store.state.user.seat ? true : false
      }
      return false;
    }
  },
  methods: {
    async startGame() {
      socket.emit('start game');
    }
  },
}
</script>