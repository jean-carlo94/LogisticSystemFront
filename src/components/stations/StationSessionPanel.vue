<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useStationsStore } from '@/stores/stations'
import { SessionItemStatus } from '@/types/station'
import { formatCurrency } from '@/composables/useFormat'
import type { Product } from '@/types/product'

const store = useStationsStore()

const productQuery = ref('')
const addQty = ref<Record<number, number>>({})
const addNotes = ref<Record<number, string>>({})
const showCustomer = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onProductInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    store.searchProducts(productQuery.value)
  }, 400)
}

function onProductEnter() {
  if (searchTimer) clearTimeout(searchTimer)
  store.searchProducts(productQuery.value)
}

function getQty(productId: number): number {
  return addQty.value[productId] ?? 1
}

function setQty(productId: number, val: number) {
  addQty.value[productId] = val
}

function getNotes(productId: number): string {
  return addNotes.value[productId] ?? ''
}

function onAddItem(product: Product) {
  const qty = getQty(product.id)
  const notes = getNotes(product.id) || undefined
  store.addItem(product.id, qty, notes)
  delete addQty.value[product.id]
  delete addNotes.value[product.id]
}

function statusLabel(status: SessionItemStatus): string {
  const map: Record<string, string> = {
    [SessionItemStatus.CREATED]: 'Creado',
    [SessionItemStatus.PREPARING]: 'Preparando',
    [SessionItemStatus.READY]: 'Listo',
    [SessionItemStatus.DELIVERED]: 'Entregado',
    [SessionItemStatus.CANCELLED]: 'Cancelado',
  }
  return map[status] ?? status
}

function statusClass(status: SessionItemStatus): string {
  const map: Record<string, string> = {
    [SessionItemStatus.CREATED]: 'item-created',
    [SessionItemStatus.PREPARING]: 'item-preparing',
    [SessionItemStatus.READY]: 'item-ready',
    [SessionItemStatus.DELIVERED]: 'item-delivered',
    [SessionItemStatus.CANCELLED]: 'item-cancelled',
  }
  return map[status] ?? ''
}

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <div class="session-panel">
    <div class="session-header">
      <h3>{{ store.selectedStation?.name || store.selectedStation?.code }}</h3>
      <span class="session-code">{{ store.selectedStation?.code }}</span>
    </div>

    <div v-if="store.error" class="error-banner session-error">
      <span>{{ store.error }}</span>
    </div>

    <!-- Session active -->
    <template v-if="store.isSessionActive">
      <div class="customer-section">
        <details class="cart-customer" :open="showCustomer">
          <summary class="cart-customer-summary" @click="showCustomer = !showCustomer">
            {{ store.sessionDetail?.customer_name || 'Cliente' }}
            <span class="summary-hint">(opcional)</span>
          </summary>
          <div class="cart-customer-fields">
            <label class="field cart-field">
              <span>Cliente</span>
              <input v-model="store.sessionCustomerName" type="text" placeholder="Nombre" aria-label="Nombre del cliente" />
            </label>
            <label class="field cart-field">
              <span>Email</span>
              <input v-model="store.sessionCustomerEmail" type="email" placeholder="Email" aria-label="Email del cliente" />
            </label>
            <label class="field cart-field">
              <span>Teléfono</span>
              <input v-model="store.sessionCustomerPhone" type="text" placeholder="Teléfono" aria-label="Teléfono" />
            </label>
            <label class="field cart-field">
              <span>Documento</span>
              <input v-model="store.sessionCustomerDocument" type="text" placeholder="RUT/DNI/CUIT" aria-label="Documento" />
            </label>
            <label class="field cart-field">
              <span>Dirección</span>
              <input v-model="store.sessionCustomerAddress" type="text" placeholder="Dirección" aria-label="Dirección" />
            </label>
          </div>
        </details>
      </div>

      <!-- Product search -->
      <div class="product-search-section">
        <div class="search-bar">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="productQuery"
            type="text"
            class="search-input"
            placeholder="Buscar producto..."
            aria-label="Buscar producto para agregar a la sesión"
            @input="onProductInput"
            @keyup.enter="onProductEnter"
          />
        </div>

        <div v-if="store.searchLoading" class="search-loading">Buscando...</div>

        <div v-else-if="store.searchedProducts.length > 0" class="search-results">
          <div v-for="product in store.searchedProducts" :key="product.id" class="search-result-item">
            <div class="result-info">
              <span class="result-name">{{ product.name }}</span>
              <span class="result-price">{{ formatCurrency(product.price) }}</span>
              <span v-if="product.stock <= 0" class="result-no-stock">Sin stock</span>
              <span v-else class="result-stock">Stock: {{ product.stock }}</span>
            </div>
            <div class="result-actions">
              <input
                :value="getQty(product.id)"
                type="number"
                min="1"
                :max="product.stock"
                class="result-qty"
                aria-label="Cantidad"
                @change="setQty(product.id, Number(($event.target as HTMLInputElement).value))"
              />
              <input
                :value="getNotes(product.id)"
                type="text"
                class="result-notes"
                placeholder="Nota"
                aria-label="Nota del item"
                @change="setQty(product.id, getQty(product.id))"
              />
              <button
                class="btn btn-sm"
                :disabled="product.stock <= 0"
                @click="onAddItem(product)"
              >
                + Agregar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Items list -->
      <div v-if="store.sessionDetail && store.sessionDetail.items.length > 0" class="items-section">
        <h4 class="items-title">Items ({{ store.activeItems.length }})</h4>
        <div class="items-list">
          <div
            v-for="item in store.sessionDetail.items"
            :key="item.id"
            :class="['item-row', statusClass(item.status)]"
          >
            <div class="item-info">
              <span class="item-name">{{ item.product_name }}</span>
              <span v-if="item.notes" class="item-notes">{{ item.notes }}</span>
              <div class="item-details">
                <span class="item-qty">x{{ item.quantity }}</span>
                <span class="item-price">{{ formatCurrency(item.unit_price) }}</span>
                <span class="item-subtotal">{{ formatCurrency(item.subtotal) }}</span>
              </div>
            </div>
            <div class="item-actions">
              <span :class="['item-status-badge', statusClass(item.status)]">{{ statusLabel(item.status) }}</span>
              <template v-if="item.status !== SessionItemStatus.CANCELLED && item.status !== SessionItemStatus.DELIVERED">
                <div class="item-qty-control">
                  <button class="qty-btn-mini" @click="store.updateItemQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">−</button>
                  <span class="qty-mini">{{ item.quantity }}</span>
                  <button class="qty-btn-mini" @click="store.updateItemQuantity(item.id, item.quantity + 1)">+</button>
                </div>
                <button v-if="store.nextAction(item)" class="btn btn-sm" @click="store.transitionItem(item.id, store.availableActions(item)[0] as 'prepare' | 'ready' | 'deliver')">
                  {{ store.nextAction(item) }}
                </button>
                <button
                  v-if="item.status === SessionItemStatus.CREATED"
                  class="btn btn-sm btn-ghost danger"
                  @click="store.cancelItem(item.id)"
                >
                  Cancelar
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="store.sessionDetail" class="empty-state session-empty">
        <p>No hay items en esta sesión. Busca productos para agregar.</p>
      </div>

      <!-- Session totals -->
      <div v-if="store.activeItems.length > 0" class="session-footer">
        <div class="session-total">
          <span>Total</span>
          <span class="session-total-amount">{{ formatCurrency(store.sessionTotal) }}</span>
        </div>
      </div>

      <!-- Session actions -->
      <div class="session-actions">
        <button class="btn btn-primary" :disabled="store.saving" @click="store.closeSession()">
          {{ store.saving ? 'Cerrando...' : 'Cobrar y Cerrar' }}
        </button>
        <button class="btn" :disabled="store.saving" @click="store.cancelSession()">
          Cancelar Sesión
        </button>
        <button class="btn btn-ghost" @click="store.openTransfer()">
          Transferir
        </button>
        <button class="btn btn-ghost" @click="store.clearSelection()">
          Volver
        </button>
      </div>
    </template>

    <!-- No active session - show open form -->
    <template v-else-if="store.selectedStation">
      <div class="no-session">
        <p class="no-session-text">Esta estación no tiene una sesión activa.</p>

        <details class="cart-customer" :open="showCustomer">
          <summary class="cart-customer-summary" @click="showCustomer = !showCustomer">
            Datos del cliente
            <span class="summary-hint">(opcional)</span>
          </summary>
          <div class="cart-customer-fields">
            <label class="field cart-field">
              <span>Cliente</span>
              <input v-model="store.sessionCustomerName" type="text" placeholder="Cliente mostrador" aria-label="Nombre del cliente" />
            </label>
            <label class="field cart-field">
              <span>Email</span>
              <input v-model="store.sessionCustomerEmail" type="email" placeholder="Email" aria-label="Email del cliente" />
            </label>
            <label class="field cart-field">
              <span>Teléfono</span>
              <input v-model="store.sessionCustomerPhone" type="text" placeholder="Teléfono" aria-label="Teléfono" />
            </label>
            <label class="field cart-field">
              <span>Documento</span>
              <input v-model="store.sessionCustomerDocument" type="text" placeholder="RUT/DNI/CUIT" aria-label="Documento" />
            </label>
            <label class="field cart-field">
              <span>Dirección</span>
              <input v-model="store.sessionCustomerAddress" type="text" placeholder="Dirección" aria-label="Dirección" />
            </label>
          </div>
        </details>

        <button
          class="btn btn-primary btn-block"
          :disabled="store.saving"
          @click="store.openSession(store.selectedStation!.id)"
        >
          {{ store.saving ? 'Abriendo...' : 'Abrir Sesión' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.session-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 32px;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.session-header h3 {
  font-size: 18px;
  margin: 0;
}

.session-code {
  font-size: 12px;
  font-family: var(--mono);
  color: var(--text-muted);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
}

.session-error {
  margin: 0;
}

/* Product search */

.product-search-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0 10px;
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
  padding: 8px 10px !important;
  font-size: 13px !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  outline: none;
}

.search-input:focus {
  box-shadow: none !important;
}

.search-loading {
  font-size: 12px;
  color: var(--text-muted);
  padding: 8px 0;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-input);
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.result-name {
  font-size: 13px;
  font-weight: 600;
}

.result-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
}

.result-no-stock {
  font-size: 11px;
  color: var(--danger);
  font-weight: 500;
}

.result-stock {
  font-size: 11px;
  color: var(--success);
  font-weight: 500;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.result-qty {
  width: 50px !important;
  padding: 4px 6px !important;
  font-size: 12px !important;
  text-align: center;
}

.result-notes {
  width: 60px !important;
  padding: 4px 6px !important;
  font-size: 12px !important;
}

/* Items */

.items-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.items-title {
  font-size: 14px;
  font-weight: 600;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--border);
}

.item-row.item-created { border-left-color: var(--info); }
.item-row.item-preparing { border-left-color: var(--warning); }
.item-row.item-ready { border-left-color: var(--success); }
.item-row.item-delivered { border-left-color: var(--accent); }
.item-row.item-cancelled { border-left-color: var(--danger); opacity: 0.6; }

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
}

.item-notes {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}

.item-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.item-qty {
  font-weight: 600;
  color: var(--text-secondary);
}

.item-price {
  color: var(--text-muted);
}

.item-subtotal {
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.item-status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.item-status-badge.item-created { background: var(--info-light); color: var(--info); }
.item-status-badge.item-preparing { background: var(--warning-light); color: var(--warning); }
.item-status-badge.item-ready { background: var(--success-light); color: var(--success); }
.item-status-badge.item-delivered { background: var(--accent-light); color: var(--accent); }
.item-status-badge.item-cancelled { background: var(--danger-light); color: var(--danger); }

.item-qty-control {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.qty-btn-mini {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-hover);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}

.qty-btn-mini:hover { background: var(--border); }
.qty-btn-mini:disabled { opacity: 0.4; cursor: not-allowed; }

.qty-mini {
  width: 24px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* No session */

.no-session {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-session-text {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  padding: 16px 0;
}

/* Footer */

.session-footer {
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.session-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-total span:first-child {
  font-size: 15px;
  font-weight: 600;
}

.session-total-amount {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.session-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.session-empty {
  padding: 24px 0;
}

/* Customer */

.cart-customer {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.cart-customer-summary {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
  background: var(--bg-hover);
}

.cart-customer-summary:hover {
  color: var(--text-primary);
}

.summary-hint {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 12px;
}

.cart-customer-fields {
  padding: 12px 12px 2px;
}

.cart-field {
  margin-bottom: 10px;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}

.btn-block {
  width: 100%;
}
</style>
