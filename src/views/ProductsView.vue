<script setup lang="ts">
import { onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import ProductForm from '@/components/products/ProductForm.vue'
import ProductsTable from '@/components/products/ProductsTable.vue'
import Pagination from '@/components/ui/Pagination.vue'

const store = useProductsStore()

onMounted(() => {
  store.fetchProducts()
})
</script>

<template>
  <div class="products-page">
    <header class="page-header">
      <h1>Productos</h1>
      <button class="btn btn-primary" @click="store.openCreateForm()">+ Nuevo producto</button>
    </header>

    <ProductForm />

    <div v-if="store.loading && store.products.length === 0" class="empty-state">
      <p>Cargando productos...</p>
    </div>

    <div v-else-if="store.error && store.products.length === 0" class="error-banner">
      <p>{{ store.error }}</p>
      <button class="btn btn-sm" @click="store.fetchProducts()">Reintentar</button>
    </div>

    <div v-else-if="store.products.length === 0" class="empty-state">
      <p>No hay productos registrados.</p>
    </div>

    <div v-if="store.error && store.products.length > 0" class="error-banner">
      <p>{{ store.error }}</p>
    </div>

    <ProductsTable />

    <Pagination
      :page="store.page"
      :pages="store.pages"
      :total="store.total"
      @change="store.goToPage"
    />
  </div>
</template>

<style scoped>
.products-page {
  width: 100%;
  padding: 32px;
  text-align: left;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
}

.btn {
  font-family: inherit;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  background: var(--bg);
  color: var(--text-h);
  transition: background 0.2s, border-color 0.2s;
}

.btn:hover {
  border-color: var(--accent-border);
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 64px 0;
  color: var(--text);
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.error-banner p {
  color: #ef4444;
  margin: 0;
}

@media (max-width: 768px) {
  .products-page {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
