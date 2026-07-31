<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { formatCurrency } from '@/composables/useFormat'

const store = useOrdersStore()

const showSearchDropdown = ref(false)
const shelfQty = ref(1)
const shelfPrice = ref(0)
const selectedShelfId = ref<number | null>(null)

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
          <label class="field">
            <span>Cliente</span>
            <input v-model="store.customerName" type="text" required placeholder="Nombre del cliente" aria-label="Nombre del cliente" />
          </label>

          <label class="field">
            <span>Notas</span>
            <input v-model="store.notes" type="text" placeholder="Opcional" aria-label="Notas del pedido" />
          </label>

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
                  class="search-dropdown-item"
                  @mousedown.prevent="store.selectProductForShelf(product); onSelectProduct()"
                >
                  <span class="search-item-name">{{ product.name }}</span>
                  <span class="search-item-price">{{ formatCurrency(product.price) }}</span>
                  <span class="search-item-stock">Stock: {{ product.stock }}</span>
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
                    <th scope="col">Precio</th>
                    <th scope="col">Subtotal</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in store.formItems" :key="`${item.product_id}-${item.shelf_id ?? 'noshelf'}`">
                    <td class="name-cell">{{ item.product_name }}</td>
                    <td class="muted">{{ item.shelf_code ?? 'Sin estantería' }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatCurrency(item.unit_price) }}</td>
                    <td class="subtotal-cell">{{ formatCurrency(item.unit_price * item.quantity) }}</td>
                    <td>
                      <button type="button" class="btn btn-ghost danger" @click="store.removeFormItem(index)">Quitar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="store.formItems.length > 0" class="form-total">
              <span>Total</span>
              <span class="form-total-amount">{{ formatCurrency(store.orderTotal) }}</span>
            </div>
          </fieldset>

          <div class="actions">
            <button type="button" class="btn" @click="store.closeForm()">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="store.saving || !store.customerName.trim() || store.formItems.length === 0">
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
  width: 640px;
  max-height: 90vh;
  overflow-y: auto;
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

.form-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  margin-top: 8px;
  border-top: 1px solid var(--border);
}

.form-total span:first-child {
  font-size: 14px;
  font-weight: 600;
}

.form-total-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
</style>
