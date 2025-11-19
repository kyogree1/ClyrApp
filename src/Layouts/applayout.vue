<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- Navbar -->
    <Navbar :isLoggedIn="isLoggedIn" @logout="logout" />

    <!-- Konten utama -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <Footer @navigate="handleFooterClick" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

const router = useRouter()
const isLoggedIn = ref(!!localStorage.getItem('user')) // deteksi login dari localStorage

// Logout
function logout() {
  localStorage.removeItem('user')
  isLoggedIn.value = false
  router.push('/login')
}

// Klik tombol di footer → navigasi ke halaman tertentu
function handleFooterClick(page) {
  router.push(page)
}
</script>
