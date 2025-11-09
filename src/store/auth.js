import { reactive } from 'vue'

const state = reactive({
  user: JSON.parse(localStorage.getItem('r30_user') || 'null')
})

export function useAuth() {
  function signIn(email, password) {
    state.user = { email, displayName: email.split('@')[0] }
    localStorage.setItem('r30_user', JSON.stringify(state.user))
    return true
  }

  function signUp(email, password, displayName) {
    state.user = { email, displayName }
    localStorage.setItem('r30_user', JSON.stringify(state.user))
    return true
  }

  function signOut() {
    state.user = null
    localStorage.removeItem('r30_user')
  }

  return { state, signIn, signUp, signOut }
}
