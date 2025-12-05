import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/store/auth'
import { useUI } from '@/store/ui'

// PAGES
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import DashboardPage from '@/views/DashboardPage.vue'
import MonitoringPage from '@/views/MonitoringPage.vue'
import JournalPage from '@/views/JournalPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'
import AboutPage from '@/views/AboutPage.vue'
import contactpage from '@/views/contactpage.vue'
import FeaturesPage from '@/views/FeaturesPage.vue'
import EditProfile from '@/views/EditProfile.vue'

// INIT
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/about', component: AboutPage },
    { path: '/contact', component: contactpage },
    { path: '/features', component: FeaturesPage },

    // **RESET PASSWORD PAGE**
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('@/views/ResetPassword.vue')
    },

    // Protected pages
    { path: '/dashboard', component: DashboardPage, meta: { requiresAuth: true } },
    { path: '/monitoring', component: MonitoringPage, meta: { requiresAuth: true } },
    { path: '/journal', component: JournalPage, meta: { requiresAuth: true } },
    { path: '/profile', component: ProfilePage, meta: { requiresAuth: true } },
    {path: '/profile/edit', component: EditProfile, meta: { requiresAuth: true} } 
  ]
})

const { startLoading, stopLoading } = useUI()

// LOADING ANIMATION & AUTH GUARD
router.beforeEach(async (to, from, next) => {
  const { state, loadUser } = useAuth()

  // Pastikan Supabase sudah cek session
  if (!state.ready) {
    await loadUser()
  }

  // ⛔ Protected Page
  if (to.meta.requiresAuth && !state.user) {
    return next('/login')
  }

  // ⛔ User sudah login → cegah buka login/register
  if ((to.path === '/login' || to.path === '/register') && state.user) {
    return next('/dashboard')
  }

  next()
})

export default router
