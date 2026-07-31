import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, RegisterPayload } from '@/types/auth'
import type { Tenant } from '@/types/tenant'
import { authService } from '@/services/auth'
import { useProductsStore } from '@/stores/products'
import { useEventsStore } from '@/stores/events'
import { useRolesStore } from '@/stores/roles'
import { useUsersStore } from '@/stores/users'
import { useShelvesStore } from '@/stores/shelves'
import { useCategoriesStore } from '@/stores/categories'
import { useSalesStore } from '@/stores/sales'
import { useOrdersStore } from '@/stores/orders'
import { useTenantsStore } from '@/stores/tenants'
import { useTaxesStore } from '@/stores/taxes'
import { useAutoClearError } from '@/composables/useAutoClearError'

function resetAllStores() {
  useProductsStore().reset()
  useEventsStore().reset()
  useRolesStore().reset()
  useUsersStore().reset()
  useShelvesStore().reset()
  useCategoriesStore().reset()
  useSalesStore().reset()
  useOrdersStore().reset()
  useTenantsStore().reset()
  useTaxesStore().reset()
}

function _restoreTenant(): Tenant | null {
  try {
    const raw = localStorage.getItem('current_tenant')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentTenant = ref<Tenant | null>(_restoreTenant())
  const tenantKey = ref(0)

  const { clearErrorTimer } = useAutoClearError(error)

  const isAuthenticated = computed(() => token.value !== null)
  const permissions = computed(() => user.value?.permissions ?? [])
  const displayName = computed(() => {
    const u = user.value
    if (!u) return ''
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email
  })

  function hasPermission(code: string): boolean {
    if (user.value?.is_super_admin) return true
    return permissions.value.includes(code)
  }

  function setTenant(tenant: Tenant | null) {
    currentTenant.value = tenant
    if (tenant) {
      localStorage.setItem('current_tenant_slug', tenant.slug)
      localStorage.setItem('current_tenant', JSON.stringify(tenant))
    } else {
      localStorage.removeItem('current_tenant_slug')
      localStorage.removeItem('current_tenant')
    }
    resetAllStores()
    tenantKey.value++
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

  async function register(form: RegisterPayload) {
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

  async function uploadAvatar(file: File) {
    try {
      user.value = await authService.uploadAvatar(file)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al subir imagen'
      throw e
    }
  }

  async function deleteAvatar() {
    try {
      await authService.deleteAvatar()
      if (user.value) {
        user.value = { ...user.value, image_path: null, image_url: null }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar imagen'
      throw e
    }
  }

  function logout() {
    resetAllStores()
    token.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('current_tenant_slug')
    localStorage.removeItem('current_tenant')
  }

  function init() {
    const stored = localStorage.getItem('access_token')
    if (stored) {
      token.value = stored
      fetchProfile()
    }
  }

  function reset() {
    clearErrorTimer()
    token.value = null
    user.value = null
    loading.value = false
    error.value = null
    currentTenant.value = null
    tenantKey.value = 0
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    permissions,
    displayName,
    currentTenant,
    tenantKey,
    hasPermission,
    setTenant,
    login,
    register,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    logout,
    init,
    reset,
  }
})
