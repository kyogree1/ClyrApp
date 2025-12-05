<template>
  <div>
    <!-- Auth belum siap → tampilkan loading -->
    <LoadingOverlay v-if="!auth.state.ready" />

    <!-- Auth sudah siap → baru tampilkan halaman -->
    <router-view v-else />
  </div>
</template>

<script setup>
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import { useAuth } from '@/store/auth'

const auth = useAuth()
</script>
