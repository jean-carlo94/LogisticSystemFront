<script setup lang="ts">
import { ref, computed } from 'vue'
import { useShelvesStore } from '@/stores/shelves'

const store = useShelvesStore()
const search = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return store.paletteProducts
  return store.paletteProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      String(p.id).includes(q),
  )
})

function onDragStart(event: DragEvent, productId: number, productName: string) {
  event.dataTransfer!.effectAllowed = 'copy'
  event.dataTransfer!.setData('productId', String(productId))
  event.dataTransfer!.setData('productName', productName)
}
</script>

<template>
  <aside class="product-palette">
    <div class="palette-header">
      <h3>Productos</h3>
      <button class="palette-close" @click="store.togglePalette()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <input
      v-model="search"
      type="text"
      placeholder="Buscar producto..."
      class="palette-search"
    />

    <div v-if="store.paletteLoading" class="palette-loading">
      <div v-for="i in 4" :key="i" class="skeleton" style="height: 48px; margin-bottom: 8px;"></div>
    </div>

    <div v-else-if="store.paletteError" class="error-banner" style="margin: 8px 0;">
      <span>{{ store.paletteError }}</span>
    </div>

    <div v-else class="palette-list">
      <div
        v-for="product in filtered"
        :key="product.id"
        class="palette-item"
        draggable="true"
        @dragstart="onDragStart($event, product.id, product.name)"
      >
        <div class="palette-item-info">
          <span class="palette-item-name">{{ product.name }}</span>
          <span class="palette-item-stock">Stock: {{ product.stock }}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="drag-handle"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>
      </div>

      <div v-if="filtered.length === 0" class="empty-state" style="padding: 24px 0;">
        <p>Sin resultados</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.product-palette {
  width: 300px;
  flex-shrink: 0;
  background: var(--bg-surface);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 56px - 64px);
  position: sticky;
  top: 0;
}

.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px;
}

.palette-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.palette-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.palette-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.palette-search {
  margin: 8px 16px;
  font-size: 13px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s;
  width: auto;
}

.palette-search:focus {
  border-color: var(--border-focus);
}

.palette-loading {
  padding: 8px 16px;
}

.palette-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 16px;
}

.palette-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: grab;
  transition: all 0.15s;
  gap: 8px;
}

.palette-item:hover {
  background: var(--bg-hover);
}

.palette-item:active {
  cursor: grabbing;
  opacity: 0.6;
}

.palette-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.palette-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.palette-item-stock {
  font-size: 11px;
  color: var(--text-muted);
}

.drag-handle {
  color: var(--text-muted);
  flex-shrink: 0;
  opacity: 0.4;
}

.palette-item:hover .drag-handle {
  opacity: 1;
}

@media (max-width: 900px) {
  .product-palette {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 90;
    box-shadow: var(--shadow-lg);
  }
}
</style>
