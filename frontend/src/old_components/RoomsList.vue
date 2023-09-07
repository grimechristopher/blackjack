<template>
  <div class="rooms-container">
    <div class="rooms-list">
      <h2>Rooms <button @click="getRooms">Refresh List</button></h2>
      <div :key="room.id" v-for="room in rooms">
        <p>
          <button @click="joinRoom(room.id)">Join Room {{ room.id }}</button>
        </p>
      </div>
      <div>
        <button @click="createRoom()">Create Room</button>
      </div>
    </div>
    <div class="game-room">
      <GameRoom
        @deletedRoom="getRooms"
      />
    </div>
<div>
  <DebugControls />
</div>
  </div>
</template>

<script>
socket.connect();import GameRoom from "@/components/GameRoom.vue"
import DebugControls from "@/components/DebugControls.vue"

export default {
  name: "RoomsList",
  components: {GameRoom, DebugControls},
  data: function () {
    return {
      rooms: [],
      // activeRoom: null,
    }
  },
  computed: {
    activeRoom: function () {
      if (this.$store.state.activeRoom) {
        return this.$store.state.activeRoom;
      }
      return null;
    },
  },
  created: async function () {
    await this.getRooms();
  },
  methods: {
    joinRoom: async function (roomId) {
      socket.connect();
      // Socket emit join room
      const data = {
        roomId: roomId
      }
      socket.emit('join room', data);
    },
    getRooms: async function () {
      const response = await fetch("http://localhost:3001/rooms");
      this.rooms = await response.json();
    },
    createRoom: async function () {
      console.log("Create room")
      await fetch("http://localhost:3001/create-room");
      await this.getRooms();
    },
  }
}
</script>

<style scoped>
/* Create a grid layout with rooms-container being the container
  Make the rooms-list take up 1/3 of the width and the game-room take up 2/3 of the width
*/
.rooms-container {
  display: grid;
  grid-template-columns: 1fr 4fr;
  grid-gap: 10px;
}

.rooms-list {
  background-color: #f2f2f2;
  padding: 20px;
}

.game-room {
  background-color: #f2f2f2;
  padding: 20px;
}

</style>