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

    <div v-if="store.loading && store.products.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 40px; height: 16px"></div>
        <div class="skeleton" style="width: 180px; height: 16px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
        <div class="skeleton" style="width: 40px; height: 16px"></div>
        <div class="skeleton" style="width: 70px; height: 22px"></div>
      </div>
    </div>
    <div v-else-if="store.error && store.products.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchProducts()">Reintentar</button>
    </div>
    <div v-else-if="store.products.length === 0" class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.3">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
      <p>No hay productos registrados.</p>
    </div>
    <div v-if="store.error && store.products.length > 0" class="error-banner">
      <span>{{ store.error }}</span>
    </div>

    <ProductsTable />
  </div>
</template>

<style scoped>
</style>
