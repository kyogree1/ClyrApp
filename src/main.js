import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // ✅ pastikan ini ada

import './index.css'

createApp(App)
  .use(router) // ✅ aktifkan router
  .mount('#app')
