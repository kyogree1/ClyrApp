import { reactive } from "vue"
import { supabase } from "@/lib/supabase"

const EXTENSION_ID = "hkkcfiigejjahmkbhmhbflaedcgieefi"

const state = reactive({
  user: null,
  ready: false,
})

/* ============================================================
   Sync UID ke Chrome Extension
============================================================ */
async function syncUserToExtension() {
  try {
    const { data } = await supabase.auth.getUser()
    const user = data?.user

    if (!user) {
      console.warn("[AUTH] Tidak ada user untuk disync ke extension.")
      return
    }

    if (!chrome?.runtime) {
      console.warn("[AUTH] Chrome runtime tidak tersedia.")
      return
    }

    chrome.runtime.sendMessage(
      EXTENSION_ID,
      { type: "SET_USER", userId: user.id },
      (res) => {
        console.log("[AUTH] Extension reply:", res)
      }
    )
  } catch (err) {
    console.error("[AUTH] Gagal sync user ke extension:", err)
  }
}

export function useAuth() {

  // ============================================================
  // Load user saat app dimulai
  // ============================================================
  async function loadUser() {
    if (state.ready) return

    const { data } = await supabase.auth.getUser()
    state.user = data?.user || null
    state.ready = true

    // 🔥 Sync otomatis jika user sudah login
    if (state.user) syncUserToExtension()
  }

  // ============================================================
  // Listen realtime perubahan auth
  // ============================================================
  supabase.auth.onAuthStateChange((event, session) => {
    state.user = session?.user || null

    // 🔥 Kalau user berubah (login/logout) → sync lagi
    if (session?.user) {
      syncUserToExtension()
    }
  })

  // ============================================================
  // Login
  // ============================================================
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    state.user = data.user
    syncUserToExtension() // 🔥 Auto sync setelah login

    return data
  }

  // ============================================================
  // Logout
  // ============================================================
  async function signOut() {
    await supabase.auth.signOut()
    state.user = null
  }

  return { state, loadUser, signIn, signOut }
}
