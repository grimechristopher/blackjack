<template>
  <div class="card-game-table" ref="cardGameTable">
    <!-- The Community Section holds the community cards (dealers hand, the flop) and deck-->
    <div class="community-section" ref="communitySection">
      <!-- Allow for multiple dealers/community seats. It is simpler to handle the data -->
      <CommunitySeat
        v-for="seat in communitySeat" :key="seat.id"
        :seat="seat"
      />{{  room?.name }}
      <CardGameDeck />
    </div>
    <div class="players-section" ref="playersSection">
      <!-- Row 2 is first to give the visual effect that player 1 is sitting at the table after the dealer-->
      <div class="player-row">
        <CardGameSeat 
          v-for="seat in playerSeatsRow2" :key="seat.id"
          :seat="seat"
          :height="seatHeight"
        />
      </div>
      <div class="player-row">
        <CardGameSeat 
          v-for="seat in playerSeatsRow1" :key="seat.id"
          :seat="seat"
          :height="seatHeight"
          :rightSideRow="true"
        />
      </div>
    </div>
  </div>
  <div>
    <button @click="playerActionStand()">Stand</button>
    <div v-for="hand, index in playerHands" :key="hand.id">
      <button @click="playerActionHit(hand.id)">Hit {{ index + 1 }}</button>
      <button v-if="isHandSplittable(hand.id)" @click="playerActionSplit(hand.id)">Split {{ index + 1 }}</button>
    </div>
  </div>
</template>

<script setup>
import CommunitySeat from './CommunitySeat.vue';
import CardGameDeck from './CardGameDeck.vue';
import CardGameSeat from './CardGameSeat.vue';
import { socket } from '@/socket';

import { ref, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

const store = useStore();
const route = useRoute();

const playerSeatsAll = ref([]);
const playerSeatsRow1 = ref([]);
const playerSeatsRow2 = ref([]);
const communitySeat = ref({});

const seatHeight = ref(0);
const cardGameTable = ref(null);
const communitySection = ref(null);
const playersSection = ref(null);
const room = ref(null);

const playerHands = ref(0);

// In the Vuex store there is a list of 'seats' for the table. There are multiple player seats 1 of n and a single community/dealer seat
// When the player joins a room the frontend needs to be updated with the current state of the table.
// We will mock a socket event that will update the vuex store with the current state of the table.
// After the store is updated the frontend needs to display the seats
onMounted(() => {
  window.addEventListener("resize", resizeCardGameTable);
  socket.emit('joinRoom', { roomId: route.params.roomId });
  setSeats();
})

watch( () => store.state, () => {
  setSeats();
  setPlayerHands();
}, { deep: true });

// A function is used to set the seats to create two rows of seats and also seperate the community seat from the player seats.
// Assumption: The seats in the store dont change after the room is created or midgame.
function setSeats() {
  playerSeatsAll.value = store.state.seats.filter(seat => seat.number !== 0); // copy the seats from the store, excluding the community seat
  communitySeat.value = store.state.seats.filter(seat => seat.number === 0); // copy the community seat from the store

  // Divide the seats in half and assign to each row
  // This will divided up the players into two rows in a much better way than with CSS
  // Row 2 will have an extra seat if seats total is odd.
  playerSeatsRow1.value = playerSeatsAll.value.slice(0, playerSeatsAll.value.length / 2);
  playerSeatsRow2.value = playerSeatsAll.value.slice(playerSeatsAll.value.length / 2, playerSeatsAll.value.length).reverse();
  // The second array is reversed to give the illusion that we are playing around a table. Clockwise. 


  let maxSeatRowLength = Math.max(playerSeatsRow1.value.length, playerSeatsRow2.value.length);
  if (playersSection.value) {
    seatHeight.value = (playersSection.value.offsetHeight - 48) / maxSeatRowLength;
  }
}

function setPlayerHands() {
  // First users seat needs to be found, second hands in that seat.
  const userSeat = store.state.seats.find(seat => seat.account_id === store.state.user.id);
  if (!userSeat) {
    return;
  }
  let userHands = store.state.hands.filter(hand => hand.seat_id === userSeat.id);
  playerHands.value = userHands;
}

function resizeCardGameTable() {
  setSeats();
}

// I need to apply a debounce to these buttons to prevent the user from spamming the buttons
function playerActionStand() {
  socket.emit('player action stand', { roomId: route.params.roomId });
}

function playerActionHit(handId) {
 socket.emit('player action hit', { roomId: route.params.roomId, handId: handId }); 
}

function playerActionSplit(handId) {
  socket.emit('player action split', { roomId: route.params.roomId, handId: handId });
}

function isHandSplittable(handId) {
  let handsCards = store.state.cards.filter(card => card.hand_id === handId);
  if (handsCards.length === 2) {
    if (handsCards[0].value === handsCards[1].value) {
      return true;
    }
  }
  return false;
}

</script>


<style scoped>
.card-game-table {
  display: grid;
  grid-auto-rows: 1fr 5fr;

  /* Game table should always be the size of the screen */
  width: 100vw;
  height: 100%;
  overflow: hidden;

  transform: translateX(0);
  transform: translate(0);

  background-image: radial-gradient(#396d52, #264f3b);
  border: 8px solid #474747;
  border-radius: 12px;
}

/* The dealer section is the top portion of the screen */
.community-section {
  display: flex;
  justify-content: space-between;

  padding: 0.5rem;

}

.players-section {
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 1fr 1fr;
  min-height: 0; /* Must set min height in order for grid to resize on page resize */
  max-width: 100%;
}
</style>