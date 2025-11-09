<template>
  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <div
      class="h-full rounded-full transition-all duration-500"
      :class="color"
      :style="{ width: `${Math.min(value, 100)}%` }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// props
const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  color: {
    type: String,
    default: 'bg-indigo-600',
  },
})
</script>
