import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

import * as VueRouter from 'vue-router'

const RoomList = () => import('./components/RoomList/RoomList.vue');
const CardGameTable = () => import('./components/GameTable/CardGameTable.vue');
const LoginPage = () => import('./components/Account/LoginPage.vue');
const RegisterPage = () => import('./components/Account/RegisterPage.vue');

const routes = [
  { path: '/', component: RoomList, name: 'RoomList' },
  { path: '/room/:roomId', component: CardGameTable, name: 'CardGameTable' },
  { path: '/login/', component: LoginPage, name: 'LoginPage'},
  { path: '/register/', component: RegisterPage, name: 'RegisterPage'},
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
})

createApp(App)
  .use(router)
  .use(store)
  .mount('#app')