<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[9999] flex items-center justify-center
           bg-black/50 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl
             w-full max-w-4xl px-10 py-12 relative"
    >
      <!-- Close -->
      <button
        @click="close"
        class="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
        aria-label="Close"
      >
        ✕
      </button>

      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900">
          Upgrade to <span class="text-indigo-600">CLYR Premium</span>
        </h2>
        <p class="text-gray-600 mt-3 max-w-xl mx-auto">
          Unlock full access to monitoring, personal journaling, and meaningful progress insights.
        </p>
      </div>

      <!-- Plans -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <!-- FREE -->
        <div
          class="border border-gray-200 rounded-2xl p-8
                 flex flex-col justify-between"
        >
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Free
            </h3>

            <ul class="space-y-3 text-gray-600 text-sm">
              <li class="flex items-center gap-2">
                <span class="text-emerald-500">✔</span> Dashboard
              </li>
              <li class="flex items-center gap-2">
                <span class="text-emerald-500">✔</span> Profile
              </li>
              <li class="line-through text-gray-400">
                Monitoring
              </li>
              <li class="line-through text-gray-400">
                Personal Journal
              </li>
              <li class="line-through text-gray-400">
                Insights & Streaks
              </li>
            </ul>
          </div>

          <div class="mt-8">
            <div class="text-3xl font-bold text-gray-900">
              $0
            </div>

            <button
              disabled
              class="w-full mt-4 py-3 rounded-xl
                     border border-gray-300
                     bg-white text-gray-400
                     text-sm font-medium
                     cursor-not-allowed
                     shadow-inner"
            >
              Current Plan
            </button>
          </div>
        </div>

        <!-- PREMIUM -->
        <div
          class="relative bg-gradient-to-br from-indigo-600 to-purple-600
                 text-white rounded-2xl p-8
                 shadow-xl scale-[1.02]"
        >
          <!-- Badge -->
          <span
            class="absolute top-5 right-5
                   bg-yellow-400 text-gray-900
                   text-xs font-semibold px-3 py-1 rounded-full"
          >
            BEST VALUE
          </span>

          <div class="flex flex-col h-full justify-between">
            <div>
              <h3 class="text-lg font-semibold mb-4">
                Premium
              </h3>

              <ul class="space-y-3 text-indigo-100 text-sm">
                <li class="flex items-center gap-2">
                  <span class="text-white">✔</span> Dashboard
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-white">✔</span> Profile
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-white">✔</span> Monitoring
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-white">✔</span> Personal Journal
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-white">✔</span> Insights & Streaks
                </li>
              </ul>
            </div>

            <div class="mt-8">
              <div class="text-4xl font-bold">
                $5
                <span class="text-base font-medium text-indigo-200">
                  /month
                </span>
              </div>

              <button
                :disabled="loading"
                @click="startPayment"
                class="w-full mt-5 py-3 rounded-xl
                       bg-white text-indigo-600 font-semibold
                       hover:bg-indigo-100 transition
                       disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Processing…' : 'Upgrade Now' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-500 mt-10">
        🔒 Secure payment • Cancel anytime
      </p>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { supabase } from "@/lib/supabase"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})

const emit = defineEmits(["update:modelValue"])
const loading = ref(false)

function close() {
  if (!loading.value) emit("update:modelValue", false)
}

// ===============================
// 🔥 PAYMENT LOGIC (PRODUCTION)
// ===============================
async function startPayment() {
  if (loading.value) return
  loading.value = true

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Silakan login terlebih dahulu")
      return
    }

    // 🔥 KIRIM email + user_id
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/create-transaction`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          user_id: user.id, // 🔥 KUNCI UTAMA
        }),
      }
    )

    const data = await res.json()
    if (!data.token) {
      alert("Gagal mendapatkan token pembayaran")
      return
    }

    // 🔥 SNAP HANYA UNTUK BAYAR
    window.snap.pay(data.token, {
      onSuccess: () => {
        alert("Pembayaran berhasil 🎉")
        emit("update:modelValue", false)
        // ❌ TIDAK ADA UPDATE DB DI SINI
      },
      onPending: () => alert("⏳ Menunggu pembayaran"),
      onError: () => alert("❌ Pembayaran gagal"),
      onClose: () => console.log("Popup ditutup"),
    })
  } catch (err) {
    console.error(err)
    alert("Terjadi kesalahan")
  } finally {
    loading.value = false
  }
}

// ESC
function handleKey(e) {
  if (e.key === "Escape") close()
}

onMounted(() => window.addEventListener("keydown", handleKey))
onBeforeUnmount(() =>
  window.removeEventListener("keydown", handleKey)
)
</script>