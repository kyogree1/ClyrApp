// src/store/auth.js
import { reactive } from "vue"
import { supabase } from "@/lib/supabase"

const EXTENSION_ID = "hkkcfiigejjahmkbhmhbflaedcgieefi"

// GLOBAL STATE (singleton)
const state = reactive({
  user: null,
  ready: false,
})

// Singleton flag → mencegah listener dipasang berkali-kali
let initialized = false

// Debounce untuk mencegah spam sync (maks 1x per detik)
let lastSync = 0
function syncUserToExtension() {
  const now = Date.now()
  if (now - lastSync < 1000) return // ⛔ Batasi 1x/1s
  lastSync = now

  if (!state.user) return
  if (typeof chrome === "undefined" || !chrome.runtime) return

  chrome.runtime.sendMessage(
    EXTENSION_ID,
    { type: "SET_USER", userId: state.user.id },
    (res) => {
      if (import.meta.env.DEV) {
        console.log("[AUTH] Extension reply:", res)
      }
    }
  )
}

export function useAuth() {
  // Jika sudah pernah init → jangan pasang listener lagi
  if (!initialized) {
    initialized = true

    // LISTEN REALTIME AUTH CHANGE (dipasang SATU KALI saja)
    supabase.auth.onAuthStateChange((_event, session) => {
      state.user = session?.user || null

      // Sync hanya jika login, bukan logout
      if (state.user) syncUserToExtension()
    })
  }

  // INIT PERTAMA — digunakan di main.js sebelum mount app
  async function init() {
    if (state.ready) return

    const { data, error } = await supabase.auth.getSession()
    if (error) console.error("[AUTH] getSession error:", error)

    state.user = data?.session?.user || null
    state.ready = true

    if (state.user) syncUserToExtension()
  }

  // LOGIN
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    state.user = data.user
    syncUserToExtension()
    return data
  }

  // LOGOUT
  async function signOut() {
    await supabase.auth.signOut()
    state.user = null
  }

  return { state, init, signIn, signOut }
}