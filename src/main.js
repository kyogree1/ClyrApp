// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Toaster } from 'vue-sonner'
import { useAuth } from '@/store/auth'

const app = createApp(App)

const { loadUser } = useAuth()
loadUser()

app.use(router)
app.component('Toaster', Toaster)
app.mount('#app')
