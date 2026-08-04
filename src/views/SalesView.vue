<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSalesStore } from '@/stores/sales'
import { useShelvesStore } from '@/stores/shelves'
import ProductSearch from '@/components/sales/ProductSearch.vue'
import SalesCart from '@/components/sales/SalesCart.vue'
import SalesTable from '@/components/sales/SalesTable.vue'
import SaleDetailModal from '@/components/sales/SaleDetailModal.vue'
import ShelfPickerModal from '@/components/sales/ShelfPickerModal.vue'
import PaymentFormModal from '@/components/payments/PaymentFormModal.vue'
import SaleReceiptModal from '@/components/sales/SaleReceiptModal.vue'

const store = useSalesStore()
const shelvesStore = useShelvesStore()
const tab = ref<'sale' | 'history'>('sale')

function switchTab(t: 'sale' | 'history') {
  tab.value = t
  document.title = t === 'sale' ? 'Nueva Venta — Logistic System' : 'Historial de Ventas — Logistic System'
  if (t === 'history' && store.sales.length === 0) {
    store.fetchSales()
  }
}

onMounted(() => {
  store.fetchInitialProducts()
  shelvesStore.fetchShelves()
})
</script>

<template>
  <div class="page sales-page">
    <div class="page-header">
      <h1>{{ tab === 'sale' ? 'Nueva Venta' : 'Historial' }}</h1>
      <div class="tab-bar">
        <button :class="['tab-btn', { active: tab === 'sale' }]" @click="switchTab('sale')">Vender</button>
        <button :class="['tab-btn', { active: tab === 'history' }]" @click="switchTab('history')">Historial</button>
      </div>
    </div>

    <ShelfPickerModal />
    <SaleDetailModal />
    <PaymentFormModal />
    <SaleReceiptModal />

    <template v-if="tab === 'sale'">
      <div class="sales-layout">
        <div class="sales-main">
          <ProductSearch />
        </div>
        <div class="sales-sidebar">
          <SalesCart />
        </div>
      </div>
    </template>

    <template v-else>
      <div v-if="store.loading && store.sales.length === 0" class="skeleton-table">
        <div v-for="i in 5" :key="i" class="skeleton-row">
          <div class="skeleton" style="width: 40px; height: 16px"></div>
          <div class="skeleton" style="width: 180px; height: 16px"></div>
          <div class="skeleton" style="width: 100px; height: 16px"></div>
          <div class="skeleton" style="width: 100px; height: 16px"></div>
          <div class="skeleton" style="width: 80px; height: 16px"></div>
        </div>
      </div>
      <div v-else-if="store.error && store.sales.length === 0" class="error-banner">
        <span>{{ store.error }}</span>
        <button class="btn" @click="store.fetchSales()">Reintentar</button>
      </div>
      <div v-else-if="store.sales.length === 0" class="empty-state">
        <p>No hay ventas registradas.</p>
      </div>
      <div v-if="store.error && store.sales.length > 0" class="error-banner">
        <span>{{ store.error }}</span>
      </div>
      <SalesTable />
    </template>
  </div>
</template>

<style scoped>
.sales-page {
  max-width: 1400px;
}

.tab-bar {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.sales-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.sales-main {
  flex: 1;
  min-width: 0;
}

.sales-sidebar {
  width: 380px;
  flex-shrink: 0;
}

@media (max-width: 1024px) {
  .sales-layout {
    flex-direction: column;
  }

  .sales-sidebar {
    width: 100%;
  }
}
</style>
