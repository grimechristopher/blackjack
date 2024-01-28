<template>
  <NavigationBar/>
  <router-view></router-view>
</template>

<script>
import NavigationBar from './components/Layout/NavigationBar.vue'
import { socket } from './socket';

import { useStore } from 'vuex';

export default {
  name: 'App',
  components: {
    NavigationBar,
  },
  data() {
    return {
      showRoomList: false
    }
  },
  created() {
    const store = useStore();
    store.commit('initializeStore');
    store.subscribe((mutation, state) => {
      localStorage.setItem('store', JSON.stringify(state));
    });
  },  
  mounted() {
    socket.connect();
    // joinRoom();
  },
  methods: {
    
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: black;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

</style>
