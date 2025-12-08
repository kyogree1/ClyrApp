<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed top-6 right-6 z-50 bg-white shadow-xl border border-gray-200 rounded-xl px-5 py-3 flex items-center gap-3"
      :class="typeClass"
    >
      <span class="font-medium">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { ref } from "vue"

const visible = ref(false)
const message = ref("")
const type = ref("success")

const show = (msg, t = "success") => {
  message.value = msg
  type.value = t
  visible.value = true

  setTimeout(() => {
    visible.value = false
  }, 3000)
}

const typeClass = computed(() => {
  return type.value === "success"
    ? "text-green-700 bg-green-50 border-green-200"
    : "text-red-700 bg-red-50 border-red-200"
})

defineExpose({ show })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
