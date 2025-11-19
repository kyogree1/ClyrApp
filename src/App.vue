<template>
  <div>
    <router-view />
    <LoadingOverlay />
  </div>
</template>

<script setup>
import LoadingOverlay from '@/components/LoadingOverlay.vue'
</script>

