<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useCustomersStore } from '@/stores/customers'
import { useAuthStore } from '@/stores/auth'
import CustomerFormModal from '@/components/customers/CustomerFormModal.vue'
import CustomersTable from '@/components/customers/CustomersTable.vue'

const store = useCustomersStore()
const auth = useAuthStore()

const fName = ref(store.filterParams.name ?? '')
const fEmail = ref(store.filterParams.email ?? '')
const fDocument = ref(store.filterParams.document ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const unwatch = watch([fName, fEmail, fDocument], () => {
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
  if (fEmail.value) p.email = fEmail.value
  if (fDocument.value) p.document = fDocument.value
  store.setFilter(p)
}

const hasFilters = () => fName.value || fEmail.value || fDocument.value

onMounted(() => {
  store.fetchCustomers()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Clientes</h1>
      <button v-if="auth.hasPermission('customers_manage')" class="btn btn-primary" @click="store.openCreateForm()">+ Nuevo</button>
    </div>

    <CustomerFormModal />

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Nombre</label>
        <input v-model="fName" type="text" placeholder="Buscar..." aria-label="Filtrar por nombre" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Email</label>
        <input v-model="fEmail" type="text" placeholder="Buscar..." aria-label="Filtrar por email" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Documento</label>
        <input v-model="fDocument" type="text" placeholder="Buscar..." aria-label="Filtrar por documento" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <button class="btn" @click="doFilter">Filtrar</button>
      <button v-if="hasFilters()" class="btn btn-ghost" @click="fName = ''; fEmail = ''; fDocument = ''; store.setFilter({})">Limpiar</button>
    </div>

    <div v-if="store.loading && store.customers.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 40px; height: 16px"></div>
        <div class="skeleton" style="width: 180px; height: 16px"></div>
        <div class="skeleton" style="width: 180px; height: 16px"></div>
        <div class="skeleton" style="width: 120px; height: 16px"></div>
        <div class="skeleton" style="width: 100px; height: 16px"></div>
        <div class="skeleton" style="width: 150px; height: 16px"></div>
        <div class="skeleton" style="width: 100px; height: 16px"></div>
      </div>
    </div>
    <div v-else-if="store.error && store.customers.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchCustomers()">Reintentar</button>
    </div>
    <div v-else-if="store.customers.length === 0" class="empty-state">
      <p>No hay clientes registrados.</p>
    </div>
    <div v-if="store.error && store.customers.length > 0" class="error-banner">
      <span>{{ store.error }}</span>
    </div>

    <CustomersTable />
  </div>
</template>

<style scoped>
.filter-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end; }
.filter-field { width: auto; min-width: 180px; }
</style>
