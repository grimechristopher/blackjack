<template>
  <div>
    <div>
      <!-- Table -->
      <p>Table</p>
      <div>
        <p>Deck Length: {{ deckLength }}</p>
      </div>
    </div>
      <!-- Seats -->
    <div class="seat-containers">
      <div :key="`seat_${seat.id}`" v-for="(seat, index) in seats" :class="`seat seat-${index}`" >
        <div>
          <TableSeat
            :seatPosition="seat.seat_number"
            :roomId="seat.room_id"
            :seatId="seat.id"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TableSeat from "@/components/TableSeat.vue"

export default {
  name: "GameTable",
  components: { TableSeat},
  data: function () {
    return {
      // seats: 8,
    };
  },
  computed: {
      seats: function () {
        if (this.$store.state.activeSeats) {
          console.log(this.$store.state.activeSeats)
          return this.$store.state.activeSeats;
        }
        return [];
      },
      deckLength: function () {
        if (this.$store.state.activeDeckLength) {
          console.log(this.$store.state.activeDeckLength)
          return this.$store.state.activeDeckLength;
        }
        return [];
      },
  },
  methods: {

  },
  mounted: function () {

  }
}
</script>

<style scoped>
/* Make the seat container a flexbox that has rows of 4 components. make the first component always be on its own row */
/* Give the seat container child seat divs aminimum width and height */
.seat-containers {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 10px;
  border: 1px solid #000;
}
.seat {
  display: block;
  text-align: center;
  min-width: 25%;
}
.seat:first-child {
  width: 100%;
}
.seat:not(:first-child) {
  flex: 1;
}
</style>