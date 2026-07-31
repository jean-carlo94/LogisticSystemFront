<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import { useShelvesStore } from '@/stores/shelves'
import { categoriesService } from '@/services/categories'
import type { Category } from '@/types/category'
import ProductForm from '@/components/products/ProductForm.vue'
import ProductsTable from '@/components/products/ProductsTable.vue'
import { ProductState } from '@/types/product'

const store = useProductsStore()
const auth = useAuthStore()
const shelvesStore = useShelvesStore()
const route = useRoute()

const fName = ref(store.filterParams.name ?? '')
const fBarcode = ref(store.filterParams.barcode ?? '')
const fState = ref(store.filterParams.state ?? '')
const fStock = ref(store.filterParams.stock ?? '')
const fCategory = ref(store.filterParams.category_id ?? '')
const categories = ref<Category[]>([])

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const unwatch = watch([fName, fBarcode, fState, fStock, fCategory], () => {
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
  if (fBarcode.value) p.barcode = fBarcode.value
  if (fState.value) p.state = fState.value
  if (fStock.value) p.stock = fStock.value
  if (fCategory.value) p.category_id = fCategory.value
  store.setFilter(p)
}

function clearFilter() {
  fName.value = ''
  fBarcode.value = ''
  fState.value = ''
  fStock.value = ''
  fCategory.value = ''
  store.setFilter({})
}

const hasFilters = () => fName.value || fBarcode.value || fState.value || fStock.value || fCategory.value

onMounted(async () => {
  store.fetchProducts()
  if (shelvesStore.details.size === 0) {
    shelvesStore.fetchShelves()
  }
  try {
    const res = await categoriesService.getAll(1, 100)
    categories.value = res.items
  } catch { /* ignore */ }
  const editId = route.query.edit
  if (editId) {
    store.editById(Number(editId))
  }
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Productos</h1>
      <button v-if="auth.hasPermission('products_create')" class="btn btn-primary" @click="store.openCreateForm()">+ Nuevo</button>
    </div>

    <ProductForm />

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Nombre</label>
        <input v-model="fName" type="text" placeholder="Buscar..." aria-label="Filtrar por nombre" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Código</label>
        <input v-model="fBarcode" type="text" placeholder="Buscar..." aria-label="Filtrar por código de barras" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Estado</label>
        <select v-model="fState" aria-label="Filtrar por estado" class="filter-field" @change="doFilter">
          <option value="">Todos</option>
        <option :value="ProductState.ACTIVE">Activo</option>
        <option :value="ProductState.INACTIVE">Inactivo</option>
        <option :value="ProductState.NO_STOCK">Sin stock</option>
          <option :value="ProductState.DISCONTINUED">Descontinuado</option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Stock</label>
        <input v-model="fStock" type="number" min="0" placeholder="Exacto" aria-label="Filtrar por stock exacto" class="filter-field filter-num" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Categoría</label>
        <select v-model="fCategory" aria-label="Filtrar por categoría" class="filter-field" @change="doFilter">
          <option value="">Todas</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      </div>
      <button class="btn" @click="doFilter">Filtrar</button>
      <button v-if="hasFilters()" class="btn btn-ghost" @click="clearFilter">Limpiar</button>
    </div>

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
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-field {
  width: auto;
  min-width: 150px;
}

.filter-num {
  max-width: 120px;
}
</style>
