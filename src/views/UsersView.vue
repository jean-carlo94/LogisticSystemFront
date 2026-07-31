<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useUsersStore } from '@/stores/users'
import UsersTable from '@/components/users/UsersTable.vue'
import UserFormModal from '@/components/users/UserFormModal.vue'
import RoleAssignModal from '@/components/users/RoleAssignModal.vue'

const store = useUsersStore()

const fEmail = ref(store.filterParams.email ?? '')
const fFirst = ref(store.filterParams.first_name ?? '')
const fLast = ref(store.filterParams.last_name ?? '')
const fCity = ref(store.filterParams.city ?? '')
const fCountry = ref(store.filterParams.country ?? '')
const fActive = ref(store.filterParams.is_active ?? '')
const fSuper = ref(store.filterParams.is_super_admin ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const unwatch = watch([fEmail, fFirst, fLast, fCity, fCountry, fActive, fSuper], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (hasFilters()) {
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
  if (fEmail.value) p.email = fEmail.value
  if (fFirst.value) p.first_name = fFirst.value
  if (fLast.value) p.last_name = fLast.value
  if (fCity.value) p.city = fCity.value
  if (fCountry.value) p.country = fCountry.value
  if (fActive.value) p.is_active = fActive.value
  if (fSuper.value) p.is_super_admin = fSuper.value
  store.setFilter(p)
}

function clearFilter() {
  fEmail.value = ''
  fFirst.value = ''
  fLast.value = ''
  fCity.value = ''
  fCountry.value = ''
  fActive.value = ''
  fSuper.value = ''
  store.setFilter({})
}

const hasFilters = () => fEmail.value || fFirst.value || fLast.value || fCity.value || fCountry.value || fActive.value || fSuper.value

onMounted(() => {
  store.fetchUsers()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Usuarios</h1>
      <button class="btn btn-primary" @click="store.openCreateForm()">Nuevo usuario</button>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Email</label>
        <input v-model="fEmail" type="text" placeholder="Buscar..." aria-label="Filtrar por email" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Nombre</label>
        <input v-model="fFirst" type="text" placeholder="Buscar..." aria-label="Filtrar por nombre" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Apellido</label>
        <input v-model="fLast" type="text" placeholder="Buscar..." aria-label="Filtrar por apellido" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Ciudad</label>
        <input v-model="fCity" type="text" placeholder="Buscar..." aria-label="Filtrar por ciudad" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">País</label>
        <input v-model="fCountry" type="text" placeholder="Buscar..." aria-label="Filtrar por país" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Activo</label>
        <select v-model="fActive" aria-label="Filtrar por estado activo" class="filter-field" @change="doFilter">
          <option value="">Todos</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Tipo</label>
        <select v-model="fSuper" aria-label="Filtrar por tipo de usuario" class="filter-field" @change="doFilter">
          <option value="">Todos</option>
        <option value="true">Super Admin</option>
          <option value="false">Usuario normal</option>
        </select>
      </div>
      <button class="btn" @click="doFilter">Filtrar</button>
      <button v-if="hasFilters()" class="btn btn-ghost" @click="clearFilter">Limpiar</button>
    </div>

    <div v-if="store.loading && store.users.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 30px; height: 16px"></div>
        <div class="skeleton" style="width: 200px; height: 16px"></div>
        <div class="skeleton" style="width: 140px; height: 16px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
        <div class="skeleton" style="width: 70px; height: 22px"></div>
        <div class="skeleton" style="width: 80px; height: 22px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
      </div>
    </div>
    <div v-else-if="store.error && store.users.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchUsers()">Reintentar</button>
    </div>

    <UsersTable />

    <UserFormModal />
    <RoleAssignModal />
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-field {
  width: auto;
  min-width: 130px;
}

.empty-state {
  padding: 32px 0;
}
</style>
