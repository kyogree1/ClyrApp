import { reactive } from "vue"
import { supabase } from "@/lib/supabase"

const state = reactive({
  user: null,
  ready: false,
})

export function useAuth() {

  // 🚀 Load session sekali di awal
  async function loadUser() {
    if (state.ready) return

    const { data } = await supabase.auth.getUser()
    state.user = data?.user || null
    state.ready = true
  }

  // 🚀 Supabase realtime auth listener
  supabase.auth.onAuthStateChange((event, session) => {
    state.user = session?.user || null
  })

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return true
  }

  async function signOut() {
    await supabase.auth.signOut()
    state.user = null
  }

  return { state, loadUser, signIn, signOut }
}
