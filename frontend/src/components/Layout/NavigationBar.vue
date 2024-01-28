<template>
  <div class="navbar">
    <RouterLink :to="{ name: 'RoomList' }">Rooms</RouterLink>
    <RouterLink v-if="!store.state.user.username" :to="{ name: 'LoginPage' }">Login</RouterLink>
    <RouterLink v-if="!store.state.user.username" :to="{ name: 'RegisterPage' }">Register</RouterLink>
    <div class="white">{{ room?.name }}</div>
  </div>
</template>
<script setup> 
import { useRoute } from 'vue-router';
import { watch, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const route = useRoute();

const room = ref(null);

watch(() => route.params, () => {
  // console.log(store.state.rooms)
  // console.log(room, route.params.roomId);
  updateRoomTitle();

}, { immediate: true })

function updateRoomTitle() {
  if (route.params.roomId) {
    room.value = store.state.rooms.find(room => room.id == route.params.roomId);
  }
}

</script>

<style scoped>
.navbar {
  display: flex;
}
.white {
  color: white;
}
</style>
