<script setup lang="ts">
import { usePaymentsStore } from '@/stores/payments'
import { formatCurrency, formatDate } from '@/composables/useFormat'

const store = usePaymentsStore()

function paymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    WALLET: 'Billetera digital',
    OTHER: 'Otro',
  }
  return map[method] ?? method
}
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isReceiptOpen" class="overlay" @click.self="store.closeReceipt()">
      <div
        class="modal receipt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        @keydown.escape="store.closeReceipt()"
      >
        <div v-if="store.receipt" class="receipt">
          <div class="receipt-header">
            <h2 id="receipt-title">{{ store.receipt.store_name }}</h2>
            <p class="receipt-info">
              Venta #{{ store.receipt.sale_id }} · {{ formatDate(store.receipt.created_at) }}
            </p>
            <p class="receipt-customer">Cliente: {{ store.receipt.customer_name }}</p>
          </div>

          <div class="receipt-items">
            <div class="receipt-table">
              <div class="receipt-row receipt-row-header">
                <span>Producto</span>
                <span>Cant</span>
                <span>P.Unit</span>
                <span>Subtotal</span>
              </div>
              <div v-for="item in store.receipt.items" :key="item.product_name" class="receipt-row">
                <span class="receipt-product-name">{{ item.product_name }}</span>
                <span>{{ item.quantity }}</span>
                <span>{{ formatCurrency(item.unit_price) }}</span>
                <span>{{ formatCurrency(item.subtotal) }}</span>
              </div>
            </div>
          </div>

          <div v-if="store.receipt.items.some(i => i.tax_amount > 0)" class="receipt-taxes">
            <div v-for="item in store.receipt.items" :key="'tax-' + item.product_name">
              <div v-for="tax in item.taxes" :key="tax.name" class="receipt-tax-row">
                <span>{{ item.product_name }} — {{ tax.name }} ({{ tax.rate }}%)</span>
                <span>{{ formatCurrency(tax.amount) }}</span>
              </div>
            </div>
          </div>

          <div class="receipt-totals">
            <div class="receipt-total-row">
              <span>Subtotal</span>
              <span>{{ formatCurrency(store.receipt.subtotal) }}</span>
            </div>
            <div v-if="store.receipt.tax_total > 0" class="receipt-total-row">
              <span>Impuesto</span>
              <span>{{ formatCurrency(store.receipt.tax_total) }}</span>
            </div>
            <div class="receipt-total-row receipt-grand-total">
              <span>Total</span>
              <span>{{ formatCurrency(store.receipt.total) }}</span>
            </div>
          </div>

          <div v-if="store.receipt.payments.length > 0" class="receipt-payments">
            <h4>Pagos</h4>
            <div v-for="p in store.receipt.payments" :key="p.id" class="receipt-payment-row">
              <span>{{ paymentMethodLabel(p.method) }}</span>
              <span>{{ formatCurrency(p.amount) }}</span>
            </div>
          </div>

          <div class="receipt-footer">
            <span class="receipt-status">{{ store.receipt.status === 'COMPLETED' ? 'Completado' : store.receipt.status }}</span>
            <span class="receipt-payment-status">{{ store.receipt.payment_status }}</span>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn" @click="store.closeReceipt()">Cerrar</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.receipt-modal {
  width: 560px;
  max-height: 85vh;
  overflow-y: auto;
}

.receipt {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.receipt-header {
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px dashed var(--border);
}

.receipt-header h2 {
  font-size: 20px;
  margin-bottom: 4px;
}

.receipt-info {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--mono);
}

.receipt-customer {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.receipt-items {
  display: flex;
  flex-direction: column;
}

.receipt-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.receipt-row {
  display: grid;
  grid-template-columns: 2fr 0.5fr 1fr 1fr;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--border);
}

.receipt-row-header {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 2px solid var(--border);
}

.receipt-product-name {
  font-weight: 500;
}

.receipt-taxes {
  font-size: 12px;
  color: var(--text-secondary);
}

.receipt-tax-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

.receipt-totals {
  border-top: 2px solid var(--border);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.receipt-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.receipt-grand-total {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
  border-top: 1px solid var(--border);
  padding-top: 8px;
  margin-top: 4px;
}

.receipt-payments {
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.receipt-payments h4 {
  font-size: 14px;
  margin-bottom: 8px;
}

.receipt-payment-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 3px 0;
}

.receipt-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 500;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.receipt-status {
  color: var(--success);
}

.receipt-payment-status {
  color: var(--text-muted);
}
</style>
