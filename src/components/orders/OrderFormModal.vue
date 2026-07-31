<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { customersService } from '@/services/customers'
import type { Customer } from '@/types/customer'
import { formatCurrency } from '@/composables/useFormat'

const store = useOrdersStore()

const showSearchDropdown = ref(false)
const shelfQty = ref(1)
const shelfPrice = ref(0)
const selectedShelfId = ref<number | null>(null)

const customerSearch = ref('')
const customerResults = ref<Customer[]>([])
const customerLoading = ref(false)
const showCustomerDropdown = ref(false)

let customerTimer: ReturnType<typeof setTimeout> | null = null

function onCustomerInput() {
  if (customerTimer) clearTimeout(customerTimer)
  showCustomerDropdown.value = true
  const q = customerSearch.value.trim()
  if (!q) {
    customerResults.value = []
    return
  }
  customerTimer = setTimeout(async () => {
    customerLoading.value = true
    try {
      const res = await customersService.getAll(1, 8, { name: q })
      customerResults.value = res.items
    } catch {
      customerResults.value = []
    } finally {
      customerLoading.value = false
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
  showCustomerDropdown.value = false
}

function onAddItem() {
  const shelfId = selectedShelfId.value
  const shelfCode = shelfId !== null
    ? store.shelfLocations.find((l) => l.shelf_id === shelfId)?.code ?? null
    : null
  store.addItemToOrder(shelfId, shelfCode, shelfQty.value, shelfPrice.value)
  shelfQty.value = 1
  shelfPrice.value = 0
  selectedShelfId.value = null
}

function onSelectProduct() {
  if (!store.selectedProductForShelf) return
  shelfPrice.value = store.selectedProductForShelf.price
}

onUnmounted(() => {
  store.closeForm()
  if (customerTimer) clearTimeout(customerTimer)
})
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div
        class="modal order-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-form-title"
        @keydown.escape="store.closeForm()"
      >
        <h2 id="order-form-title">Nuevo pedido</h2>

        <div v-if="store.error" class="error-banner">
          <span>{{ store.error }}</span>
        </div>

        <form @submit.prevent="store.createOrder()" class="form">
          <details class="order-customer">
            <summary class="order-customer-summary">Datos del cliente <span class="summary-hint">(opcional)</span></summary>
            <div class="order-customer-fields">
              <div class="customer-search-wrap">
                <input
                  v-model="customerSearch"
                  type="text"
                  class="customer-search-input"
                  placeholder="Buscar cliente existente..."
                  aria-label="Buscar cliente"
                  @input="onCustomerInput"
                  @focus="showCustomerDropdown = customerResults.length > 0 || !!customerSearch.trim()"
                  @blur="showCustomerDropdown = false"
                />
                <div v-if="customerLoading" class="search-hint-small">Buscando...</div>
                <div v-if="showCustomerDropdown && customerResults.length > 0" class="customer-dropdown">
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

              <label class="field">
                <span>Cliente</span>
                <input v-model="store.customerName" type="text" placeholder="Opcional" aria-label="Nombre del cliente" />
              </label>

              <label class="field">
                <span>Email</span>
                <input v-model="store.customerEmail" type="email" placeholder="Opcional" aria-label="Email del cliente" />
              </label>

              <label class="field">
                <span>Teléfono</span>
                <input v-model="store.customerPhone" type="text" placeholder="Opcional" aria-label="Teléfono del cliente" />
              </label>

              <label class="field">
                <span>Documento</span>
                <input v-model="store.customerDocument" type="text" placeholder="RUT/DNI/CUIT — Opcional" aria-label="Documento del cliente" />
              </label>

              <label class="field">
                <span>Dirección</span>
                <input v-model="store.customerAddress" type="text" placeholder="Opcional" aria-label="Dirección del cliente" />
              </label>

              <label class="field">
                <span>Notas</span>
                <input v-model="store.notes" type="text" placeholder="Opcional" aria-label="Notas del pedido" />
              </label>
            </div>
          </details>

          <fieldset class="items-fieldset">
            <legend>Productos</legend>

            <div class="product-search-wrap">
              <input
                v-model="store.productSearchQuery"
                type="text"
                class="product-search-input"
                placeholder="Buscar producto por nombre o código..."
                aria-label="Buscar producto para añadir al pedido"
                @input="store.onProductSearch"
                @focus="showSearchDropdown = true"
                @blur="showSearchDropdown = false"
              />
              <div v-if="showSearchDropdown && store.productSearchResults.length > 0" class="search-dropdown">
                <button
                  v-for="product in store.productSearchResults"
                  :key="product.id"
                  type="button"
                  :class="['search-dropdown-item', { 'no-stock-item': product.stock === 0 }]"
                  :disabled="product.stock === 0"
                  @mousedown.prevent="store.selectProductForShelf(product); onSelectProduct()"
                >
                  <span class="search-item-name">{{ product.name }}</span>
                  <span class="search-item-price">{{ formatCurrency(product.price) }}</span>
                  <span class="search-item-stock" :class="{ 'stock-zero': product.stock === 0 }">Stock: {{ product.stock }}</span>
                </button>
              </div>
              <div v-if="store.productSearchLoading" class="search-loading">Buscando...</div>
            </div>

            <Transition name="fade">
              <div v-if="store.selectedProductForShelf" class="shelf-picker-inline">
                <span class="shelf-picker-label">
                  {{ store.selectedProductForShelf.name }} — {{ formatCurrency(store.selectedProductForShelf.price) }}
                  <button type="button" class="shelf-picker-cancel" @click="store.selectedProductForShelf = null; store.shelfLocations = []">✕</button>
                </span>

                <div class="shelf-picker-row">
                  <select v-model="selectedShelfId" class="shelf-select">
                    <option :value="null">Sin estantería</option>
                    <option v-for="loc in store.shelfLocations" :key="loc.shelf_id" :value="loc.shelf_id">
                      {{ loc.code }} ({{ loc.quantity }} disp.)
                    </option>
                  </select>

                  <div class="shelf-picker-add">
                    <label class="shelf-qty-label">
                      <span>Cant.</span>
                      <input v-model.number="shelfQty" type="number" min="1" class="shelf-qty-input" aria-label="Cantidad" />
                    </label>
                    <label class="shelf-qty-label">
                      <span>Precio</span>
                      <input v-model.number="shelfPrice" type="number" min="0.01" step="0.01" class="shelf-price-input" aria-label="Precio unitario" />
                    </label>
                    <button type="button" class="btn btn-primary btn-sm" @click="onAddItem()">Agregar</button>
                  </div>
                </div>
              </div>
            </Transition>

            <div v-if="store.formItems.length > 0" class="form-items-table-wrap">
              <table class="form-items-table" aria-label="Productos en el pedido">
                <thead>
                  <tr>
                    <th scope="col">Producto</th>
                    <th scope="col">Ubicación</th>
                    <th scope="col">Cant.</th>
                    <th scope="col">P. Unit.</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in store.formItems" :key="`${item.product_id}-${item.shelf_id ?? 'noshelf'}`">
                    <td>
                      <span class="form-item-name">{{ item.product_name }}</span>
                      <div v-if="item.taxes && item.taxes.length > 0" class="form-item-taxes">
                        <span v-for="tax in item.taxes" :key="tax.id" class="tax-tag">{{ tax.name }} {{ tax.rate }}%</span>
                      </div>
                    </td>
                    <td class="muted">{{ item.shelf_code ?? 'Sin estantería' }}</td>
                    <td>
                      <input
                        :value="item.quantity"
                        type="number"
                        min="1"
                        class="item-qty-input"
                        aria-label="Cantidad del producto"
                        @change="store.updateFormItemQuantity(index, Number(($event.target as HTMLInputElement).value))"
                      />
                    </td>
                    <td>{{ formatCurrency(item.unit_price) }}</td>
                    <td>
                      <button type="button" class="btn btn-ghost danger" @click="store.removeFormItem(index)">Quitar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="store.formItems.length > 0" class="form-totals">
              <div class="form-total-row">
                <span>Subtotal</span>
                <span>{{ formatCurrency(store.orderTotal) }}</span>
              </div>
              <div v-if="store.orderTaxTotal > 0" class="form-total-row">
                <span>Impuesto</span>
                <span>{{ formatCurrency(store.orderTaxTotal) }}</span>
              </div>
              <div class="form-total-row form-total-final">
                <span>Total</span>
                <span class="form-total-amount">{{ formatCurrency(store.orderTotal + store.orderTaxTotal) }}</span>
              </div>
            </div>
          </fieldset>

          <div class="actions">
            <button type="button" class="btn" @click="store.closeForm()">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="store.saving || store.formItems.length === 0">
              {{ store.saving ? 'Creando...' : 'Crear Pedido' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.order-form-modal {
  width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.order-customer {
  margin-bottom: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.order-customer-summary {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
  background: var(--bg-hover);
}

.order-customer-summary:hover {
  color: var(--text-primary);
}

.summary-hint {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 12px;
}

.order-customer-fields {
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

.items-fieldset {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 16px 10px;
}

.items-fieldset legend {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0 6px;
}

.product-search-wrap {
  position: relative;
  margin-bottom: 10px;
}

.product-search-input {
  width: 100% !important;
  font-size: 13px !important;
  padding: 7px 10px !important;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  margin-top: 2px;
}

.search-dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-size: 13px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
}

.search-dropdown-item:hover {
  background: var(--bg-hover);
}

.search-item-name { flex: 1; font-weight: 500; }
.search-item-price { color: var(--accent); font-weight: 600; font-variant-numeric: tabular-nums; }
.search-item-stock { font-size: 12px; color: var(--text-muted); }
.search-item-stock.stock-zero { color: var(--danger); font-weight: 600; }

.no-stock-item {
  opacity: 0.45;
  cursor: not-allowed;
}

.search-loading {
  text-align: center;
  padding: 8px;
  font-size: 13px;
  color: var(--text-muted);
}

.shelf-picker-inline {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  background: var(--accent-light);
  margin-bottom: 10px;
}

.shelf-picker-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

.shelf-picker-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: 13px;
}

.shelf-picker-cancel:hover {
  background: var(--accent);
  color: #fff;
}

.shelf-picker-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.shelf-select {
  flex: 1;
  font-size: 12px !important;
  padding: 5px 6px !important;
}

.shelf-picker-add {
  display: flex;
  gap: 6px;
  align-items: flex-end;
}

.shelf-qty-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shelf-qty-label span {
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 500;
}

.shelf-qty-input {
  width: 54px !important;
  padding: 5px 6px !important;
  font-size: 12px !important;
  text-align: center;
}

.shelf-price-input {
  width: 80px !important;
  padding: 5px 6px !important;
  font-size: 12px !important;
  text-align: right;
}

.form-items-table-wrap {
  margin-top: 6px;
}

.form-items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.form-items-table th {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.form-items-table td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
}

.form-items-table tbody tr:last-child td {
  border-bottom: none;
}

.subtotal-cell {
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.form-totals {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 10px;
  margin-top: 8px;
  border-top: 1px solid var(--border);
}

.form-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text-secondary);
}

.form-total-row span:last-child {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.form-total-final {
  border-top: 1px solid var(--border);
  padding-top: 8px;
  margin-top: 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-total-amount {
  font-size: 18px !important;
  font-weight: 700 !important;
  color: var(--accent);
}

.form-item-name {
  font-weight: 500;
}

.form-item-taxes {
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

.item-qty-input {
  width: 54px !important;
  padding: 4px 4px !important;
  font-size: 12px !important;
  text-align: center;
}
</style>
