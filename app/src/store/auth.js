import { reactive } from "vue"
import { supabase } from "@/lib/supabase"

const EXTENSION_ID = "hkkcfiigejjahmkbhmhbflaedcgieefi"

// ===============================
// GLOBAL STATE
// ===============================
const state = reactive({
  user: null,
  ready: false,
  isPremium: false,
  premiumLoading: false, // ✅ TAMBAHAN
})

// cegah listener dobel
let initialized = false

// ===============================
// EXTENSION SYNC (AMAN)
// ===============================
let lastSync = 0
function syncUserToExtension() {
  const now = Date.now()
  if (now - lastSync < 1000) return
  lastSync = now

  if (!state.user) return
  if (typeof chrome === "undefined" || !chrome.runtime) return

  try {
    chrome.runtime.sendMessage(
      EXTENSION_ID,
      { type: "SET_USER", userId: state.user.id },
      () => {}
    )
  } catch {
    // silent
  }
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
        syncUserToExtension()
      } else {
        state.isPremium = false
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
      syncUserToExtension()
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
    syncUserToExtension()

    return data.user   // ✅ TAMBAHKAN INI
  }

  // ===============================
  // LOGOUT
  // ===============================
  async function signOut() {
    await supabase.auth.signOut()
    state.user = null
    state.isPremium = false
  }

  // ===============================
  // MANUAL FORCE REFRESH (OPSIONAL)
  // ===============================
  async function forceRefreshPremium() {
    await refreshPremiumStatus()
  }

  return {
    state,
    init,
    signIn,
    signOut,
    // ✅ TAMBAHAN API
    refreshPremiumStatus
  }
}
