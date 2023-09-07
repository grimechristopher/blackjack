<template>
  <div>
    <h2>Debug</h2>
    <div>
      <h3>Info</h3>
      <div>
        <h4>You are in {{ activeRoom }}</h4>
        <h4>Connected: {{ isConnected }}</h4>
        <h4>Seat Id: {{ seatId }}</h4>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "RoomsList",
  components: {},
  data: function () {
    return {};
  },
  computed: {
    activeRoom() {
      if (this.$store.state.room) {
        return this.$store.state.room.id;
      }
      return null;
    },
    isConnected() {
      if (this.$store.state.user.isConnected) {
        return this.$store.state.user.isConnected;
      }
      return null;
    },
    seatId() {
      if (this.$store.state.user.seatId) {
        return this.$store.state.user.seatId;
      }
      return null;
    },
  },
};
</script>
