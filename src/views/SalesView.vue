<script setup lang="ts">
import { onMounted } from 'vue'
import { useSalesStore } from '@/stores/sales'
import ProductSearch from '@/components/sales/ProductSearch.vue'
import SalesCart from '@/components/sales/SalesCart.vue'
import ShelfPickerModal from '@/components/sales/ShelfPickerModal.vue'

const store = useSalesStore()

onMounted(() => {
  if (store.sales.length === 0) {
    store.fetchSales()
  }
  store.fetchInitialProducts()
})
</script>

<template>
  <div class="page sales-page">
    <div class="page-header">
      <h1>Nueva Venta</h1>
    </div>

    <ShelfPickerModal />

    <div class="sales-layout">
      <div class="sales-main">
        <ProductSearch />
      </div>
      <div class="sales-sidebar">
        <SalesCart />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sales-page {
  max-width: 1400px;
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
