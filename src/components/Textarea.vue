<template>
  <textarea
    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  ></textarea>
</template>

<script setup>
defineProps({
  modelValue: String
})
defineEmits(['update:modelValue'])
</script>
