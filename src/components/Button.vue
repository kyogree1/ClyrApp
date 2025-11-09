<template>
  <button
    :class="[ 
      'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
      variant === 'outline'
        ? 'border border-gray-300 text-gray-700 hover:bg-gray-100'
        : variant === 'light'
        ? 'bg-white text-indigo-600 hover:bg-gray-100 focus:ring-indigo-300'
        : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300',
      size === 'sm'
        ? 'px-3 py-1.5 text-sm'
        : size === 'lg'
        ? 'px-6 py-3 text-lg'
        : 'px-4 py-2 text-base'
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'base' },
})
</script>
