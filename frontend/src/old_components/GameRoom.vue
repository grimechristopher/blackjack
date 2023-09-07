<template>
  <div>
    <div v-if="activeRoomId">
      <div class="room-info">
        <p>Active Room: {{ activeRoomId }}</p>
        <p><button @click="leaveRoom">Leave Room</button></p>
        <p><button @click="deleteRoom">Delete Room</button></p>
      </div>
      <div class="game-table">
        <GameTable/>
      </div>
      <div class="game-controls">
      <GameControls

      />
    </div>
    </div>
  </div>
</template>

<script>
import { socket } from "@/socket";
import GameTable from "@/components/GameTable.vue"
import GameControls from "@/components/GameControls.vue"

export default {
  name: "GameRoom",
  components: {GameTable, GameControls},
  data: function () {
    return {

    }
  },
  computed: {
    activeRoomId: function () {
      if (this.$store.state.activeRoomId) {
        console.log(this.$store.state.activeRoomId)
        return this.$store.state.activeRoomId;
      }
      return null;
    },
  },
  methods: {
    leaveRoom: function () {
      // socket.disconnect();
      // this.$store.commit('setActiveRoom', null);
      const data = {
        roomId: this.activeRoomId
      }
      socket.emit('leave room', data);
    },
    deleteRoom: function () {
      // socket.disconnect();
      // this.$store.commit('setActiveRoom', null);
      const data = {
        roomId: this.activeRoomId
      }
      socket.emit('delete room', data);
      this.$emit('deletedRoom')
    },
  }
}
</script>
<style scoped>
/* create a boundry between the room info and game table sections.  */
.room-info {
  border: 1px solid black;
  padding: 10px;
  margin: 10px;
}
.game-controls {
  border: 1px solid black;
  padding: 10px;
  margin: 10px;

}
</style>