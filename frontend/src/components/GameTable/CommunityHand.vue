<template>
  <div class="community-hand" :title="'handId: ' + hand.id">
    <PlayingCard
      v-for="card in cards" :key="card.suit+card.value"
      :card="card"
    />
  </div>
</template>

<script setup>
import PlayingCard from './PlayingCard.vue';
import { defineProps, ref, watch } from 'vue';
import { useStore } from 'vuex';

const props = defineProps(['hand']);

const store = useStore();

const cards = ref([]);
setCards();

watch( () => store.state, () => {
  setCards();
}, {deep: true});
function setCards() {
  cards.value = store.state.cards.filter(card => card.hand_id === props.hand.id);
}
</script>

<style scoped>
.community-hand {
  display: flex;
  flex-grow: 1;
  align-items: center;
}
</style>