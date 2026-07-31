<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useTenantsStore } from '@/stores/tenants'
import TenantsTable from '@/components/tenants/TenantsTable.vue'
import TenantFormModal from '@/components/tenants/TenantFormModal.vue'

const store = useTenantsStore()

const fName = ref(store.filterParams.name ?? '')
const fSlug = ref(store.filterParams.slug ?? '')
const fActive = ref(store.filterParams.is_active ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const unwatch = watch([fName, fSlug, fActive], () => {
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
  if (fName.value) p.name = fName.value
  if (fSlug.value) p.slug = fSlug.value
  if (fActive.value) p.is_active = fActive.value
  store.setFilter(p)
}

function clearFilter() {
  fName.value = ''
  fSlug.value = ''
  fActive.value = ''
  store.setFilter({})
}

const hasFilters = () => fName.value || fSlug.value || fActive.value

onMounted(() => {
  store.fetchTenants()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Tenants</h1>
      <button class="btn btn-primary" @click="store.openCreateForm()">Nuevo tenant</button>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Nombre</label>
        <input v-model="fName" type="text" placeholder="Buscar..." aria-label="Filtrar por nombre" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Slug</label>
        <input v-model="fSlug" type="text" placeholder="Buscar..." aria-label="Filtrar por slug" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Activo</label>
        <select v-model="fActive" aria-label="Filtrar por estado activo" class="filter-field" @change="doFilter">
          <option value="">Todos</option>
        <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>
      <button class="btn" @click="doFilter">Filtrar</button>
      <button v-if="hasFilters()" class="btn btn-ghost" @click="clearFilter">Limpiar</button>
    </div>

    <div v-if="store.loading && store.tenants.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 30px; height: 16px"></div>
        <div class="skeleton" style="width: 180px; height: 16px"></div>
        <div class="skeleton" style="width: 140px; height: 16px"></div>
        <div class="skeleton" style="width: 70px; height: 22px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
      </div>
    </div>
    <div v-else-if="store.error && store.tenants.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchTenants()">Reintentar</button>
    </div>

    <TenantsTable />

    <TenantFormModal />
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
</style>
