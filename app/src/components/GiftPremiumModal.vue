<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-[9999] flex items-center justify-center
           bg-black/50 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl
             w-full max-w-lg px-8 py-10 relative"
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
          Gift CLYR Premium
        </h2>
        <p class="text-gray-600 mt-2">
          Berikan akses Premium ke teman atau orang terdekatmu.
        </p>
      </div>

      <!-- Gift Card -->
      <div
        class="border border-indigo-600 bg-indigo-50
               rounded-2xl p-6 mb-6"
      >
        <h3 class="text-lg font-semibold text-gray-900">
          Lifetime Premium Gift
        </h3>
        <p class="text-sm text-gray-600 mt-1">
          One-time purchase • No subscription
        </p>

        <ul class="mt-4 space-y-2 text-sm text-gray-700">
          <li>✔ Monitoring & Accountability</li>
          <li>✔ Personal Journal</li>
          <li>✔ Insights & Streaks</li>
          <li>✔ Semua fitur premium di masa depan</li>
        </ul>

        <div class="mt-4 flex items-center justify-between">
          <div class="text-2xl font-bold text-indigo-600">
            Rp 2500 <span class="text-sm font-medium text-gray-500">(testing)</span>
          </div>

          <span
            class="text-xs font-semibold px-3 py-1 rounded-full
                   bg-indigo-100 text-indigo-700"
          >
            Max 5 akun
          </span>
        </div>
      </div>

      <!-- Generated Code -->
      <div v-if="gifts.length" class="space-y-3 mb-4">
        <div
            v-for="gift in gifts"
            :key="gift.code"
            class="border rounded-xl p-3 bg-gray-50"
        >
            <div class="font-mono text-center text-sm tracking-widest">
            {{ gift.code }}
            </div>
            <p class="text-xs text-gray-500 text-center mt-1">
            Digunakan {{ gift.used_count }}/{{ gift.max_uses }} akun
            </p>
        </div>
        </div>


      <!-- CTA -->
      <button
        @click="purchaseGift"
        class="w-full py-3 rounded-xl
               bg-indigo-600 text-white font-semibold
               hover:bg-indigo-700 transition
               disabled:opacity-60 disabled:cursor-not-allowed"
        :disabled="!!giftCode || loading"
      >
        {{ giftCode ? "Gift Code Generated" : "Purchase Gift" }}
      </button>

      <p class="text-xs text-gray-500 text-center mt-4">
        Setelah pembayaran berhasil, gift code akan dibuat dan dapat
        digunakan hingga {{ maxUses }} akun berbeda.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/store/auth"
import { watch } from "vue"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})

const emit = defineEmits(["update:modelValue"])

const { state } = useAuth()

const loading = ref(false)
const giftCode = ref("")
const usedCount = ref(0)
const maxUses = ref(5)  // default, bisa diubah dr response backend
const gifts = ref([])

function close() {
  if (loading.value) return
  emit("update:modelValue", false)
}

// Optional if backend menyediakan endpoint status:
// kamu bisa panggil ini untuk update usedCount dari server
async function fetchMyGiftCodes() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/gift/my/${user.id}`
    )
    const data = await res.json()

    gifts.value = data.gifts || []

    // ambil gift terbaru otomatis
    if (gifts.value.length > 0) {
      giftCode.value = gifts.value[0].code
      usedCount.value = gifts.value[0].used_count
      maxUses.value = gifts.value[0].max_uses
    }
  } catch (err) {
    console.error("Failed load gift history", err)
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      fetchMyGiftCodes()
    }
  }
)

async function purchaseGift() {
  if (loading.value) return
  loading.value = true

  try {
    // Cek login
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Silakan login terlebih dahulu")
      return
    }

    // 1) BAYAR DULU
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/gift/create-transaction`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          user_id: user.id,
        }),
      }
    )

    const data = await res.json()
    if (!data.token) {
      alert("Gagal membuat transaksi")
      console.error("Create transaction:", data)
      return
    }

    // 2) SNAP PAY
    window.snap.pay(data.token, {
      onSuccess: async () => {
        // 3) GENERATE GIFT CODE
        const giftRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/gift/generate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
            }),
          }
        )

        const giftData = await giftRes.json()

        if (!giftData.code) {
          alert("Pembayaran sukses, tapi gagal generate gift code")
          console.error("Generate code:", giftData)
          return
        }

        giftCode.value = giftData.code
        usedCount.value = giftData.used_count ?? 0
        maxUses.value = giftData.max_uses ?? maxUses.value

        // Optional: jika backend punya status endpoint
        // await fetchGiftStatus(giftCode.value)
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
</script>
