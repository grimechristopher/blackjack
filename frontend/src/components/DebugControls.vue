<template>
  <div v-if="playerId >= 0">
    <!-- Add a card to each hand-->
    <div :key="`debug_hand_${index}`" v-for="(hand, index) in hands">
      <button @click="drawCard(index)">Add card to hand {{index + 1}}</button>
      <div>
        <input placeholder="suit" v-model="removeSuit" :id="'removesuit_'+index+playerId">
        <input placeholder="face" v-model="removeFace">
        <button @click="removeCardMatching(index)">Remove Card</button>
      </div>
      <div>
        <input placeholder="index" v-model="removeIndex">
        <button @click="removeCardAtIndex(index)">Remove At Index</button>
      </div>
    </div>
    <div>
      <button @click="addHand">Add Hand</button>
    </div>
    <div v-if="!isDealer">
      <button @click="removePlayer">Remove Player</button>
    </div>
  </div>
  <div v-if="playerId == null">
    <div>
      <button @click="addPlayer">Add Player</button>
    </div>
  </div>

</template>

<script>
export default {
  name: "DebugControls",
  components: { },
  data: function () {
    return {
      removeSuit: null,
      removeFace: null,
      removeIndex: null,
    };
  },
  props: {
    hands: Array,
    playerId: Number,
    isDealer: Boolean,
    seatPosition: Number,
  },
  methods: {
    drawCard: async function (handIndex) {
      this.$store.dispatch('drawCard', {playerId: this.playerId, handIndex});
    },
    addHand: async function () {
      this.$store.dispatch('addHand', {playerId: this.playerId});
    },
    removePlayer: async function () {
      this.$emit('removePlayer', this.playerId)
    },
    addPlayer: async function () {
      this.$emit('addPlayer', {seatNumber: this.seatPosition})
    },
    removeCardMatching: async function (hand) {
      this.$store.dispatch('removeCardMatching', {playerId: this.playerId, handIndex: hand, suit: this.removeSuit, face: this.removeFace,})
      console.log(this.$store.state.players)
      this.$emit('removeCard')
    },
    removeCardAtIndex: async function (hand) {
      this.$store.dispatch('removeCardAtIndex', {playerId: this.playerId, handIndex: hand, cardIndex: this.removeIndex} )
      this.$emit('removeCard')
      console.log(hand, this.removeIndex)
    },
  }
}
</script>