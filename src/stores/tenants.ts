import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tenant, TenantForm, TenantUpdateForm } from '@/types/tenant'
import { tenantsService } from '@/services/tenants'
import { useAutoClearError } from '@/composables/useAutoClearError'

export const useTenantsStore = defineStore('tenants', () => {
  const tenants = ref<Tenant[]>([])
  const form = ref<TenantForm>({ name: '', slug: '' })
  const editingId = ref<number | null>(null)
  const isFormOpen = ref(false)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const { clearErrorTimer } = useAutoClearError(error)

  const page = ref(1)
  const size = ref(20)
  const total = ref(0)
  const pages = ref(0)
  const filterParams = ref<Record<string, string>>({})

  const isEditing = computed(() => editingId.value !== null)

  async function fetchTenants() {
    loading.value = true
    error.value = null
    try {
      const res = await tenantsService.getAll(page.value, size.value, filterParams.value)
      tenants.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar tenants'
    } finally {
      loading.value = false
    }
  }

  async function fetchAllTenants() {
    try {
      const res = await tenantsService.getAll(1, 100, { is_active: 'true' })
      return res.items
    } catch {
      return []
    }
  }

  function setFilter(filters: Record<string, string>) {
    filterParams.value = filters
    page.value = 1
    fetchTenants()
  }

  function goToPage(p: number) {
    page.value = p
    fetchTenants()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchTenants()
  }

  function openCreateForm() {
    form.value = { name: '', slug: '' }
    editingId.value = null
    isFormOpen.value = true
  }

  function openEditForm(tenant: Tenant) {
    form.value = { name: tenant.name, slug: tenant.slug }
    editingId.value = tenant.id
    isFormOpen.value = true
  }

  function closeForm() {
    isFormOpen.value = false
    form.value = { name: '', slug: '' }
    editingId.value = null
    error.value = null
  }

  async function saveTenant() {
    saving.value = true
    error.value = null
    try {
      if (editingId.value === null) {
        await tenantsService.create(form.value)
      } else {
        const payload: TenantUpdateForm = {}
        if (form.value.name) payload.name = form.value.name
        await tenantsService.update(editingId.value, payload)
      }
      closeForm()
      fetchTenants()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar tenant'
    } finally {
      saving.value = false
    }
  }

  async function deleteTenant(id: number) {
    loading.value = true
    error.value = null
    try {
      await tenantsService.remove(id)
      if (tenants.value.length === 1 && page.value > 1) page.value--
      fetchTenants()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar tenant'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    clearErrorTimer()
    tenants.value = []
    form.value = { name: '', slug: '' }
    editingId.value = null
    isFormOpen.value = false
    loading.value = false
    saving.value = false
    error.value = null
    page.value = 1
    size.value = 20
    total.value = 0
    pages.value = 0
    filterParams.value = {}
  }

  return {
    tenants,
    form,
    editingId,
    isFormOpen,
    loading,
    saving,
    error,
    page,
    size,
    total,
    pages,
    filterParams,
    isEditing,
    fetchTenants,
    fetchAllTenants,
    setFilter,
    goToPage,
    setSize,
    openCreateForm,
    openEditForm,
    closeForm,
    saveTenant,
    deleteTenant,
    reset,
  }
})
