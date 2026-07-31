<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import OrdersTable from '@/components/orders/OrdersTable.vue'
import OrdersBoard from '@/components/orders/OrdersBoard.vue'
import OrderFormModal from '@/components/orders/OrderFormModal.vue'
import OrderDetailModal from '@/components/orders/OrderDetailModal.vue'

const store = useOrdersStore()
const auth = useAuthStore()

const viewMode = ref<'table' | 'kanban'>('kanban')

const fStatus = ref(store.filterParams.status ?? '')
const fName = ref(store.filterParams.customer_name ?? '')
const fDate = ref(store.boardDate)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onFiltersChange() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (viewMode.value === 'kanban') {
      store.setBoardFilter(fName.value)
      store.setBoardDate(fDate.value)
    } else {
      const filters: Record<string, string> = {}
      if (fDate.value) filters.created_at = fDate.value
      if (fStatus.value) filters.status = fStatus.value
      if (fName.value) filters.customer_name = fName.value
      store.setFilter(filters)
    }
  }, 400)
}

const unwatchStatus = watch(fStatus, onFiltersChange)
const unwatchName = watch(fName, onFiltersChange)
const unwatchDate = watch(fDate, onFiltersChange)

watch(viewMode, () => {
  fStatus.value = ''
  fName.value = ''
  fDate.value = new Date().toISOString().slice(0, 10)
  store.setBoardDate(fDate.value)
  if (viewMode.value === 'table') {
    store.setFilter({})
    store.fetchOrders()
  } else {
    store.setBoardFilter('')
    store.resetBoardColumns()
  }
})

function clearFilters() {
  fStatus.value = ''
  fName.value = ''
  fDate.value = new Date().toISOString().slice(0, 10)
  if (viewMode.value === 'kanban') {
    store.setBoardFilter('')
    store.setBoardDate(fDate.value)
  } else {
    store.setFilter({ created_at: fDate.value })
  }
}

onMounted(() => {
  store.setBoardDate(fDate.value)
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  unwatchStatus()
  unwatchName()
  unwatchDate()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Pedidos</h1>
      <div class="header-right">
        <div class="view-toggle">
          <button :class="['toggle-btn', { active: viewMode === 'kanban' }]" @click="viewMode = 'kanban'">Kanban</button>
          <button :class="['toggle-btn', { active: viewMode === 'table' }]" @click="viewMode = 'table'">Tabla</button>
        </div>
        <button v-if="auth.hasPermission('orders_create')" class="btn btn-primary" @click="store.openCreateForm()">+ Nuevo</button>
      </div>
    </div>

    <OrderFormModal />
    <OrderDetailModal />

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Fecha</label>
        <input
          v-model="fDate"
          type="date"
          class="filter-field filter-date"
          aria-label="Filtrar por fecha"
        />
      </div>
      <div class="filter-group">
        <label class="filter-label">Cliente</label>
        <input
          v-model="fName"
          type="text"
          class="filter-field"
          placeholder="Buscar..."
          aria-label="Filtrar por nombre de cliente"
        />
      </div>
      <div v-if="viewMode === 'table'" class="filter-group">
        <label class="filter-label">Estado</label>
        <select v-model="fStatus" class="filter-field" aria-label="Filtrar por estado">
          <option value="">Todos</option>
          <option value="CREATED">Creado</option>
          <option value="PREPARING">Preparando</option>
          <option value="READY">Listo</option>
          <option value="DELIVERED">Entregado</option>
        </select>
      </div>
      <button v-if="fName || (viewMode === 'table' && fStatus)" class="btn btn-ghost" @click="clearFilters()">Limpiar</button>
    </div>

    <template v-if="viewMode === 'table'">
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
    </template>

    <template v-if="viewMode === 'kanban'">
      <div v-if="store.error && !Object.values(store.boardColumns).some(c => c.items.length > 0)" class="error-banner">
        <span>{{ store.error }}</span>
        <button class="btn" @click="store.resetBoardColumns()">Reintentar</button>
      </div>

      <OrdersBoard />
    </template>
  </div>
</template>

<style scoped>
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.view-toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.toggle-btn {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.toggle-btn:hover {
  background: var(--bg-hover);
}

.toggle-btn.active {
  background: var(--accent);
  color: #fff;
}

.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end; }

.filter-field { width: auto; min-width: 160px; }

.filter-date { min-width: 180px; }

@media (max-width: 640px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .filter-field {
    width: 100% !important;
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-wrap: wrap;
    gap: 10px;
  }

  .header-right {
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  .view-toggle {
    flex: 1;
  }

  .toggle-btn {
    flex: 1;
    text-align: center;
  }

  .header-right .btn-primary {
    width: 100%;
  }
}
</style>
