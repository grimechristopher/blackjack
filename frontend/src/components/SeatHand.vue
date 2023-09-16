<template>
    <div>Hello
        {{ hand }}
        <div>
            {{ cards }}
        </div>
    </div>
</template>

<script>
export default {
  name: "SeatHand",
  components: {},
  props: {
    hand: Object,
  },
  data: function () {
    return {};
  },
  computed: {
    cards() {
        if (this.$store.state.room.cards) {
            return this.$store.state.room.cards.filter((card) => card.hand_id === this.hand.id);
        }
        return [];
    }
  },
};
</script>
