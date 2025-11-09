import { createRouter, createWebHistory } from 'vue-router'

// import semua views
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'   // 🆕 Tambahan baru
import DashboardPage from '@/views/DashboardPage.vue'
import MonitoringPage from '@/views/MonitoringPage.vue'
import JournalPage from '@/views/JournalPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'

// daftar route
const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },     // 🆕 Route baru
  { path: '/dashboard', component: DashboardPage },
  { path: '/monitoring', component: MonitoringPage },
  { path: '/journal', name: 'journal', component: JournalPage },
  { path: '/profile', component: ProfilePage },
]

// inisialisasi router
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
