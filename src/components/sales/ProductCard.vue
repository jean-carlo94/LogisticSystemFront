<script setup lang="ts">
import type { Product } from '@/types/product'
import { formatCurrency } from '@/composables/useFormat'
import { getMediaUrl } from '@/composables/useFormat'

defineProps<{
  product: Product
}>()

defineEmits<{
  select: [product: Product]
}>()
</script>

<template>
  <button class="product-card" @click="$emit('select', product)">
    <img
      v-if="product.image_url"
      :src="getMediaUrl(product.image_url) || ''"
      class="card-img"
      alt=""
    />
    <div v-else class="card-img-placeholder">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    </div>
    <div class="card-body">
      <span class="card-name">{{ product.name }}</span>
      <span class="card-price">{{ formatCurrency(product.price) }}</span>
      <div class="card-meta">
        <span v-if="product.barcode" class="card-barcode">{{ product.barcode }}</span>
        <span class="card-stock" :class="{ 'stock-low': product.stock === 0 }">
          Stock: {{ product.stock }}
        </span>
      </div>
      <div v-if="product.categories.length > 0" class="card-categories">
        <span v-for="cat in product.categories" :key="cat.id" class="category-tag">{{ cat.name }}</span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
  text-align: left;
  font-family: inherit;
  color: var(--text-primary);
  padding: 0;
}

.product-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow);
  transform: translateY(-1px);
}

.product-card:active {
  transform: translateY(0);
}

.card-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-bottom: 1px solid var(--border);
}

.card-img-placeholder {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.card-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-barcode {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--mono);
}

.card-stock {
  font-size: 12px;
  font-weight: 500;
  color: var(--success);
}

.card-stock.stock-low {
  color: var(--danger);
}

.card-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.category-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 500;
}
</style>
