<template>
  <div>
    <RoomsList />
  </div>
  <!-- <ConnectionManager /> -->
  <!-- <GameTable/> -->
  <!-- <GameControls /> -->
</template>

<script>
import RoomsList from "@/components/RoomsList.vue"

// import ConnectionManager from "@/components/ConnectionManager.vue"
// import GameTable from "@/components/GameTable.vue"
// import GameControls from "@/components/GameControls"

export default {
  name: 'App',
  components: {
    RoomsList,


    // GameTable,
    // GameControls,
    // ConnectionManager,
  },
  mounted: async function () {

  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
