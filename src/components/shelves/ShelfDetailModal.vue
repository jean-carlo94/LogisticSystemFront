<script setup lang="ts">
import { useShelvesStore } from '@/stores/shelves'
import { useAuthStore } from '@/stores/auth'

const store = useShelvesStore()
const auth = useAuthStore()

function shelfLocation() {
  const s = store.selectedShelf
  if (!s) return ''
  const parts: string[] = []
  if (s.aisle) parts.push(`Pasillo ${s.aisle}`)
  if (s.row > 0) parts.push(`Fila ${s.row}`)
  if (s.level > 0) parts.push(`Nivel ${s.level}`)
  return parts.join(' · ') || 'Sin ubicación'
}

function capacityPct() {
  const s = store.selectedShelf
  if (!s || s.max_weight_kg <= 0) return null
  return Math.min(100, Math.round((s.current_weight_kg / s.max_weight_kg) * 100))
}

function capacityClass(pct: number) {
  if (pct >= 90) return 'full'
  if (pct >= 70) return 'warn'
  return 'ok'
}
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isDetailOpen && store.selectedShelf" class="overlay" @click.self="store.closeDetail()">
      <div class="modal shelf-detail-modal">
        <div class="detail-header">
          <div>
            <h2>{{ store.selectedShelf.name }}</h2>
            <p class="detail-sub">{{ store.selectedShelf.code }} — {{ shelfLocation() }}</p>
          </div>
          <div class="detail-actions">
            <button
              v-if="auth.hasPermission('shelves_update')"
              class="btn btn-ghost"
              @click="store.closeDetail(); store.openEditForm(store.selectedShelf!)"
            >Editar</button>
            <button
              v-if="auth.hasPermission('shelves_delete')"
              class="btn btn-ghost danger"
              @click="store.deleteShelf(store.selectedShelf!.id)"
            >Eliminar</button>
          </div>
        </div>

        <div v-if="capacityPct() !== null" class="detail-capacity">
          <div class="capacity-bar">
            <div class="capacity-track">
              <div
                class="capacity-fill"
                :class="capacityClass(capacityPct()!)"
                :style="{ width: capacityPct() + '%' }"
              ></div>
            </div>
            <span class="capacity-label">{{ store.selectedShelf.current_weight_kg }} / {{ store.selectedShelf.max_weight_kg }} kg ({{ capacityPct() }}%)</span>
          </div>
        </div>
        <div v-else class="detail-capacity">
          <span class="capacity-label no-limit">Peso actual: {{ store.selectedShelf.current_weight_kg }} kg — sin límite de capacidad</span>
        </div>

        <div v-if="store.error" class="error-banner" style="margin-top: 16px;">
          <span>{{ store.error }}</span>
        </div>

        <div class="detail-items">
          <h3>Productos ({{ store.selectedShelf.items.length }})</h3>

          <div v-if="store.selectedShelf.items.length === 0" class="empty-state" style="padding: 24px 0;">
            <p>No hay productos en esta estantería.</p>
            <p class="muted">Arrastra productos desde el panel lateral.</p>
          </div>

          <div v-else class="items-list">
            <div v-for="item in store.selectedShelf.items" :key="item.id" class="item-row">
              <span class="item-name">{{ item.product_name }}</span>
              <div v-if="auth.hasPermission('shelves_update')" class="item-qty">
                <button class="qty-btn" @click="store.updateItemQuantity(store.selectedShelf!.id, item.id, item.quantity - 1)">−</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button class="qty-btn" @click="store.updateItemQuantity(store.selectedShelf!.id, item.id, item.quantity + 1)">+</button>
                <button class="btn btn-ghost danger qty-remove" @click="store.removeItem(store.selectedShelf!.id, item.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <span v-else class="item-qty-readonly">{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.shelf-detail-modal {
  width: 640px;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.detail-header h2 {
  margin-bottom: 4px;
}

.detail-sub {
  font-size: 13px;
  color: var(--text-secondary);
}

.detail-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.detail-capacity {
  margin-bottom: 20px;
}

.capacity-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.capacity-track {
  height: 10px;
  background: var(--bg-hover);
  border-radius: 5px;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.capacity-fill.ok { background: var(--success); }
.capacity-fill.warn { background: var(--warning); }
.capacity-fill.full { background: var(--danger); }

.capacity-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.capacity-label.no-limit {
  font-style: italic;
  color: var(--text-muted);
}

.detail-items h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.item-qty {
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-qty-readonly {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.qty-btn {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  line-height: 1;
  padding: 0;
}

.qty-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.qty-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 28px;
  text-align: center;
}

.qty-remove {
  margin-left: 8px;
  padding: 4px 6px;
}
</style>
