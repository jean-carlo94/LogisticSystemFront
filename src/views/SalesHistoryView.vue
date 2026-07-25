<script setup lang="ts">
import { onMounted } from 'vue'
import { useSalesStore } from '@/stores/sales'
import { useAuthStore } from '@/stores/auth'
import SalesTable from '@/components/sales/SalesTable.vue'
import SaleDetailModal from '@/components/sales/SaleDetailModal.vue'

const store = useSalesStore()
const auth = useAuthStore()

onMounted(() => {
  store.fetchSales()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Historial de Ventas</h1>
      <router-link v-if="auth.hasPermission('sales_create')" to="/sales" class="btn btn-primary">+ Nueva Venta</router-link>
    </div>

    <SaleDetailModal />

    <div v-if="store.loading && store.sales.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 40px; height: 16px"></div>
        <div class="skeleton" style="width: 160px; height: 16px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
        <div class="skeleton" style="width: 60px; height: 16px"></div>
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
  </div>
</template>
