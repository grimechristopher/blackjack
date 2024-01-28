<template>
  <div class="room-list">
    <RouterLink v-if="store.state.room.id" :to="{ name: 'CardGameTable', params: {
      roomId: store.state.room.id
    } }">Close List</RouterLink>
    <div v-if="roomList.length > 0">
      <RoomListItem 
        v-for="room in roomList" :key="room.id"
        :room="room"
      />
      {{ roomList }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useStore, } from 'vuex';

import RoomListItem from './RoomListItem.vue';

const store = useStore();

import { socket } from '@/socket';

socket.emit('getRoomList');

const roomList = ref([]);

watch( () => store.state, () => {
  roomList.value = store.state.rooms;
}, { immediate: true, deep: true})

</script>

<style scoped>
.room-list {
  position: absolute;
  height: 100%;
  width: 100vw;
  z-index: 11;
  background-color: #fefefe;
}
</style>
