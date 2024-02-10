<template>
  <div class="community-seat">
    <div class="hands-container" v-if="hands.length > 0"> 
      <CommunityHand
        v-for="hand in hands" :key="hand.id"
        :hand="hand"
      />
    </div>
  </div>
</template>

<script setup>
import CommunityHand from './CommunityHand.vue';
import { defineProps, ref, watch } from 'vue';
import { useStore } from 'vuex';

const props = defineProps(['seat']);
 
const store = useStore();
const hands = ref([]);

// the community cards hands need to be updated on screen whenever they change so a watch is used.
// A dealer could have multiple hands a game could have multiple sets of community cards so we allow the flexibilty of multiple hands.
watch( () => store.state, () => {
  setHands();
}, {deep: true});
function setHands() {
  hands.value = store.state.hands.filter(hand => hand.seat_id === props.seat.id);
}

// Call setHands on initial load
setHands();

</script>

<style scoped>

.community-seat {
  flex: 0 0 20%;
  flex-grow: 1;

  display: flex;
}
.hands-container {
  flex-grow: 1;
  display: flex;
}
</style>