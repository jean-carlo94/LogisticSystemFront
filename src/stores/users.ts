import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserAdmin, UserAdminForm } from '@/types/user'
import type { Role } from '@/types/role'
import { usersService } from '@/services/users'
import { rolesService } from '@/services/roles'

export const useUsersStore = defineStore('users', () => {
  const users = ref<UserAdmin[]>([])
  const roles = ref<Role[]>([])
  const form = ref<UserAdminForm>({})
  const editingId = ref<number | null>(null)
  const isFormOpen = ref(false)
  const isAssignOpen = ref(false)
  const assignUserId = ref<number | null>(null)
  const selectedRoleId = ref<number | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const page = ref(1)
  const size = ref(20)
  const total = ref(0)
  const pages = ref(0)

  const isEditing = computed(() => editingId.value !== null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      const res = await usersService.getAll(page.value, size.value)
      users.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar usuarios'
    } finally {
      loading.value = false
    }
  }

  async function fetchRoles() {
    try {
      const res = await rolesService.getAll(1, 100)
      roles.value = res.items
    } catch {
      /* silent */
    }
  }

  function goToPage(p: number) {
    page.value = p
    fetchUsers()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchUsers()
  }

  function reset() {
    users.value = []
    roles.value = []
    form.value = {}
    editingId.value = null
    isFormOpen.value = false
    isAssignOpen.value = false
    assignUserId.value = null
    selectedRoleId.value = null
    loading.value = false
    saving.value = false
    error.value = null
    page.value = 1
    total.value = 0
    pages.value = 0
  }

  function openEditForm(user: UserAdmin) {
    form.value = { email: user.email }
    editingId.value = user.id
    isFormOpen.value = true
  }

  function closeForm() {
    isFormOpen.value = false
    form.value = {}
    editingId.value = null
  }

  async function saveUser() {
    if (editingId.value === null) return
    saving.value = true
    error.value = null
    try {
      const payload: UserAdminForm = {}
      if (form.value.email) payload.email = form.value.email
      if (form.value.password) payload.password = form.value.password
      if (form.value.is_active !== undefined) payload.is_active = form.value.is_active

      await usersService.update(editingId.value, payload)
      closeForm()
      fetchUsers()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar usuario'
    } finally {
      saving.value = false
    }
  }

  async function deleteUser(id: number) {
    loading.value = true
    error.value = null
    try {
      await usersService.remove(id)
      if (users.value.length === 1 && page.value > 1) page.value--
      fetchUsers()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar usuario'
    } finally {
      loading.value = false
    }
  }

  async function toggleActive(user: UserAdmin) {
    saving.value = true
    error.value = null
    try {
      await usersService.update(user.id, { is_active: !user.is_active })
      fetchUsers()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cambiar estado'
    } finally {
      saving.value = false
    }
  }

  function openAssign(userId: number) {
    assignUserId.value = userId
    selectedRoleId.value = null
    isAssignOpen.value = true
    fetchRoles()
  }

  function closeAssign() {
    isAssignOpen.value = false
    assignUserId.value = null
    selectedRoleId.value = null
  }

  async function saveAssign() {
    if (assignUserId.value === null || selectedRoleId.value === null) return
    saving.value = true
    error.value = null
    try {
      await rolesService.assignRole({ user_id: assignUserId.value, role_id: selectedRoleId.value })
      closeAssign()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al asignar rol'
    } finally {
      saving.value = false
    }
  }

  return {
    users,
    roles,
    form,
    editingId,
    isFormOpen,
    isAssignOpen,
    assignUserId,
    selectedRoleId,
    loading,
    saving,
    error,
    page,
    size,
    total,
    pages,
    isEditing,
    fetchUsers,
    fetchRoles,
    goToPage,
    setSize,
    openEditForm,
    closeForm,
    saveUser,
    deleteUser,
    toggleActive,
    openAssign,
    closeAssign,
    saveAssign,
    reset,
  }
})
