<template>
  <div>
    <div v-for="(hand, index) in hands" :key="`hand_${index}`" class="hand">
      <div v-for="(card, index) in hand" :key="`card_${index}`">
        <div class="card">
          <div class="card-value">{{card.value}}</div>
          <div class="card-suit">{{card.suit}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlayerHands",
  data: function () {
    return {

    }
  },
  props: {
    hands: Array,
  },
}
</script>

<style scoped>
.hand {
  border: 1px solid black;
}
</style>