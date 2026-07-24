<script setup lang="ts">
import { onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import ProductForm from '@/components/products/ProductForm.vue'
import ProductsTable from '@/components/products/ProductsTable.vue'

const store = useProductsStore()
const auth = useAuthStore()

onMounted(() => {
  store.fetchProducts()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Productos</h1>
      <button v-if="auth.hasPermission('products_create')" class="btn btn-primary" @click="store.openCreateForm()">+ Nuevo</button>
    </div>

    <ProductForm />

    <div v-if="store.loading && store.products.length === 0" class="empty-state">Cargando productos...</div>
    <div v-else-if="store.error && store.products.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchProducts()">Reintentar</button>
    </div>
    <div v-else-if="store.products.length === 0" class="empty-state">No hay productos registrados.</div>
    <div v-if="store.error && store.products.length > 0" class="error-banner">
      <span>{{ store.error }}</span>
    </div>

    <ProductsTable />
  </div>
</template>

<style scoped>
.page {
  flex: 1;
  padding: 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.empty-state { text-align: center; padding: 64px 0; color: var(--text-secondary); font-size: 14px; }

.error-banner {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; margin-bottom: 16px; border-radius: var(--radius-sm);
  background: var(--danger-light); border: 1px solid var(--danger);
  color: var(--danger); font-size: 13px;
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
}
</style>
