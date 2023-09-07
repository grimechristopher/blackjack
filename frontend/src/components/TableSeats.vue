<template>
    <div>
        <div v-for="seat in seats" :key="seat.number">
            <h3 v-if="seat.number > 0">Seat {{ seat.number }}</h3>
            <h3 v-if="seat.number === 0">Dealer</h3>{{ seat }}
            <div v-if="!seat.account_id && seat.number > 0">
                <button @click="sit(seat)">Sit</button>
            </div>
            <div v-if="seat.account_id && seat.id == userSeatId">
                <button @click="leave(seat)">Leave</button>
            </div>
        </div>
    </div>
</template>

<script>
import { socket } from '@/socket';

export default {
  name: "TableSeats",
  components: {},
  data: function () {
    return {};
  },
  computed: {
    seats() {
        console.log(this.$store.state.room.seats);
        if (this.$store.state.room.seats) {
            return this.$store.state.room.seats;
        }
        return [];
    },
    userSeatId() {
        if (this.$store.state.user.seatId) {
            return this.$store.state.user.seatId;
        }
        return null;
    }

    },
    methods: {
        async sit(seat) {
            socket.emit('take seat', seat);
        },
        async leave(seat) {
            socket.emit('leave seat', seat);
        },
    },
};
</script>
