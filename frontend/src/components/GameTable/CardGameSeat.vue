<template>
  <div class="seat" ref="seatRef" :class="{'seat-right': props.rightSideRow}" >
    <div class="seat-info" :class="{'info-right': props.rightSideRow}">
      <div class="seat-header" :class="{'right-side': props.rightSideRow, 'header-active': isActiveSeat()}">
        <span v-html="numberCircle" @click="setActiveSeat"></span>&nbsp;
        <span v-if="props.seat.active_account_username" @click="removeFromSeat">{{ props.seat.active_account_username }}</span> 
        <span v-else-if="true"><button @click="takeSeat">+</button></span>
      </div>
      <div class="timer">
        <progress v-if="isActiveSeat()" :id="`seat${props.seat.id}_progress`" :value="store.state.room.activeTimeLeft ?? 20" max="20"> {{ store.state.room.activeTurnTime }}</progress>
      </div>
    </div>
      <div class="hands-container" >
          <CardGameHand
            v-for="hand in hands" :key="hand.id"
            :hand="hand"
            :rightSideRow="props.rightSideRow"
          />
      </div>
    <!-- {{ props.seat }} -->
  </div>
</template>
 
<script setup>
import CardGameHand from './CardGameHand.vue';
import { defineProps, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { setActiveTurn, leaveSeat} from '../../socket.js';
import { socket } from '@/socket';
import { useRouter } from 'vue-router';
import { isValidAuth } from '@/composables/JwtValidation.js';

const props = defineProps(['seat', 'height', 'rightSideRow']);
const store = useStore();
const router = useRouter();

const player = ref({});
const hands = ref([]);

const numberCircle = ref('');

numberCircle.value = `&#${9311 + props.seat.number};` // Fun way to get unicode characters :)

const seatRef = ref(null);

setPlayer();
watch (store.state.players, () => {
  setPlayer();
})

function setPlayer() {
  player.value = null;
  // player.value = store.state.players.find(player => player.id === props.seat.playerId);
}

setHands();
watch (store.state, () => {
  setHands();
}), {deep: true};
function setHands() {
  hands.value = store.state.hands.filter(hand => hand.seat_id === props.seat.id).sort((a, b) => a.id - b.id);
}

watch(() => props.height, () => {
  if (seatRef.value) {
    seatRef.value.style.height = props.height + 'px';
  }
}, {immediate: true})  

onMounted(()=> {
  seatRef.value.style.height = props.height + 'px';
})

function setActiveSeat() {
  setActiveTurn(props.seat.id)
}

function isActiveSeat() {
  if (store.state.room.active_seat_number === props.seat.number) {
    return true;
  }
  else {
    return false;
  }
}

async function takeSeat() {
  if (!store.state.user.username) {
    router.push({ name: 'LoginPage', query: { 'room-redirect': store.state.room.id } });
  }
  else {
    let isValid = await isValidAuth();
    if (!isValid) {
      store.dispatch('updateUser', {});
      router.push({ name: 'LoginPage', query: { 'room-redirect': store.state.room.id } }); 
    }
    else {
      socket.emit('assign seat', { roomId: props.seat.room_id, seatId: props.seat.id });
      // store.dispatch('updateUserSeat', props.seat.id);
    }
  }
}

function removeFromSeat() {
  leaveSeat(props.seat.id);
}

</script>

<style scoped>
.seat {
  color: #fefefe;
  font-family:Verdana, Geneva, Tahoma, sans-serif;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  max-height: 100%;

  margin: 0.7rem;
  padding-left: 0.25rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #fefefe;
  border-left: 1px solid #fefefe;
  border-bottom-left-radius: 12.5%;
}

.seat-info {
  display: flex;
  /* overflow-x: hidden; */
  /* flex-direction: row-reverse; */
}
.info-right {
  display: flex;
  flex-direction: row-reverse;
}

.timer {
  flex-shrink: 1;
  max-width: 50%;
}

.seat-right {
  padding-left: 0;
  padding-right: 0.25rem;
  border-left: 0;
  border-right: 1px solid #fefefe;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 12.5%;
}

.seat-header {
  padding-bottom: 2px;
  flex-grow: 1;
}
.header-active {
  color: dodgerblue
}

.right-side {
  display: flex;
  flex-direction: row-reverse;
}
.seat-hands {
  flex-shrink: 1;
  min-height: 0;
}
.hands-container {
  flex-shrink: 1;
  flex-grow: 0;
  min-height: 100%;
  max-height: 100%;
  overflow: hidden;

  display: flex;
}

.right-container {
  flex-direction: row-reverse;
}

progress {
  width:100%;
}
</style>