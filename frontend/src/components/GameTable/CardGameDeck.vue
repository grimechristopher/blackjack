<template>
  <div class="deck-container">
      <div class="deck-card" @click="showDealModal = !showDealModal">
        Deck {{ deckLength  }}
      </div>
      <ModalComponent
        v-if="showDealModal"
        @hideModal="showDealModal = false"
      >
        <template v-slot:header>
          <h3>Deal a card to a hand</h3>
        </template>
        <template v-slot:body>
          <select v-model="selectedHand">
            <option v-for="hand in store.state.hands" :key="hand.id" :value="hand.id">{{ dealOptionText(hand.id) }}</option>
          </select>
        </template>
        <template v-slot:footer>
            <button @click="dealCard()">Submit</button>
        </template>
      </ModalComponent>
  </div>
</template>

<script setup>
import ModalComponent from './ModalComponent.vue';
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import { addCardToHand } from '../../socket.js';

const store = useStore();

const deckLength = ref(0);
const showDealModal = ref(false);
const selectedHand = ref(null);

setDeckLength();
function setDeckLength() {
  console.log('setDeckLength')
  deckLength.value = store.state.cards.filter(card => card.hand_id === null).length;
}
watch (store.state, () => {
  setDeckLength();
}, {immediate: true, deep: true});

function dealCard() {
  addCardToHand(selectedHand.value);
  showDealModal.value = false;
}

function dealOptionText(handId) {
  const hand = store.state.hands.find(hand => hand.id === handId);
  const seat = store.state.seats.find(seat => seat.id === hand.seat);
  return `${seat.number} - ${hand.id}`;
}

</script>

<style scoped>
.deck-container {
  flex-grow: 1;

  display: flex;
  justify-content: end;
  align-items: center;
}
.container-container {
  flex-grow: 1;
  
  display: flex;
}
.deck-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  height: 4.5rem;
  width: auto;
  aspect-ratio: 25/35;

  font-family: monospace;
  line-height: 1em;

  background-color: white;
  border: 1px solid gray;
  border-radius: 6%;
  padding: 1px 3px;
}
</style>
