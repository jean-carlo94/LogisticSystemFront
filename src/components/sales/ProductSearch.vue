<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import type { Product } from '@/types/product'
import { useSalesStore } from '@/stores/sales'
import ProductCard from './ProductCard.vue'

const store = useSalesStore()
const query = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (query.value.trim()) {
      store.searchProducts(query.value)
    } else {
      store.fetchInitialProducts()
    }
  }, 400)
}

function onEnter() {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (query.value.trim()) {
    store.searchProducts(query.value)
  } else {
    store.fetchInitialProducts()
  }
}

function selectProduct(product: Product) {
  store.openShelfPicker(product)
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div class="product-search">
    <div class="search-bar">
      <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        v-model="query"
        type="text"
        class="search-input"
        placeholder="Buscar por nombre o código de barras..."
        aria-label="Buscar producto por nombre o código de barras"
        @input="onInput"
        @keyup.enter="onEnter"
      />
      <button v-if="query" class="search-clear" @click="query = ''; store.fetchInitialProducts()" aria-label="Limpiar búsqueda">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div v-if="store.searchLoading" class="skeleton-grid">
      <div v-for="i in 6" :key="i" class="skeleton" style="height: 220px; border-radius: var(--radius)"></div>
    </div>

    <div v-else-if="store.searchError" class="error-banner">
      <span>{{ store.searchError }}</span>
    </div>

    <div v-else-if="query && !store.searchLoading && store.searchedProducts.length === 0" class="empty-state">
      <p>No se encontraron productos.</p>
    </div>

    <div v-else-if="store.searchedProducts.length > 0" class="products-grid">
      <ProductCard
        v-for="product in store.searchedProducts"
        :key="product.id"
        :product="product"
        @select="selectProduct"
        @quick-add="store.addToCartDirect"
      />
    </div>

    <div v-if="!query && !store.searchLoading && store.searchedProducts.length === 0" class="search-hint">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <p>Busca un producto para comenzar una venta</p>
    </div>
  </div>
</template>

<style scoped>
.product-search {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 16px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-bar:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 14px 12px;
  font-size: 16px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
  font-size: 15px;
}

.search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  flex-shrink: 0;
}

.search-clear:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.search-hint {
  text-align: center;
  padding: 64px 0;
  color: var(--text-muted);
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
