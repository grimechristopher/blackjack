<template>
  <div>
    <div v-for="seat in seats" :key="seat.number">
      <TableSeat :seat="seat" />
    </div>
  </div>
</template>

<script>
import TableSeat from "@/components/TableSeat.vue";

export default {
  name: "TableSeats",
  components: { TableSeat },
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
  },
};
</script>
