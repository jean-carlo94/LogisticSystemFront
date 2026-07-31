<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useSalesStore } from '@/stores/sales'
import { customersService } from '@/services/customers'
import type { Customer } from '@/types/customer'
import { formatCurrency } from '@/composables/useFormat'

const store = useSalesStore()

const customerSearch = ref('')
const customerResults = ref<Customer[]>([])
const searchLoading = ref(false)
const showDropdown = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onCustomerInput() {
  if (searchTimer) clearTimeout(searchTimer)
  showDropdown.value = true
  const q = customerSearch.value.trim()
  if (!q) {
    customerResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      const res = await customersService.getAll(1, 8, { name: q })
      customerResults.value = res.items
    } catch {
      customerResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

function selectCustomer(c: Customer) {
  store.customerName = c.name
  store.customerEmail = c.email ?? ''
  store.customerPhone = c.phone ?? ''
  store.customerDocument = c.document ?? ''
  store.customerAddress = c.address ?? ''
  customerSearch.value = ''
  customerResults.value = []
  showDropdown.value = false
}

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <div class="sales-cart">
    <h3 class="cart-title">Venta</h3>

    <div v-if="store.error" class="error-banner cart-error">
      <span>{{ store.error }}</span>
    </div>

    <details class="cart-customer">
      <summary class="cart-customer-summary">Datos del cliente <span class="summary-hint">(opcional)</span></summary>
      <div class="cart-customer-fields">
        <div class="customer-search-wrap">
          <input
            v-model="customerSearch"
            type="text"
            class="customer-search-input"
            placeholder="Buscar cliente existente..."
            aria-label="Buscar cliente"
            @input="onCustomerInput"
            @focus="showDropdown = customerResults.length > 0 || !!customerSearch.trim()"
            @blur="showDropdown = false"
          />
          <div v-if="searchLoading" class="search-hint-small">Buscando...</div>
          <div v-if="showDropdown && customerResults.length > 0" class="customer-dropdown">
            <button
              v-for="c in customerResults"
              :key="c.id"
              type="button"
              class="customer-dropdown-item"
              @mousedown.prevent="selectCustomer(c)"
            >
              <span class="customer-dd-name">{{ c.name }}</span>
              <span v-if="c.document" class="customer-dd-doc">{{ c.document }}</span>
              <span v-if="c.email" class="customer-dd-email">{{ c.email }}</span>
            </button>
          </div>
        </div>

        <label class="field cart-field">
          <span>Cliente</span>
          <input v-model="store.customerName" type="text" placeholder="Opcional" aria-label="Nombre del cliente" />
        </label>

        <label class="field cart-field">
          <span>Email</span>
          <input v-model="store.customerEmail" type="email" placeholder="Opcional" aria-label="Email del cliente" />
        </label>

        <label class="field cart-field">
          <span>Teléfono</span>
          <input v-model="store.customerPhone" type="text" placeholder="Opcional" aria-label="Teléfono del cliente" />
        </label>

        <label class="field cart-field">
          <span>Documento</span>
          <input v-model="store.customerDocument" type="text" placeholder="RUT/DNI/CUIT — Opcional" aria-label="Documento del cliente" />
        </label>

        <label class="field cart-field">
          <span>Dirección</span>
          <input v-model="store.customerAddress" type="text" placeholder="Opcional" aria-label="Dirección del cliente" />
        </label>

        <label class="field cart-field">
          <span>Notas</span>
          <input v-model="store.notes" type="text" placeholder="Opcional" aria-label="Notas de la venta" />
        </label>
      </div>
    </details>

    <div v-if="store.cart.length === 0" class="cart-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.2">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <p>Agrega productos al carrito</p>
    </div>

    <div v-else class="cart-items">
      <div v-for="(item, index) in store.cart" :key="`${item.product_id}-${item.shelf_id ?? 'noshelf'}`" class="cart-item">
        <div class="cart-item-header">
          <span class="cart-item-name">{{ item.product_name }}</span>
          <button class="cart-item-remove" @click="store.removeFromCart(index)" title="Quitar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <span class="cart-item-shelf" :class="{ 'no-shelf': item.shelf_id === null }">{{ item.shelf_code ?? 'Sin estantería' }}</span>
        <div v-if="item.taxes && item.taxes.length > 0" class="cart-item-taxes">
          <span v-for="tax in item.taxes" :key="tax.id" class="tax-tag">{{ tax.name }} {{ tax.rate }}%</span>
        </div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button class="qty-btn" @click="store.updateCartQuantity(index, item.quantity - 1)">−</button>
            <span class="qty-val">{{ item.quantity }}</span>
            <button class="qty-btn" @click="store.updateCartQuantity(index, item.quantity + 1)">+</button>
          </div>
          <input
            :value="item.unit_price"
            type="number"
            min="0.01"
            step="0.01"
            class="price-input"
            aria-label="Precio unitario del producto"
            @change="store.updateCartPrice(index, Number(($event.target as HTMLInputElement).value))"
          />
          <span class="cart-item-subtotal">{{ formatCurrency(item.unit_price * item.quantity) }}</span>
        </div>
      </div>
    </div>

    <div v-if="store.cart.length > 0" class="cart-footer">
      <div class="cart-totals">
        <div class="cart-subtotal">
          <span>Subtotal</span>
          <span>{{ formatCurrency(store.cartTotal) }}</span>
        </div>
        <div v-if="store.cartTaxTotal > 0" class="cart-tax">
          <span>Impuesto</span>
          <span>{{ formatCurrency(store.cartTaxTotal) }}</span>
        </div>
        <div class="cart-total">
          <span>Total</span>
          <span class="cart-total-amount">{{ formatCurrency(store.cartTotal + store.cartTaxTotal) }}</span>
        </div>
      </div>
      <div class="cart-actions">



        <button class="btn btn-primary cart-submit" :disabled="store.saving" @click="store.submitSale()">
          {{ store.saving ? 'Registrando...' : 'Registrar Venta' }}
        </button>
        <button class="btn btn-ghost" @click="store.clearCart()">Limpiar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sales-cart {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 32px;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
}

.cart-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.cart-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted);
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
}

.cart-item {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cart-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.cart-item-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.cart-item-remove {
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
  flex-shrink: 0;
}

.cart-item-remove:hover {
  background: var(--danger-light);
  color: var(--danger);
}

.cart-item-shelf {
  font-size: 11px;
  color: var(--accent);
  font-family: var(--mono);
  font-weight: 500;
}

.cart-item-shelf.no-shelf {
  color: var(--text-muted);
  font-family: inherit;
  font-style: italic;
}

.cart-item-taxes {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  margin-top: 2px;
}

.tax-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 99px;
  background: var(--success-light);
  color: var(--success);
  font-weight: 500;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.qty-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-hover);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}

.qty-btn:hover {
  background: var(--border);
}

.qty-val {
  width: 32px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.price-input {
  width: 80px !important;
  padding: 5px 6px !important;
  font-size: 12px !important;
  text-align: right;
}

.cart-item-subtotal {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  margin-left: auto;
}

.cart-footer {
  border-top: 1px solid var(--border);
  padding-top: 16px;
  margin-top: 12px;
}

.cart-totals {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.cart-subtotal,
.cart-tax {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-secondary);
}

.cart-subtotal span:last-child,
.cart-tax span:last-child {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 8px;
  margin-top: 4px;
}

.cart-total span:first-child {
  font-size: 15px;
  font-weight: 600;
}

.cart-total-amount {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.cart-actions {
  display: flex;
  gap: 8px;
}

.cart-submit {
  flex: 1;
  padding: 12px 20px;
  font-size: 15px;
}

.cart-error {
  margin-bottom: 12px;
}

.cart-field {
  margin-bottom: 10px;
}

.cart-customer {
  margin-bottom: 12px;
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

.customer-search-wrap {
  position: relative;
  margin-bottom: 10px;
}

.customer-search-input {
  font-size: 13px !important;
  padding: 7px 10px !important;
}

.search-hint-small {
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 0;
}

.customer-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 180px;
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  margin-top: 2px;
}

.customer-dropdown-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
}

.customer-dropdown-item:hover {
  background: var(--bg-hover);
}

.customer-dd-name {
  font-size: 13px;
  font-weight: 500;
}

.customer-dd-doc {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--mono);
}

.customer-dd-email {
  font-size: 11px;
  color: var(--text-secondary);
}
</style>
