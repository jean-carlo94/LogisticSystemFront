<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Shelf, ShelfDetail } from '@/types/shelf'
import { useShelvesStore } from '@/stores/shelves'

const props = defineProps<{
  shelf: Shelf
  detail?: ShelfDetail
}>()

const store = useShelvesStore()
const dragover = ref(false)

const capacityPct = computed(() => {
  if (!props.detail || props.shelf.max_weight_kg <= 0) return null
  return Math.min(100, Math.round((props.detail.current_weight_kg / props.shelf.max_weight_kg) * 100))
})

function locationLabel() {
  const parts: string[] = []
  if (props.shelf.aisle) parts.push(`Pasillo ${props.shelf.aisle}`)
  if (props.shelf.row > 0) parts.push(`Fila ${props.shelf.row}`)
  if (props.shelf.level > 0) parts.push(`Nivel ${props.shelf.level}`)
  return parts.join(' · ') || 'Sin ubicación'
}

function capacityClass(pct: number) {
  if (pct >= 90) return 'full'
  if (pct >= 70) return 'warn'
  return 'ok'
}

function onDrop(event: DragEvent) {
  dragover.value = false
  const productId = event.dataTransfer?.getData('productId')
  const productName = event.dataTransfer?.getData('productName') || 'Producto'
  if (productId) {
    store.addItemToShelf(props.shelf.id, Number(productId), productName)
  }
}
</script>

<template>
  <div
    :class="['shelf-card', { 'drop-target': dragover }]"
    @click="store.openDetail(shelf.id)"
    @dragover.prevent="dragover = true"
    @dragleave="dragover = false"
    @drop.prevent="onDrop"
  >
    <div class="shelf-card-header">
      <h3>{{ shelf.name }}</h3>
      <span class="shelf-code">{{ shelf.code }}</span>
    </div>

    <p class="shelf-location">{{ locationLabel() }}</p>

    <div v-if="capacityPct !== null && detail" class="shelf-capacity">
      <div class="capacity-bar">
        <div class="capacity-track">
          <div
            class="capacity-fill"
            :class="capacityClass(capacityPct)"
            :style="{ width: capacityPct + '%' }"
          ></div>
        </div>
        <span class="capacity-label">{{ detail.current_weight_kg }} / {{ shelf.max_weight_kg }} kg</span>
      </div>
    </div>
    <div v-else-if="capacityPct === null && detail" class="shelf-capacity">
      <span class="capacity-label no-limit">Peso: {{ detail.current_weight_kg }} kg — sin límite</span>
    </div>

    <div class="shelf-card-footer">
      <span class="shelf-items">{{ detail ? detail.items.length : 0 }} producto(s)</span>
      <span class="shelf-drop-hint"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg></span>
    </div>

    <div v-if="shelf.max_weight_kg > 0" class="shelf-dims">
      {{ shelf.width_cm > 0 ? shelf.width_cm + '×' : '' }}{{ shelf.height_cm > 0 ? shelf.height_cm + '×' : '' }}{{ shelf.depth_cm || '' }} cm
    </div>
  </div>
</template>

<style scoped>
.shelf-card {
  background: var(--bg-surface);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 180px;
  position: relative;
}

.shelf-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow);
}

.shelf-card.drop-target {
  border-color: var(--accent);
  background: var(--accent-light);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.shelf-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.shelf-card-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.shelf-code {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-light);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  font-family: var(--mono);
}

.shelf-location {
  font-size: 13px;
  color: var(--text-secondary);
}

.shelf-capacity {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

.capacity-bar {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.capacity-track {
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.capacity-fill.ok { background: var(--success); }
.capacity-fill.warn { background: var(--warning); }
.capacity-fill.full { background: var(--danger); }

.capacity-label {
  font-size: 12px;
  color: var(--text-muted);
}

.capacity-label.no-limit {
  color: var(--text-muted);
  font-style: italic;
}

.shelf-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shelf-items {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.shelf-drop-hint {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  opacity: 0.5;
}

.shelf-dims {
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
}
</style>
