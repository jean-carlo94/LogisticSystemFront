import { ref, watchEffect } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function initialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return systemTheme()
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

  function set(t: Theme) {
    theme.value = t
  }

  return { theme, toggle, set }
}
