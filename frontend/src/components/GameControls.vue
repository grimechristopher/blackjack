<template>
    <div v-if="userSeatId || true">
        <h2>Actions</h2>
        <button v-for="(hand, index) in userHands" :key="hand.id" @click="hit(hand.id)">Hit {{ index > 0 ? index + 1 : '' }}</button>
        <button @click="stand()">Stand</button>
        <!-- <button>Split</button> -->
    </div>
</template>

<script>
import { socket } from '@/socket';

export default {
  name: "GameControls",
  components: {},
  props: {
    // hand: Object,
  },
  data: function () {
    return {};
  },
  computed: {
    userSeatId() {
      if (this.$store.state.user.seatId) {
        return this.$store.state.user.seatId;
      }
      return null;
    },
    userHands() {
        if (this.$store.state.room.hands) {
            return this.$store.state.room.hands.filter((hand) => hand.seat_id === this.userSeatId);
        }
        return null;
    }
  },
  methods: {
    async hit(handId) {
        const data = {
            // userId is obtained server side by auth
            seatId: this.userSeatId,
            handId: handId,
            // handId: this.hand ? this.hand.id : null, // Maybe in future?
        }
      console.log("hit");
      socket.emit("player hit", data);
    },
    async stand() {
        const data = {
            seatId: this.userSeatId,
        }
      console.log("stand");
      socket.emit("player stand", data);
    },
  },
};
</script>