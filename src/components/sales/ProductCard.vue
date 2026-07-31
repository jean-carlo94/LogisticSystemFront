<script setup lang="ts">
import { ref } from 'vue'
import type { Product } from '@/types/product'
import { formatCurrency, getMediaUrl } from '@/composables/useFormat'
import { productsService } from '@/services/products'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  select: [product: Product]
  quickAdd: [product: Product]
  refresh: []
}>()

const repairing = ref(false)
const newStock = ref(0)
const saving = ref(false)

function openRepair() {
  newStock.value = 0
  repairing.value = true
}

function cancelRepair() {
  repairing.value = false
}

async function saveStock() {
  if (newStock.value < 0) return
  saving.value = true
  try {
    await productsService.update(props.product.id, { stock: newStock.value })
    repairing.value = false
    emit('refresh')
  } catch {
    // error ignorado, el backend valida
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div
    :class="['product-card', { 'no-stock': product.stock === 0 }]"
    role="button"
    :tabindex="product.stock === 0 ? -1 : 0"
    @click="product.stock > 0 && $emit('select', product)"
    @keydown.enter="product.stock > 0 && $emit('select', product)"
    @keydown.space.prevent="product.stock > 0 && $emit('select', product)"
  >
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

      <template v-if="repairing">
        <div class="repair-inline" @click.stop @keydown.stop>
          <input
            v-model.number="newStock"
            type="number"
            min="0"
            class="repair-input"
            placeholder="Stock"
            aria-label="Nuevo stock"
            @keyup.enter="saveStock()"
          />
          <button class="repair-confirm" :disabled="saving" @click="saveStock()">{{ saving ? '...' : 'OK' }}</button>
          <button class="repair-cancel" @click="cancelRepair()">✕</button>
        </div>
      </template>
      <template v-else>
        <button
          v-if="product.stock > 0"
          class="quick-add-btn"
          :aria-label="'Agregar ' + product.name + ' al carrito'"
          :title="'Agregar ' + product.name + ' al carrito'"
          @click.stop="emit('quickAdd', product)"
          @keydown.enter.stop="emit('quickAdd', product)"
          @keydown.space.prevent.stop="emit('quickAdd', product)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button
          v-if="product.stock === 0"
          class="repair-btn"
          :aria-label="'Reponer stock de ' + product.name"
          :title="'Reponer stock de ' + product.name"
          @click.stop="openRepair()"
        >
          Reponer
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  position: relative;
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

.quick-add-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.product-card:hover .quick-add-btn {
  opacity: 1;
}

.quick-add-btn:hover {
  filter: brightness(1.1);
}

.product-card.no-stock {
  opacity: 0.6;
}

.repair-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 6px 18px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--warning);
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  box-shadow: var(--shadow);
}

.repair-btn:hover {
  filter: brightness(1.1);
}

.repair-inline {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.repair-input {
  width: 70px !important;
  padding: 4px 6px !important;
  font-size: 13px !important;
  text-align: center;
}

.repair-confirm {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--success);
  color: #fff;
  cursor: pointer;
}

.repair-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
}

.repair-cancel:hover {
  background: var(--danger-light);
  color: var(--danger);
}
</style>
