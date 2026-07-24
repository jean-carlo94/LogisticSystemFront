import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/auth'
import { authService } from '@/services/auth'
import { useProductsStore } from '@/stores/products'
import { useEventsStore } from '@/stores/events'
import { useRolesStore } from '@/stores/roles'
import { useUsersStore } from '@/stores/users'

function resetAllStores() {
  useProductsStore().reset()
  useEventsStore().reset()
  useRolesStore().reset()
  useUsersStore().reset()
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => token.value !== null)
  const permissions = computed(() => user.value?.permissions ?? [])
  const roles = computed(() => user.value?.roles ?? [])

  function hasPermission(code: string): boolean {
    if (user.value?.is_super_admin) return true
    return permissions.value.includes(code)
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      resetAllStores()
      const res = await authService.login({ email, password })
      token.value = res.access_token
      localStorage.setItem('access_token', res.access_token)
      await fetchProfile()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al iniciar sesion'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(form: { email: string; password: string }) {
    loading.value = true
    error.value = null
    try {
      await authService.register(form)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al registrarse'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    try {
      user.value = await authService.getMe()
    } catch {
      /* profile fetch may fail silently */
    }
  }

  async function updateProfile(data: { first_name?: string; last_name?: string; phone?: string; city?: string; country?: string; password?: string }) {
    try {
      user.value = await authService.updateMe(data)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al actualizar perfil'
      throw e
    }
  }

  function logout() {
    resetAllStores()
    token.value = null
    user.value = null
    localStorage.removeItem('access_token')
  }

  function init() {
    const stored = localStorage.getItem('access_token')
    if (stored) {
      token.value = stored
      fetchProfile()
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    permissions,
    roles,
    hasPermission,
    login,
    register,
    fetchProfile,
    updateProfile,
    logout,
    init,
  }
})
