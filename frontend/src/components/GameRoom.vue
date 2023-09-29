<template>
  <div>
    <h2>Room {{ roomId }}</h2>
    <h3>Cards Remaining: {{ cardsRemaining }}</h3>
    <TableSeats />
    {{ players }}
    <div v-if="roomId">
      <button @click="leaveRoom()"> Leave Room </button>
      <button @click="deleteRoom()"> Delete Room </button>
    </div>
  </div>
</template>

<script>
import { socket } from '@/socket';
import TableSeats from "@/components/TableSeats.vue";

export default {
  name: "GameRoom",
  components: { TableSeats },
  data: function () {
    return {};
  },
  computed: {
    roomId() {
      if (this.$store.state.room.id) {
        return this.$store.state.room.id;
      }
      return null;
    },
    players() {
      if (this.$store.state.room.players) {
        return this.$store.state.room.players;
      }
      return null;
    },
    cardsRemaining() {
      if (this.$store.state.room.deckLength) {
        return this.$store.state.room.deckLength;
      }
      return null;
    },
  },
  methods: {
    deleteRoom() {
      socket.emit("delete room");
    },
    leaveRoom() {
      this.$store.dispatch("updateRoom", {});
      socket.emit('leave room');
    },
  }
};
</script>