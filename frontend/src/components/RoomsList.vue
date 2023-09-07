<template>
  <div>
    <h2>List</h2>
    <div>
      <button @click="getRooms">Refresh List</button>
    </div>
    <div :key="room.id" v-for="room in rooms">
      <button @click="joinRoom(room.id)">Join Room {{ room.id }}</button>
    </div>
    <div>
      <button @click="createRoom">Create Room</button>
    </div>
  </div>
</template>

<script>
import { socket } from "@/socket";

export default {
  name: "RoomsList",
  components: {},
  data: function () {
    return {
      rooms: [],
    };
  },
  created: async function () {
    await this.getRooms();
  },
  methods: {
    async getRooms() {
      const response = await fetch("http://localhost:3001/api/room/");
      this.rooms = await response.json();
    },
    async createRoom() {
      await fetch("http://localhost:3001/api/room/create/")
      await this.getRooms();
    },
    async joinRoom(roomId) {
      const data = {
        roomId: roomId
      }
      socket.emit('join room', data);
    }
  }
};
</script>
