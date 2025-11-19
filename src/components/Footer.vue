<template>
  <footer class="bg-gray-900 text-gray-300 py-10 mt-auto">
    <div class="container mx-auto px-6 max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Brand Section -->
      <div>
        <h3 class="text-2xl font-semibold text-white mb-3">Clyr</h3>
        <p class="text-gray-400 text-sm">
          A digital platform for recovery and emotional wellness — supporting your journey toward mental and emotional balance.
        </p>
      </div>

      <!-- Navigation -->
      <div>
        <h4 class="text-white font-semibold mb-4">Navigation</h4>
        <ul class="space-y-2 text-sm">
          <li><button @click="navigateTo('/')" class="hover:text-indigo-400 transition">Home</button></li>
          <li><button @click="navigateTo('/features')" class="hover:text-indigo-400 transition">Features</button></li>
          <li><button @click="navigateTo('/about')" class="hover:text-indigo-400 transition">About</button></li>
          <li><button @click="navigateTo('/contact')" class="hover:text-indigo-400 transition">Contact</button></li>
        </ul>
      </div>

      <!-- Support -->
      <div>
        <h4 class="text-white font-semibold mb-4">Support</h4>
        <ul class="space-y-2 text-sm">
          <li>
            <button 
              v-if="!isLoggedIn" 
              @click="navigateTo('/login')" 
              class="hover:text-indigo-400 transition"
            >
              Login
            </button>
            <button 
              v-else 
              @click="navigateTo('/dashboard')" 
              class="hover:text-indigo-400 transition"
            >
              Dashboard
            </button>
          </li>
          <li><button @click="navigateTo('/journal')" class="hover:text-indigo-400 transition">Journal</button></li>
          <li><button @click="navigateTo('/profile')" class="hover:text-indigo-400 transition">Profile</button></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
      © 2025 Clyr Team and Contributors. All rights reserved.
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoggedIn = ref(!!localStorage.getItem('auth'))

// fungsi navigasi + scroll ke atas
const navigateTo = (path) => {
  router.push(path).then(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  })
}

// update status login dinamis
const updateAuthState = () => {
  isLoggedIn.value = !!localStorage.getItem('auth')
}

onMounted(() => {
  window.addEventListener('auth-changed', updateAuthState)
})
onBeforeUnmount(() => {
  window.removeEventListener('auth-changed', updateAuthState)
})
</script>

<style scoped>
button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
</style>
