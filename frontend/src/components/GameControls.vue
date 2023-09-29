<template>
  <div v-if="userSeatId || true">
    <h1>{{ timer }}</h1>
    <h2>Actions</h2>
    <button
      v-for="(hand, index) in userHands"
      :key="hand.id"
      @click="hit(hand.id)"
    >
      Hit {{ index > 0 ? index + 1 : "" }}
    </button>
    <div v-for="(hand, index) in userHands" :key="hand.id">
      <button v-if="canSplit(hand.id)" @click="split(hand.id)">
        Split {{ index > 0 ? index + 1 : "" }}
      </button>
    </div>
    <button @click="stand()">Stand</button>
    <!-- <button>Split</button> -->
  </div>
</template>

<script>
import { socket } from "@/socket";

export default {
  name: "GameControls",
  components: {},
  props: {},
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
        return this.$store.state.room.hands.filter(
          (hand) => hand.seat_id === this.userSeatId
        );
      }
      return null;
    },
    cards() {
      if (this.$store.state.room.cards) {
        return this.$store.state.room.cards;
      }
      return null;
    },
    timer() {
      if (this.$store.state.room.timer) {
        return this.$store.state.room.timer;
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
      };
      console.log("hit");
      socket.emit("player hit", data);
    },
    async stand() {
      const data = {
        seatId: this.userSeatId,
      };
      console.log("stand", data);
      socket.emit("player stand", data);
    },
    async split(handId) {
      if (!this.canSplit(handId)) {
        return;
      }

      const data = {
        seatId: this.userSeatId,
        handId: handId,
      };
      console.log("split", data);
      socket.emit("player split", data);
    },
    canSplit(handId) {
      const userCards = this.cards.filter((card) => card.hand_id === handId);

      return (
        userCards.length === 2 && userCards[0].value === userCards[1].value
      );
    },
  },
};
</script>