<template>
  <header
    class="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-4 shadow-sm sticky top-0 z-50"
  >
    <div class="container mx-auto flex items-center justify-between">
      <!-- LOGO -->
      <div
        class="text-2xl font-semibold text-indigo-600 tracking-wider cursor-pointer"
        @click="goHome"
      >
        Clyr
      </div>

      <!-- NAVIGATION LINKS -->
      <nav class="flex items-center gap-8 text-[15px] font-medium">
        <RouterLink
          v-for="link in activeLinks"
          :key="link.path"
          :to="link.path"
          class="transition-colors"
          :class="{
            'text-indigo-600 font-semibold': route.path === link.path,
            'text-gray-600 hover:text-indigo-600': route.path !== link.path
          }"
        >
          {{ link.label }}
        </RouterLink>

        <!-- LOGIN & LOGOUT BUTTON -->
        <Button
          v-if="!isLoggedIn"
          @click="goLogin"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition-all"
        >
          Login
        </Button>

        <Button
          v-else
          @click="logout"
          class="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-2 rounded-lg shadow-md transition-all"
        >
          Logout
        </Button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from '@/components/Button.vue'

const router = useRouter()
const route = useRoute()

// 🧠 state login disimpan di localStorage
const isLoggedIn = ref(!!localStorage.getItem('auth'))

// Jika auth berubah (misalnya dihapus setelah logout)
window.addEventListener('storage', () => {
  isLoggedIn.value = !!localStorage.getItem('auth')
})

// Link untuk guest dan user
const guestLinks = [
  { path: '/', label: 'Home' },
  { path: '/features', label: 'Features' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact Us' },
]

const userLinks = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/monitoring', label: 'Monitoring' },
  { path: '/journal', label: 'Journal' },
  { path: '/profile', label: 'Profile' },
]

const activeLinks = computed(() => (isLoggedIn.value ? userLinks : guestLinks))

// 🔁 fungsi navigasi
const goHome = () => router.push('/')
const goLogin = () => router.push('/login')

// 🚪 fungsi logout
const logout = () => {
  console.log('Logout clicked ✅') // <-- untuk memastikan klik berhasil
  localStorage.removeItem('auth')
  isLoggedIn.value = false // trigger re-render navbar
  router.push('/') // balik ke home guest
}
</script>
