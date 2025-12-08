<template>
  <div
    v-if="ui.loading"
    class="fixed inset-0 bg-black/20 flex items-center justify-center z-[9999]"
  >
    <div class="loader"></div>
  </div>
</template>

<script setup>
import { ui } from '@/store/ui'
</script>

<style>
.loader {
  width: 32px;
  height: 32px;
  border: 3px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
