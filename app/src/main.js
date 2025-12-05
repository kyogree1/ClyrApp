import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Toaster } from 'vue-sonner'
import { useAuth } from '@/store/auth'

const app = createApp(App)

const auth = useAuth()
await auth.init()     // 🔥 WAJIB — TUNGGU SUPABASE SIAP

app.use(router)
app.component('Toaster', Toaster)
app.mount('#app')
