<template>
  <div class="register-page">
    Register
    <div>
      <label for="username">Username</label>
      <input type="text" id="username" v-model="username" />
    </div>
    <div>
      <label for="email">Email</label>
      <input type="email" id="email" v-model="email" />
    </div>
    <div>
      <label for="password">Password</label>
      <input type="password" id="password" v-model="password" />
    </div>
    <div class="error-message">
      {{ errorMessage }}
    </div>
    <div>
      <button @click="register()">Register</button>
    </div>
  </div>
</template>

<script setup>
// import { socket } from '@/socket';
import { ref } from 'vue';

const username = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function register() {
  console.log('register', username.value, email.value, password.value);

  let response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username.value,
      email: email.value,
      password: password.value
    })
  })

  console.log('response', response.status);
  if (response.status === 200) {
    console.log('success');
    errorMessage.value = '';
  } else {
    errorMessage.value = await response.text();
  }

}
</script>

<style scoped>
.register-page {
  width: 100vw;
  height: 100%;

  background-color: #fcfcfc;
}
</style>