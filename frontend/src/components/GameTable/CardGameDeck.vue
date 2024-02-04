<template>
  <div class="deck-container">
      <div class="deck-card">
        Deck {{ deckLength  }}
      </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const deckLength = ref(0);

setDeckLength();
function setDeckLength() {
  deckLength.value = store.state.cards.filter(card => card.hand_id === null).length;
}
watch (store.state, () => {
  setDeckLength();
}, {immediate: true, deep: true});

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
