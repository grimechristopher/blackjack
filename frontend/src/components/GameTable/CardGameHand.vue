<template>
  <div class="hand" :title="'handId: ' + hand.id">
    <div class="card-container" :class="{'container-right': props.rightSideRow}">
      <PlayingCard
        v-for="(card, index) in cards" :key="card.suit+card.value"
        :card="card"
        :handIndex="index"
      />
    </div>
  </div>
</template>

<script setup>
import PlayingCard from './PlayingCard.vue';
import { defineProps, ref, watch } from 'vue';
import { useStore } from 'vuex';

const props = defineProps(['hand', 'rightSideRow']);

const store = useStore();
 
const cards = ref([]);
setCards();

watch( () => store.state, () => {
  setCards();
}, {deep: true});

function setCards() {
  cards.value = store.state.cards.filter(card => card.hand_id === props.hand.id).sort((a, b) => a.order_drawn - b.order_drawn);
}

</script>


<style scoped>
.hand {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  min-height: 75%;
  max-height: 75%;
}
.card-container {
  display: flex;
  min-height: 100%;
  height: 100%;
  max-height: 100%;
  position: relative;
}

.container-right {
  flex-direction: row-reverse;
}

</style>