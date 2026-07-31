<script setup lang="ts">
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDate } from '@/composables/useFormat'

const store = useOrdersStore()
const auth = useAuthStore()

const statusLabels: Record<string, string> = {
  CREATED: 'Creado',
  PREPARING: 'Preparando',
  READY: 'Listo',
  DELIVERED: 'Entregado',
}
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isDetailOpen && store.selectedOrder" class="overlay" @click.self="store.closeDetail()">
      <div
        class="modal order-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        @keydown.escape="store.closeDetail()"
      >
        <h2 id="order-detail-title">Pedido #{{ store.selectedOrder.id }}</h2>

        <div v-if="store.error" class="error-banner">
          <span>{{ store.error }}</span>
        </div>

        <div class="detail-info">
          <div class="detail-row">
            <span class="detail-label">Cliente</span>
            <span class="detail-value">{{ store.selectedOrder.customer_name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado</span>
            <span class="detail-value">{{ statusLabels[store.selectedOrder.status] || store.selectedOrder.status }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fecha</span>
            <span class="detail-value">{{ formatDate(store.selectedOrder.created_at, 'full') }}</span>
          </div>
          <div v-if="store.selectedOrder.notes" class="detail-row">
            <span class="detail-label">Notas</span>
            <span class="detail-value">{{ store.selectedOrder.notes }}</span>
          </div>
          <div class="detail-row total-row">
            <span class="detail-label">Total</span>
            <span class="detail-total">{{ formatCurrency(store.selectedOrder.total) }}</span>
          </div>
        </div>

        <div v-if="store.selectedOrder.items && store.selectedOrder.items.length > 0" class="detail-items">
          <h4>Productos</h4>
          <div class="table-wrap detail-table">
            <table aria-label="Productos del pedido">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Ubicación</th>
                  <th scope="col">Cant.</th>
                  <th scope="col">P. Unit.</th>
                  <th scope="col">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in store.selectedOrder.items" :key="item.id">
                  <td class="name-cell">{{ item.product_name }}</td>
                  <td class="muted">{{ item.shelf_code ?? 'Sin estantería' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.unit_price) }}</td>
                  <td class="price-cell">{{ formatCurrency(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="auth.hasPermission('orders_manage') && store.selectedOrder.status !== 'DELIVERED'" class="detail-actions">
          <button
            v-if="store.selectedOrder.status === 'CREATED'"
            class="btn btn-primary"
            :disabled="store.saving"
            @click="store.prepareOrder(store.selectedOrder.id)"
          >{{ store.saving ? 'Preparando...' : 'Preparar' }}</button>
          <button
            v-if="store.selectedOrder.status === 'PREPARING'"
            class="btn btn-primary"
            :disabled="store.saving"
            @click="store.readyOrder(store.selectedOrder.id)"
          >{{ store.saving ? 'Marcando...' : 'Marcar como Listo' }}</button>
          <button
            v-if="store.selectedOrder.status === 'READY'"
            class="btn btn-primary"
            :disabled="store.saving"
            @click="store.deliverOrder(store.selectedOrder.id)"
          >{{ store.saving ? 'Entregando...' : 'Entregar' }}</button>
          <button type="button" class="btn" @click="store.closeDetail()">Cerrar</button>
        </div>

        <div v-else class="detail-actions">
          <button type="button" class="btn" @click="store.closeDetail()">Cerrar</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.order-detail-modal {
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
}

.total-row {
  border-top: 1px solid var(--border);
  padding-top: 10px;
  margin-top: 4px;
}

.detail-total {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.detail-items h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.detail-table {
  margin-top: 0;
}

.detail-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.price-cell {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
}
</style>
