<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import OrdersTable from '@/components/orders/OrdersTable.vue'
import OrderFormModal from '@/components/orders/OrderFormModal.vue'
import OrderDetailModal from '@/components/orders/OrderDetailModal.vue'

const store = useOrdersStore()
const auth = useAuthStore()

const fStatus = ref(store.filterParams.status ?? '')
const fName = ref(store.filterParams.customer_name ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onFiltersChange() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const filters: Record<string, string> = {}
    if (fStatus.value) filters.status = fStatus.value
    if (fName.value) filters.customer_name = fName.value
    store.setFilter(filters)
  }, 400)
}

const unwatchStatus = watch(fStatus, onFiltersChange)
const unwatchName = watch(fName, onFiltersChange)

function clearFilters() {
  fStatus.value = ''
  fName.value = ''
  store.setFilter({})
}

onMounted(() => {
  store.fetchOrders()
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  unwatchStatus()
  unwatchName()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Pedidos</h1>
      <button v-if="auth.hasPermission('orders_create')" class="btn btn-primary" @click="store.openCreateForm()">+ Nuevo</button>
    </div>

    <OrderFormModal />
    <OrderDetailModal />

    <div class="filter-bar">
      <input
        v-model="fName"
        type="text"
        class="filter-field"
        placeholder="Buscar cliente..."
        aria-label="Filtrar por nombre de cliente"
      />
      <select v-model="fStatus" class="filter-field" aria-label="Filtrar por estado">
        <option value="">Todos los estados</option>
        <option value="CREATED">Creado</option>
        <option value="PREPARING">Preparando</option>
        <option value="READY">Listo</option>
        <option value="DELIVERED">Entregado</option>
      </select>
      <button v-if="fName || fStatus" class="btn btn-ghost" @click="clearFilters()">Limpiar</button>
    </div>

    <div v-if="store.loading && store.orders.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 40px; height: 16px"></div>
        <div class="skeleton" style="width: 120px; height: 16px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
        <div class="skeleton" style="width: 120px; height: 16px"></div>
      </div>
    </div>

    <div v-else-if="store.error && store.orders.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchOrders()">Reintentar</button>
    </div>

    <div v-else-if="store.orders.length === 0" class="empty-state">
      <p>No hay pedidos registrados.</p>
    </div>

    <div v-if="store.error && store.orders.length > 0" class="error-banner">
      <span>{{ store.error }}</span>
    </div>

    <OrdersTable />
  </div>
</template>

<style scoped>
.filter-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end; }
.filter-field { width: auto; min-width: 200px; }
</style>
