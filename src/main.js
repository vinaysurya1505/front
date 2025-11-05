import { createApp } from 'vue'
import axios from 'axios'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/tailwind.css'

const storedToken = localStorage.getItem('authToken')
if (storedToken) {
  axios.defaults.headers.common['Authentication-Token'] = storedToken
}

createApp(App).use(store).use(router).mount('#app')
