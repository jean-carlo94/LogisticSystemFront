import { watch, type Ref } from 'vue'

export function useAutoClearError(error: Ref<string | null>, delay = 10_000) {
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(error, (val) => {
    if (timer) clearTimeout(timer)
    if (val) {
      timer = setTimeout(() => {
        error.value = null
      }, delay)
    }
  })

  return {
    clearErrorTimer: () => {
      if (timer) clearTimeout(timer)
      timer = null
    }
  }
}
