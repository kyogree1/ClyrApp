<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[9999] flex items-center justify-center
           bg-black/50 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl
             w-full max-w-xl px-10 py-10 relative"
    >
      <!-- Close -->
      <button
        @click="close"
        class="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900">
          🎁 Gift CLYR Premium
        </h2>
        <p class="text-gray-600 mt-2">
          Give someone <span class="font-semibold">lifetime access</span> to all premium features.
        </p>
      </div>

      <!-- Lifetime Card -->
      <div
        class="border border-indigo-600 bg-indigo-50
               rounded-2xl p-6 mb-8"
      >
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Lifetime Premium
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              One-time unlock • No expiration • No subscription
            </p>
          </div>

          <div class="text-2xl font-bold text-indigo-600">
            $25
          </div>
        </div>

        <ul class="mt-4 space-y-2 text-sm text-gray-700">
          <li>✔ Full Monitoring Access</li>
          <li>✔ Personal Journal</li>
          <li>✔ Insights & Streaks</li>
          <li>✔ Future Premium Features</li>
        </ul>
      </div>

      <!-- CTA -->
      <button
        class="w-full py-3 rounded-xl
               bg-indigo-600 text-white font-semibold
               hover:bg-indigo-700 transition"
      >
        Purchase Gift
      </button>

      <p class="text-xs text-gray-500 text-center mt-4">
        A gift code will be generated after successful payment.
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({ modelValue: Boolean })
const emit = defineEmits(["update:modelValue"])
const close = () => emit("update:modelValue", false)
</script>
