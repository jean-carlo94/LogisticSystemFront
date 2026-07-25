<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
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

watch([fEmail, fFirst, fLast, fCity, fCountry, fActive, fSuper], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (hasFilters()) {
      doFilter()
    } else if (Object.keys(store.filterParams).length > 0) {
      store.setFilter({})
    }
  }, 400)
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
    </div>

    <div class="filter-bar">
      <input v-model="fEmail" type="text" placeholder="Email" class="filter-field" @keyup.enter="doFilter" />
      <input v-model="fFirst" type="text" placeholder="Nombre" class="filter-field" @keyup.enter="doFilter" />
      <input v-model="fLast" type="text" placeholder="Apellido" class="filter-field" @keyup.enter="doFilter" />
      <input v-model="fCity" type="text" placeholder="Ciudad" class="filter-field" @keyup.enter="doFilter" />
      <input v-model="fCountry" type="text" placeholder="País" class="filter-field" @keyup.enter="doFilter" />
      <select v-model="fActive" class="filter-field" @change="doFilter">
        <option value="">Activo?</option>
        <option value="true">Activo</option>
        <option value="false">Inactivo</option>
      </select>
      <select v-model="fSuper" class="filter-field" @change="doFilter">
        <option value="">Tipo</option>
        <option value="true">Super Admin</option>
        <option value="false">Usuario normal</option>
      </select>
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
