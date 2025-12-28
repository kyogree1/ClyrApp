<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-50">
    <div class="container mx-auto flex items-center justify-between">

      <!-- LOGO -->
      <div
        @click="navigateTo('/')"
        class="text-2xl text-indigo-600 tracking-wider cursor-pointer hover:text-indigo-700 transition-colors"
      >
        CLYR
      </div>

      <!-- NAV -->
      <nav class="flex items-center gap-6">

        <!-- Public links -->
        <RouterLink
          v-for="link in baseLinks"
          :key="link.path"
          :to="link.path"
          class="transition-colors"
          @click="scrollToTop"
          :class="route.path === link.path
            ? 'text-indigo-600 font-semibold'
            : 'text-gray-600 hover:text-indigo-600'"
        >
          {{ link.label }}
        </RouterLink>

        <!-- USER DROPDOWN -->
        <div v-if="isLoggedIn" class="relative" ref="dropdownRoot">
          <div
            @click.stop="toggleDropdown"
            class="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600
                   flex items-center justify-center text-white cursor-pointer
                   ring-2 ring-indigo-100 hover:ring-indigo-300 transition-all"
          >
            <User class="h-5 w-5" />
          </div>

          <!-- DROPDOWN -->
          <div
            v-if="dropdownOpen"
            class="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          >
            <div class="px-4 py-2 text-indigo-600 font-semibold border-b">
              Menu Akun
            </div>

            <button
              v-for="item in dropdownItems"
              :key="item.label"
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
              <LogOut class="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        <!-- GUEST -->
        <Button
          v-else
          @click="navigateTo('/login')"
          class="bg-gradient-to-r from-indigo-600 to-purple-600
                 hover:from-indigo-700 hover:to-purple-700
                 text-white px-6 py-2 rounded-lg shadow-md transition-all"
        >
          Login
        </Button>
      </nav>
    </div>

    <!-- MODAL UPGRADE -->
    <UpgradePremiumModal v-model="showUpgradeModal" />
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
import { User, LayoutDashboard, MonitorCheck, BookOpen, Star, LogOut } from "lucide-vue-next"

import Button from "@/components/Button.vue"
import UpgradePremiumModal from "@/components/UpgradePremiumModal.vue"
import { useAuth } from "@/store/auth"
import { useUI } from "@/store/ui"

const router = useRouter()
const route = useRoute()

// ✅ useAuth SINGLETON
const auth = useAuth()
const { state, signOut, refreshPremiumStatus } = auth

const { startLoading, stopLoading } = useUI()

const isLoggedIn = computed(() => !!state.user)
const isPremium = computed(() => state.isPremium === true)

const dropdownOpen = ref(false)
const showUpgradeModal = ref(false)
const dropdownRoot = ref(null)

// Public links
const baseLinks = [
  { path: "/", label: "Home" },
  { path: "/features", label: "Features" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
]

// Dropdown items
const commonDropdownItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", path: "/profile", icon: User },
]

const premiumOnlyItems = [
  { label: "Monitoring", path: "/monitoring", icon: MonitorCheck },
  { label: "Journal", path: "/journal", icon: BookOpen },
]

const freeOnlyItems = [
  { label: "Upgrade ke Premium", action: "upgrade", icon: Star },
]

const dropdownItems = computed(() => {
  return isPremium.value
    ? [...commonDropdownItems, ...premiumOnlyItems]
    : [...commonDropdownItems, ...freeOnlyItems]
})

// Navigation helpers
const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })
const navigateTo = (path) => router.push(path).then(scrollToTop)

// Dropdown logic
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const handleDropdown = (item) => {
  dropdownOpen.value = false

  if (item.action === "upgrade") {
    showUpgradeModal.value = true
    return
  }

  if (item.path) navigateTo(item.path)
}

// ✅ Outside click yang benar (hanya cek area dropdownRoot)
const handleOutsideClick = (e) => {
  if (!dropdownOpen.value) return
  const root = dropdownRoot.value
  if (root && !root.contains(e.target)) dropdownOpen.value = false
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick)
})
onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick)
})

// ✅ Setelah modal ditutup, refresh premium supaya menu langsung berubah
watch(
  () => showUpgradeModal.value,
  async (open) => {
    if (open === false && state.user) {
      await refreshPremiumStatus()
    }
  }
)

// Logout
const logout = async () => {
  try {
    startLoading()
    await signOut()
    await router.push("/")
  } finally {
    stopLoading()
  }
}

// DEBUG (hapus nanti)
if (import.meta.env.DEV) {
  window.__auth = auth
}
</script>
