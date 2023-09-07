<template>
  <div class="rooms-container">
    <div class="rooms-list">
      <p>Rooms</p>
      <div :key="room.id" v-for="room in rooms">
        <p>
          <button @click="joinRoom(room.id)">Join Room {{ room.id }}</button>
        </p>
      </div>
      <div>
        <button @click="createRoom">Create Room</button>
      </div>
    </div>
    <div class="game-room">
      <GameRoom
        @deletedRoom="getRooms"
      />
    </div>
  </div>
</template>

<script>
import { socket } from "@/socket";
import GameRoom from "@/components/GameRoom.vue"

export default {
  name: "RoomsList",
  components: {GameRoom},
  data: function () {
    return {
      rooms: [],
      // activeRoom: null,
    }
  },
  computed: {
    activeRoom: function () {
      if (this.$store.state.activeRoom) {
        console.log(this.$store.state.activeRoom)
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
      await fetch("http://localhost:3001/create-room");
      // const response = await fetch("http://localhost:3001/create-room");
      // console.log(response);
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