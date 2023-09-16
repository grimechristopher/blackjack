<template>
  <div>
    <h3 v-if="seat.number > 0">Seat {{ seat.number }}</h3>
            <h3 v-if="seat.number === 0">Dealer</h3>{{ seat }}

            <div> <!-- Hands -->
              <div v-for="hand in hands" :key="hand.id">Hello
                <SeatHand :hand="hand" />
              </div>
            </div>

            <div v-if="!seat.account_id && seat.number > 0">
                <button @click="sit(seat)">Sit</button>
            </div>
            <div v-if="seat.account_id && seat.id == userSeatId">
                <button @click="leave(seat)">Leave</button>
            </div>
  </div>
</template>

<script>
import { socket } from '@/socket';
import SeatHand from "@/components/SeatHand.vue";

export default {
  name: "TableSeat",
  components: {SeatHand,},
  props: {
    seat: Object,
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
    hands() {
      if (this.$store.state.room.hands) {
        return this.$store.state.room.hands.filter((hand) => hand.seat_id === this.seat.id);
      }
      return null;
    },
  },
  methods: {
    async sit(seat) {
      socket.emit("take seat", seat);
    },
    async leave(seat) {
      socket.emit("leave seat", seat);
    },
  },
};
</script>