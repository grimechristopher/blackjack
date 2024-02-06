<template>
  <!-- Playing Cards have 3 sections. top-left corner, bottom-right corner, and the face. -->
  <!-- Cards can be face up or face down -->
  <div v-if="props.card && props.card.value" class="playing-card" :class="`${color}-card`" :ref="`playingCardRef`">
    <div class="top-left-corner">
      <div class="value">
        {{ rank }}
      </div>
      <div class="suit">
        {{ suit }}
      </div>
    </div>
    <div class="card-face">
      {{ face }}
    </div>
    <div class="bottom-right-corner">
      <div class="value">
        {{ rank }}
      </div>
      <div class="suit">
        {{ suit }}
      </div>
    </div>
  </div>
  <div v-else class="playing-card"> <!-- Card doesnt have a value and therefore is facedown -->
    Empty
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';

const props = defineProps(['card', 'handIndex']);

const suit = ref('');
const color = ref('');
const rank = ref('');
const face = ref('');
const isFaceUp = ref(true);

const playingCardRef = ref(null);

setCard();


watch(() => props.card, () => {
  setCard();
});

watch(() => playingCardRef.value, () => {
  console.log("Playing card ref changed", playingCardRef.value, props.handIndex)
  if (props.handIndex && playingCardRef.value) {
    playingCardRef.value.style.position = 'absolute';
    playingCardRef.value.style.top = props.handIndex * 1.5 + 'rem';
  }
  else if (playingCardRef.value) {
    playingCardRef.value.style.position = 'relative';
  
  }
}, {immediate: true});

// watch(() => props.handIndex, () => {
//   console.log("prop handIndex changed", playingCardRef.value, props.handIndex)
//   if (props.handIndex && playingCardRef.value) {
//     playingCardRef.value.style.position = 'absolute';
//     playingCardRef.value.style.top = props.handIndex * 1.5 + 'rem';
//   }
//   else if (playingCardRef.value) {
//     playingCardRef.value.style.position = 'relative';
  
//   }
// }, {immediate: true});

function setCard() {

  if (!props.card.value) {
    isFaceUp.value = false;
  }

  // Suit set the icon
  // Adjust > 10 to be J, Q, K
  // Assign color

  switch (props.card.suit) {
    case 'hearts':
      suit.value = '♥';
      color.value = 'red';
      face.value = '♥'
      break;
    case 'diamonds':
      suit.value = '♦';
      color.value = 'red';
      face.value = '♦'
      break;
    case 'clubs':
      suit.value = '♣';
      color.value = 'black';
      face.value = '♣'
      break;
    case 'spades':
      suit.value = '♠';
      color.value = 'black';
      face.value = '♠'
      break;
    default:
      suit.value = '';
      color.value = '';
      face.value = '';
  }
  
  // Set the rank
  switch (props.card.value) {
    case 1:
      rank.value = 'A';
      break;
    case 11:
      rank.value = 'J';
      face.value = `J`;
      break;
    case 12:
      rank.value = 'Q';
      face.value = `Q`;
      break;
    case 13:
      rank.value = 'K';
      face.value = `K`;
      break;
    default:
      rank.value = props.card.value;
  }
}

</script>

<style scoped>
.playing-card {
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

  font-size: 140%;
}
.top-left-corner {
  display: flex;
  gap: 2px;
}
.card-face {
  align-self: center;
}
.bottom-right-corner {
  display: flex;
  gap: 2px;
  transform: rotate(180deg);
}

.red-card {
  color: red;
}
.black-card {
  color: black;
}
</style>