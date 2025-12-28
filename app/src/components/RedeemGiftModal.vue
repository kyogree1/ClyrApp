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
        <div class="text-3xl mb-2">🎁</div>
        <h2 class="text-2xl font-bold text-gray-900">
          Redeem Gift Code
        </h2>
        <p class="text-gray-600 mt-2">
          Masukkan gift code untuk mengaktifkan Premium.
        </p>
      </div>

      <!-- Input -->
      <div class="mb-4">
        <label class="block text-xs text-gray-500 mb-1">
          Gift Code
        </label>
        <input
          v-model="code"
          placeholder="CLYR-GIFT-XXXXX"
          class="w-full px-4 py-3 rounded-xl border
                 text-center font-mono tracking-widest
                 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <!-- Error -->
      <p v-if="error" class="text-sm text-red-600 text-center mb-3">
        {{ error }}
      </p>

      <!-- Success -->
      <p v-if="success" class="text-sm text-green-600 text-center mb-3">
        🎉 Premium berhasil diaktifkan!
      </p>

      <!-- CTA -->
      <button
        @click="redeem"
        :disabled="loading || success || !code"
        class="w-full py-3 rounded-xl
               bg-indigo-600 text-white font-semibold
               hover:bg-indigo-700 transition
               disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {{ loading ? "Memproses..." : "Redeem Gift" }}
      </button>

      <p class="text-xs text-gray-500 text-center mt-4">
        Satu gift code dapat digunakan maksimal 5 akun.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/store/auth"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})

const emit = defineEmits(["update:modelValue"])

const { refreshPremiumStatus } = useAuth()

const code = ref("")
const loading = ref(false)
const error = ref("")
const success = ref(false)

function close() {
  emit("update:modelValue", false)
  reset()
}

function reset() {
  code.value = ""
  error.value = ""
  success.value = false
}

async function redeem() {
  loading.value = true
  error.value = ""

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      error.value = "Silakan login terlebih dahulu"
      return
    }

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/gift/redeem`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          code: code.value.trim(),
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      error.value = data.error || "Redeem gagal"
      return
    }

    success.value = true

    // 🔥 sync premium state
    await refreshPremiumStatus()
  } catch (err) {
    console.error(err)
    error.value = "Terjadi kesalahan"
  } finally {
    loading.value = false
  }
}
</script>
