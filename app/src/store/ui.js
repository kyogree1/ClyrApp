import { reactive } from "vue"

export const ui = reactive({
  loading: false
})

export function useUI() {
  function startLoading() {
    ui.loading = true
  }
  function stopLoading() {
    ui.loading = false
  }

  return { ui, startLoading, stopLoading }
}
