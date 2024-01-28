<template>
  <div class="login-page">
    <div>
      <label for="email">Email</label>
      <input type="text" id="username" v-model="email" />
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" v-model="password" />
    </div>  
    <div>
      {{ errorMessage }}
    </div>
    <div>
      <button @click="loginUser()">Login</button>
    </div>
  </div>
</template>

<script setup>
import store from '@/store';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { socket } from '@/socket';

const route = useRoute();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function loginUser() {
  let response = await fetch('http://localhost:3000/api/auth/login', {
    credentials: "include",
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })

  if (response.status === 200) {
    const userInfo = await response.json();
    store.dispatch('updateUser', userInfo);
    errorMessage.value = '';

    socket.io.engine.close() // Reconnect to the socket server so socket io loads the new user info cookie

    // Redirect to the room if the user was redirected to the login page
    if (route.query['room-redirect'] ) {
      router.push({ name: 'CardGameTable', params: { roomId: route.query['room-redirect'] }})
    }

  } else {
    errorMessage.value = await response.text();
  }


}

</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100%;

  background-color: #fcfcfc;
}
</style>