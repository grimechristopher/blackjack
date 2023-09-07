<template>
  <div>
    <p v-if="!isDealer">Seat {{ seatPosition }}</p>
    <p v-if="isDealer">Dealer</p>
    <button v-if="!playerId && !isDealer" @click="takeSeat">Take Seat</button>
    <div v-if="playerId">{{ player ? player.username : 'doh' }}</div>
  </div>
</template>

<script>
// import PlayerHands from "@/components/PlayerHands.vue";
// import DebugControls from "@/components/DebugControls.vue";
// import HandControls from "@/components/HandControls.vue";
import { socket } from "@/socket";

export default {
  name: "TableSeat",
  components: {/*DebugControls,*/ /*HandControls*/},
  data: function () {
    return {
      // player: {},
    }
  },
  props: {
    // These are constants that describe the seat.
    seatPosition: Number,
    roomId: Number,
    seatId: Number,
  },
  computed: {
    playerId: function () {
      if (this.$store.state.activeSeats) {
        return this.$store.state.activeSeats.find(seat => seat.id === this.seatId).account_id;
      }
      return [];
    },
    player: function () {
      if (this.$store.state.activePlayers) {
        if (this.playerId) {
          console.log(this.playerId)
          return this.$store.state.activePlayers.find((player) => { console.log(this.playerId); return player.id === this.playerId});
        }
      }
      return [];
    },
    isDealer: function () {
      return (this.seatPosition === 0);
    },
  },
  methods: {
    takeSeat: async function () {
      console.log(this.roomId);
      socket.emit('take seat', {seatId: this.seatId, roomId: this.roomId});
    },
  },
  mounted: async function () {

  }
}
</script>