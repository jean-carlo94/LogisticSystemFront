<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRolesStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'
import RolesTable from '@/components/roles/RolesTable.vue'
import RoleFormModal from '@/components/roles/RoleFormModal.vue'
import PermissionsModal from '@/components/roles/PermissionsModal.vue'

const store = useRolesStore()
const auth = useAuthStore()

const fName = ref(store.filterParams.name ?? '')
const fDesc = ref(store.filterParams.description ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const unwatch = watch([fName, fDesc], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (fName.value || fDesc.value) {
      doFilter()
    } else if (Object.keys(store.filterParams).length > 0) {
      store.setFilter({})
    }
  }, 400)
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  unwatch()
})

function doFilter() {
  const p: Record<string, string> = {}
  if (fName.value) p.name = fName.value
  if (fDesc.value) p.description = fDesc.value
  store.setFilter(p)
}

function clearFilter() {
  fName.value = ''
  fDesc.value = ''
  store.setFilter({})
}

onMounted(() => {
  store.fetchRoles()
  store.fetchPermissions()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Roles</h1>
      <button v-if="auth.hasPermission('roles_manage')" class="btn btn-primary" @click="store.openCreateForm()">+ Nuevo rol</button>
    </div>

    <div class="filter-bar">
      <input v-model="fName" type="text" placeholder="Nombre del rol" aria-label="Filtrar por nombre del rol" class="filter-field" @keyup.enter="doFilter" />
      <input v-model="fDesc" type="text" placeholder="Descripción" aria-label="Filtrar por descripción" class="filter-field" @keyup.enter="doFilter" />
      <button class="btn" @click="doFilter">Filtrar</button>
      <button v-if="fName || fDesc" class="btn btn-ghost" @click="clearFilter">Limpiar</button>
    </div>

    <div v-if="store.loading && store.roles.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 30px; height: 16px"></div>
        <div class="skeleton" style="width: 180px; height: 16px"></div>
        <div class="skeleton" style="width: 260px; height: 16px"></div>
      </div>
    </div>
    <div v-else-if="store.error && store.roles.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchRoles()">Reintentar</button>
    </div>

    <RolesTable />

    <RoleFormModal />
    <PermissionsModal />
  </div>
</template>

<style scoped>
.page {
  max-width: 1100px;
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-field {
  width: auto;
  min-width: 180px;
}
</style>
