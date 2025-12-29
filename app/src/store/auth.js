import { reactive } from "vue"
import { supabase } from "@/lib/supabase"

// ===============================
// GLOBAL STATE
// ===============================
const state = reactive({
  user: null,
  ready: false,
  isPremium: false,
  premiumLoading: false,
})

// cegah listener dobel
let initialized = false

// ===============================
// 🔥 EXTENSION SYNC (FINAL - VIA content script)
// ===============================
let lastSync = 0
function syncUserToExtension() {
  if (!state.user) return

  const now = Date.now()
  if (now - lastSync < 1000) return
  lastSync = now

  // 🔥 KIRIM KE CONTENT SCRIPT
  window.postMessage(
    {
      type: "CLYR_SET_USER",
      userId: state.user.id,
    },
    "*"
  )
}

// ===============================
// PREMIUM CHECK (SOURCE OF TRUTH)
// ===============================
async function refreshPremiumStatus() {
  if (!state.user) {
    state.isPremium = false
    return
  }

  state.premiumLoading = true

  try {
    const { data } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", state.user.id)
      .maybeSingle()

    state.isPremium = data?.is_premium === true
  } catch {
    state.isPremium = false
  } finally {
    state.premiumLoading = false
  }
}

// ===============================
// MAIN STORE
// ===============================
export function useAuth() {

  // 🔒 LISTENER AUTH — SATU KALI
  if (!initialized) {
    initialized = true

    supabase.auth.onAuthStateChange((_event, session) => {
      state.user = session?.user || null

      if (state.user) {
        refreshPremiumStatus()

        // 🔥 DELAY KECIL BIAR PAGE STABIL
        setTimeout(syncUserToExtension, 300)
      } else {
        state.isPremium = false

        // 🔥 CLEAR USER DI EXTENSION
        window.postMessage(
          { type: "CLYR_SET_USER", userId: null },
          "*"
        )
      }
    })
  }

  // ===============================
  // INIT
  // ===============================
  async function init() {
    if (state.ready) return

    try {
      const { data } = await supabase.auth.getSession()
      state.user = data?.session?.user || null
    } catch {
      state.user = null
    }

    state.ready = true

    if (state.user) {
      refreshPremiumStatus()
      setTimeout(syncUserToExtension, 300)
    }
  }

  // ===============================
  // LOGIN
  // ===============================
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    state.user = data.user
    refreshPremiumStatus()
    setTimeout(syncUserToExtension, 300)

    return data.user
  }

  // ===============================
  // LOGOUT
  // ===============================
  async function signOut() {
    await supabase.auth.signOut()

    state.user = null
    state.isPremium = false

    // 🔥 CLEAR DI EXTENSION
    window.postMessage(
      { type: "CLYR_SET_USER", userId: null },
      "*"
    )
  }

  // ===============================
  // MANUAL FORCE REFRESH
  // ===============================
  async function forceRefreshPremium() {
    await refreshPremiumStatus()
  }

  return {
    state,
    init,
    signIn,
    signOut,
    refreshPremiumStatus,
  }
}
