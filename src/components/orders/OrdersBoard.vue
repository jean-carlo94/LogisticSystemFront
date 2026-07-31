<script setup lang="ts">
import { ref, onMounted, useTemplateRef } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDate } from '@/composables/useFormat'

const store = useOrdersStore()
const auth = useAuthStore()

const columns = [
  { status: 'CREATED' as const, label: 'Creado', key: 'created' as const },
  { status: 'PREPARING' as const, label: 'Preparando', key: 'preparing' as const },
  { status: 'READY' as const, label: 'Listo', key: 'ready' as const },
  { status: 'DELIVERED' as const, label: 'Entregado', key: 'delivered' as const },
]

const nextActions: Record<string, { label: string; fn: (id: number) => Promise<void> }> = {
  CREATED: { label: 'Preparar', fn: (id) => store.prepareOrder(id) },
  PREPARING: { label: 'Listo', fn: (id) => store.readyOrder(id) },
  READY: { label: 'Entregar', fn: (id) => store.deliverOrder(id) },
}

const validDrop: Record<string, string> = {
  CREATED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'DELIVERED',
}

const bodyRefs: Record<string, ReturnType<typeof useTemplateRef<HTMLDivElement>>> = {
  CREATED: useTemplateRef<HTMLDivElement>('bodyCreated'),
  PREPARING: useTemplateRef<HTMLDivElement>('bodyPreparing'),
  READY: useTemplateRef<HTMLDivElement>('bodyReady'),
  DELIVERED: useTemplateRef<HTMLDivElement>('bodyDelivered'),
}

const dragOverCol = ref<string | null>(null)
const dragOrderId = ref<number | null>(null)
const dragFromStatus = ref<string | null>(null)

function itemCount(order: { items?: { quantity: number }[] }): number {
  if (!order.items) return 0
  return order.items.reduce((sum, i) => sum + i.quantity, 0)
}

function onColumnScroll(status: string) {
  const el = bodyRefs[status]?.value
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  if (scrollTop + clientHeight >= scrollHeight - 60) {
    store.fetchBoardColumn(status)
  }
}

function onDragStart(event: DragEvent, orderId: number, status: string) {
  if (!auth.hasPermission('orders_manage')) return
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(orderId))
  }
  dragOrderId.value = orderId
  dragFromStatus.value = status
}

function onDragEnd() {
  dragOverCol.value = null
  dragOrderId.value = null
  dragFromStatus.value = null
}

function onDragOver(event: DragEvent, status: string) {
  if (!dragFromStatus.value) return
  if (validDrop[dragFromStatus.value] !== status) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
}

function onDragEnter(status: string) {
  if (!dragFromStatus.value) return
  if (validDrop[dragFromStatus.value] !== status) return
  dragOverCol.value = status
}

function onDragLeave(event: DragEvent, status: string) {
  const el = bodyRefs[status]?.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const { clientX, clientY } = event
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
    dragOverCol.value = null
  }
}

function onDrop(event: DragEvent, targetStatus: string) {
  event.preventDefault()
  if (!dragFromStatus.value || !dragOrderId.value) return
  const next = validDrop[dragFromStatus.value]
  if (next !== targetStatus) return

  const action = nextActions[dragFromStatus.value]
  if (action) action.fn(dragOrderId.value)

  onDragEnd()
}

onMounted(() => {
  store.resetBoardColumns()
})
</script>

<template>
  <div class="board-grid">
    <div v-for="col in columns" :key="col.key" :class="['board-column', `column-${col.key}`]">
      <div :class="['column-header', `col-h-${col.key}`]">
        <span class="col-label">{{ col.label }}</span>
        <span class="col-count">{{ store.boardColumns[col.status].items.length }}</span>
      </div>

      <div
        :ref="bodyRefs[col.status]"
        :class="['column-body', { 'drag-over': dragOverCol === col.status }]"
        @scroll="onColumnScroll(col.status)"
        @dragover="onDragOver($event, col.status)"
        @dragenter="onDragEnter(col.status)"
        @dragleave="onDragLeave($event, col.status)"
        @drop="onDrop($event, col.status)"
      >
        <div
          v-for="order in store.boardColumns[col.status].items"
          :key="order.id"
          :class="['board-card', `card-${col.key}`]"
          :draggable="col.status !== 'DELIVERED' && auth.hasPermission('orders_manage')"
          role="button"
          tabindex="0"
          @click="store.fetchOrderDetail(order.id)"
          @keydown.enter="store.fetchOrderDetail(order.id)"
          @keydown.space.prevent="store.fetchOrderDetail(order.id)"
          @dragstart="onDragStart($event, order.id, col.status)"
          @dragend="onDragEnd"
        >
          <div class="card-header">
            <span class="card-customer">{{ order.customer_name }}</span>
            <span class="card-total">{{ formatCurrency(order.total) }}</span>
          </div>
          <div class="card-meta">
            <span class="card-items">{{ itemCount(order) }} {{ itemCount(order) === 1 ? 'producto' : 'productos' }}</span>
            <span class="card-date">{{ formatDate(order.created_at, 'short') }}</span>
          </div>
          <div v-if="order.notes" class="card-notes">{{ order.notes }}</div>
          <button
            v-if="nextActions[order.status] && auth.hasPermission('orders_manage')"
            class="card-action-btn"
            @click.stop="nextActions[order.status].fn(order.id)"
            :disabled="store.saving"
          >
            {{ nextActions[order.status].label }}
          </button>
          <div v-else-if="order.status === 'DELIVERED'" class="card-done">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        <div v-if="store.boardColumns[col.status].loading" class="col-loader">
          <span class="skeleton" style="width: 100%; height: 60px; display: block"></span>
        </div>

        <div
          v-else-if="store.boardColumns[col.status].hasMore"
          class="col-load-more"
          role="button"
          tabindex="0"
          @click="store.fetchBoardColumn(col.status)"
          @keydown.enter="store.fetchBoardColumn(col.status)"
        >
          Cargar más...
        </div>

        <div v-else-if="store.boardColumns[col.status].items.length === 0" class="col-empty">
          Sin pedidos
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  height: calc(100vh - 220px);
}

.board-column {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 2px solid;
  flex-shrink: 0;
}

.col-h-created  { border-color: var(--text-muted); }
.col-h-preparing { border-color: var(--accent); }
.col-h-ready     { border-color: var(--warning); }
.col-h-delivered { border-color: var(--success); }

.col-label {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.col-count {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--bg-hover);
  color: var(--text-muted);
}

.column-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: background 0.15s;
}

.column-body.drag-over {
  background: var(--accent-light);
}

.col-empty {
  text-align: center;
  padding: 32px 0;
  color: var(--text-muted);
  font-size: 13px;
}

.col-loader {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col-load-more {
  text-align: center;
  padding: 12px;
  font-size: 13px;
  color: var(--accent);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.col-load-more:hover {
  background: var(--bg-hover);
}

.board-card {
  padding: 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.board-card:hover {
  box-shadow: var(--shadow);
}

.board-card[draggable="true"] {
  cursor: grab;
}

.board-card[draggable="true"]:active {
  cursor: grabbing;
}

.card-created  { border-left: 4px solid var(--text-muted); }
.card-preparing { border-left: 4px solid var(--accent); }
.card-ready     { border-left: 4px solid var(--warning); }
.card-delivered { border-left: 4px solid var(--success); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-customer {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-word;
}

.card-total {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card-items {
  font-size: 12px;
  color: var(--text-muted);
}

.card-date {
  font-size: 12px;
  color: var(--text-muted);
}

.card-notes {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-action-btn {
  align-self: flex-end;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.card-action-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.card-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-done {
  align-self: flex-end;
  color: var(--success);
  display: flex;
}

@media (max-width: 1200px) {
  .board-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .board-grid {
    grid-template-columns: 1fr;
    height: auto;
  }

  .board-column {
    max-height: 60vh;
  }
}
</style>
