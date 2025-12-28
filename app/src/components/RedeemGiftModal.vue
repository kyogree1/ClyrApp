<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[9999] flex items-center justify-center
           bg-black/50 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl
             w-full max-w-md px-8 py-10 relative"
    >
      <!-- Close -->
      <button
        @click="close"
        class="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">
          🎟️ Redeem Gift Code
        </h2>
        <p class="text-gray-600 mt-2">
          Unlock <span class="font-semibold">lifetime premium access</span>.
        </p>
      </div>

      <!-- Input -->
      <input
        placeholder="CLYR-GIFT-XXXXXX"
        class="w-full px-4 py-3 rounded-xl border border-gray-300
               focus:ring-2 focus:ring-indigo-500
               outline-none text-center font-mono tracking-widest"
      />

      <!-- CTA -->
      <button
        class="w-full mt-6 py-3 rounded-xl
               bg-indigo-600 text-white font-semibold
               hover:bg-indigo-700 transition"
      >
        Redeem Lifetime Premium
      </button>

      <p class="text-xs text-gray-500 text-center mt-4">
        This gift unlocks Premium permanently.
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: Boolean })
const emit = defineEmits(["update:modelValue"])
const close = () => emit("update:modelValue", false)
</script>
