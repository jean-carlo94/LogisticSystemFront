import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Role, RoleForm, Permission } from '@/types/role'
import { rolesService } from '@/services/roles'

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  const rolePermissions = ref<Permission[]>([])
  const form = ref<RoleForm>({ name: '', description: '' })
  const editingId = ref<number | null>(null)
  const isFormOpen = ref(false)
  const isPermsOpen = ref(false)
  const selectedRoleId = ref<number | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const page = ref(1)
  const size = ref(20)
  const total = ref(0)
  const pages = ref(0)
  const filterParams = ref<Record<string, string>>({})

  const isEditing = computed(() => editingId.value !== null)

  async function fetchRoles() {
    loading.value = true
    error.value = null
    try {
      const res = await rolesService.getAll(page.value, size.value, filterParams.value)
      roles.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar roles'
    } finally {
      loading.value = false
    }
  }

  function setFilter(filters: Record<string, string>) {
    filterParams.value = filters
    page.value = 1
    fetchRoles()
  }

  async function fetchPermissions() {
    try {
      permissions.value = await rolesService.getPermissions()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar permisos'
    }
  }

  async function fetchRolePermissions(roleId: number) {
    try {
      rolePermissions.value = await rolesService.getRolePermissions(roleId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar permisos del rol'
    }
  }

  function goToPage(p: number) {
    page.value = p
    fetchRoles()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchRoles()
  }

  function reset() {
    roles.value = []
    permissions.value = []
    rolePermissions.value = []
    form.value = { name: '', description: '' }
    editingId.value = null
    isFormOpen.value = false
    isPermsOpen.value = false
    selectedRoleId.value = null
    loading.value = false
    saving.value = false
    error.value = null
    page.value = 1
    total.value = 0
    pages.value = 0
    filterParams.value = {}
  }

  function openCreateForm() {
    form.value = { name: '', description: '' }
    editingId.value = null
    isFormOpen.value = true
  }

  function openEditForm(role: Role) {
    form.value = { name: role.name, description: role.description ?? '' }
    editingId.value = role.id
    isFormOpen.value = true
  }

  function closeForm() {
    isFormOpen.value = false
  }

  async function saveRole() {
    if (!form.value.name.trim()) return
    saving.value = true
    error.value = null
    try {
      if (editingId.value !== null) {
        await rolesService.update(editingId.value, form.value)
      } else {
        await rolesService.create(form.value)
      }
      closeForm()
      fetchRoles()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar rol'
    } finally {
      saving.value = false
    }
  }

  async function deleteRole(id: number) {
    loading.value = true
    error.value = null
    try {
      await rolesService.remove(id)
      if (roles.value.length === 1 && page.value > 1) page.value--
      fetchRoles()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar rol'
    } finally {
      loading.value = false
    }
  }

  function openPermissions(roleId: number) {
    selectedRoleId.value = roleId
    isPermsOpen.value = true
    fetchRolePermissions(roleId)
  }

  function closePermissions() {
    isPermsOpen.value = false
    selectedRoleId.value = null
  }

  async function savePermissions(permissionIds: number[]) {
    if (selectedRoleId.value === null) return
    saving.value = true
    error.value = null
    try {
      await rolesService.setRolePermissions(selectedRoleId.value, { permission_ids: permissionIds })
      closePermissions()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar permisos'
    } finally {
      saving.value = false
    }
  }

  return {
    roles,
    permissions,
    rolePermissions,
    form,
    editingId,
    isFormOpen,
    isPermsOpen,
    loading,
    saving,
    error,
    page,
    size,
    total,
    pages,
    filterParams,
    isEditing,
    fetchRoles,
    fetchPermissions,
    fetchRolePermissions,
    setFilter,
    goToPage,
    setSize,
    openCreateForm,
    openEditForm,
    closeForm,
    saveRole,
    deleteRole,
    openPermissions,
    closePermissions,
    savePermissions,
    reset,
  }
})
