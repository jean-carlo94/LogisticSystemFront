import { ref, watchEffect } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function initialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref<Theme>(initialTheme())

function apply() {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem(STORAGE_KEY, theme.value)
}

watchEffect(apply)

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggle }
}
