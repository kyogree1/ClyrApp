<template>
  <header
    class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-50"
  >
    <div class="container mx-auto flex items-center justify-between">
      <!-- LOGO -->
      <div
        @click="navigateTo('/')"
        class="text-2xl text-indigo-600 tracking-wider cursor-pointer hover:text-indigo-700 transition-colors"
      >
        CLYR
      </div>

      <!-- NAVIGATION -->
      <nav class="flex items-center gap-6">
        <!-- Menu selalu tampil -->
        <RouterLink
          v-for="link in baseLinks"
          :key="link.path"
          :to="link.path"
          class="transition-colors"
          @click="scrollToTop"
          :class="{
            'text-indigo-600 font-semibold': route.path === link.path,
            'text-gray-600 hover:text-indigo-600': route.path !== link.path
          }"
        >
          {{ link.label }}
        </RouterLink>

        <!-- Avatar dropdown (hanya login) -->
        <div v-if="isLoggedIn" class="relative">
          <div
            @click="toggleDropdown"
            class="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white cursor-pointer ring-2 ring-indigo-100 hover:ring-indigo-300 transition-all"
          >
            <User class="h-5 w-5" />
          </div>

          <!-- Dropdown -->
          <div
            v-if="dropdownOpen"
            class="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <div class="px-4 py-2 text-indigo-600 font-semibold border-b">
              Menu Akun
            </div>

            <button
              v-for="item in dropdownItems"
              :key="item.path"
              @click="handleDropdown(item)"
              class="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-indigo-50 transition-all"
            >
              <component :is="item.icon" class="h-4 w-4 mr-2" />
              {{ item.label }}
            </button>

            <div class="border-t my-1"></div>

            <button
              @click="logout"
              class="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut class="h-4 w-4 mr-2" /> Logout
            </button>
          </div>
        </div>

        <!-- Tombol login (guest) -->
        <Button
          v-else
          @click="navigateTo('/login')"
          class="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-md transition-all"
        >
          Login
        </Button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import Button from '@/components/Button.vue'
import { User, LayoutDashboard, MonitorCheck, BookOpen, LogOut } from 'lucide-vue-next'
import { useAuth } from '@/store/auth'
import { useUI } from '@/store/ui'

const router = useRouter()
const route = useRoute()

// 🔥 Ambil state auth dari Supabase store
const { state, signOut } = useAuth()

const { startLoading, stopLoading } = useUI()

// 🔥 Reactive: auto berubah begitu user login/logout
const isLoggedIn = computed(() => !!state.user)

const dropdownOpen = ref(false)

// 🌐 Menu utama
const baseLinks = [
  { path: '/', label: 'Home' },
  { path: '/features', label: 'Features' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
]

// 👤 Menu dropdown user
const dropdownItems = [
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/monitoring', label: 'Monitoring', icon: MonitorCheck },
  { path: '/journal', label: 'Journal', icon: BookOpen },
]

// 🧭 Navigasi
const navigateTo = (path) => {
  router.push(path).then(() => scrollToTop())
}
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ⚙️ Dropdown control
const toggleDropdown = (e) => {
  e.stopPropagation()
  dropdownOpen.value = !dropdownOpen.value
}
const handleDropdown = (item) => {
  dropdownOpen.value = false
  router.push(item.path).then(() => scrollToTop())
}
const handleOutsideClick = (e) => {
  if (!e.target.closest('.relative')) dropdownOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

// 🚪 Logout Supabase
const logout = async () => {
  try {
    startLoading()

    await signOut()               // 1️⃣ hapus session supabase

    await new Promise(r => setTimeout(r, 50))
    // 2️⃣ beri waktu onAuthStateChange update state.user = null

    await router.push('/')   // 3️⃣ redirect setelah state sinkron

  } catch (e) {
    console.error("Logout error:", e)
  } finally {
    stopLoading()                 // 4️⃣ matikan loading overlay
  }
}
</script>

