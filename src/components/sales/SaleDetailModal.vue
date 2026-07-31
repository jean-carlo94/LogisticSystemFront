<script setup lang="ts">
import { computed } from 'vue'
import { useSalesStore } from '@/stores/sales'
import { formatCurrency, formatDate } from '@/composables/useFormat'

const store = useSalesStore()

const totalTax = computed(() => {
  if (!store.selectedSale?.items) return 0
  return store.selectedSale.items.reduce((sum, item) => sum + (item.tax_amount ?? 0), 0)
})

const subtotal = computed(() => {
  if (!store.selectedSale?.items) return 0
  return store.selectedSale.items.reduce((sum, item) => sum + (item.subtotal ?? 0), 0)
})
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isDetailOpen && store.selectedSale" class="overlay" @click.self="store.closeDetail()">
      <div
        class="modal sale-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sale-detail-title"
        @keydown.escape="store.closeDetail()"
      >
        <h2 id="sale-detail-title">Venta #{{ store.selectedSale.id }}</h2>

        <div class="detail-info">
          <div class="detail-row">
            <span class="detail-label">Cliente</span>
            <span class="detail-value">{{ store.selectedSale.customer_name }}</span>
          </div>
          <div v-if="store.selectedSale.customer_email" class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">{{ store.selectedSale.customer_email }}</span>
          </div>
          <div v-if="store.selectedSale.customer_phone" class="detail-row">
            <span class="detail-label">Teléfono</span>
            <span class="detail-value">{{ store.selectedSale.customer_phone }}</span>
          </div>
          <div v-if="store.selectedSale.customer_document" class="detail-row">
            <span class="detail-label">Documento</span>
            <span class="detail-value">{{ store.selectedSale.customer_document }}</span>
          </div>
          <div v-if="store.selectedSale.customer_address" class="detail-row">
            <span class="detail-label">Dirección</span>
            <span class="detail-value">{{ store.selectedSale.customer_address }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado</span>
            <span class="status-badge status-completed">{{ store.selectedSale.status }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fecha</span>
            <span class="detail-value">{{ formatDate(store.selectedSale.created_at, 'full') }}</span>
          </div>
          <div v-if="store.selectedSale.notes" class="detail-row">
            <span class="detail-label">Notas</span>
            <span class="detail-value">{{ store.selectedSale.notes }}</span>
          </div>
          <div class="detail-summary">
            <div class="detail-row">
              <span class="detail-label">Subtotal</span>
              <span class="detail-value">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Impuesto</span>
              <span class="detail-value">{{ formatCurrency(totalTax) }}</span>
            </div>
            <div class="detail-row total-row">
              <span class="detail-label">Total</span>
              <span class="detail-total">{{ formatCurrency(store.selectedSale.total) }}</span>
            </div>
          </div>
        </div>

        <div v-if="store.selectedSale.items && store.selectedSale.items.length > 0" class="detail-items">
          <h4>Productos</h4>
          <div class="table-wrap detail-table">
            <table aria-label="Productos de la venta">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Ubicación</th>
                  <th scope="col">Cant.</th>
                  <th scope="col">P. Unit.</th>
                  <th scope="col">Impuesto</th>
                  <th scope="col">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in store.selectedSale.items" :key="item.id">
                  <td class="name-cell">{{ item.product_name }}</td>
                  <td class="muted">{{ item.shelf_code ?? 'Sin estantería' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.unit_price) }}</td>
                  <td class="muted">{{ formatCurrency(item.tax_amount) }}</td>
                  <td class="price-cell">{{ formatCurrency(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="actions detail-actions">
          <button type="button" class="btn" @click="store.closeDetail()">Cerrar</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sale-detail-modal {
  width: 700px;
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

.detail-summary {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-completed {
  background: var(--success-light);
  color: var(--success);
}

.price-cell {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
}

.detail-table {
  margin-top: 0;
}

.detail-actions {
  margin-top: 16px;
}
</style>
