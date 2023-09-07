<template>
  <div>
    <p v-if="!isDealer">Seat {{ seatPosition }}</p>
    <p v-if="isDealer">Dealer</p>
    <button v-if="!player && !isDealer" @click="takeSeat">Take Seat</button>
    <div v-if="player">{{ player.username }}</div>
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
    isDealer: function () {
      return (this.seatPosition === 0);
    },
    player: function () {
      if (this.$store.state.activeSeats && this.$store.state.activePlayers) {
        const playerId = this.$store.state.activeSeats.find(seat => seat.id === this.seatId).account_id;
        return this.$store.state.activePlayers.find(player => player.id === playerId);
      }
      return {};
    },
  },
  methods: {
                              takeSeat: async function () {
                                console.log(this.roomId);
      socket.emit('take seat', {seatId: this.seatId, roomId: this.roomId});
    },
  },
  mounted: async function () { }
}
</script>