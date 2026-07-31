<script setup lang="ts">
import { ref } from 'vue'
import { useSalesStore } from '@/stores/sales'

const store = useSalesStore()
const quantity = ref(1)

const noShelfQty = ref(1)

function add(shelfId: number, shelfCode: string) {
  if (quantity.value < 1) return
  store.addToCart(shelfId, shelfCode, quantity.value)
  quantity.value = 1
}

function addWithoutShelf() {
  if (noShelfQty.value < 1) return
  store.addToCartWithoutShelf(noShelfQty.value)
  noShelfQty.value = 1
}
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isShelfPickerOpen" class="overlay" @click.self="store.closeShelfPicker()">
      <div
        class="modal shelf-picker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shelf-picker-title"
        @keydown.escape="store.closeShelfPicker()"
      >
        <h2 id="shelf-picker-title">{{ store.selectedProduct?.name }}</h2>
        <p class="picker-subtitle">Selecciona una ubicación</p>

        <div v-if="store.locationsLoading" class="picker-loading">
          Cargando ubicaciones...
        </div>

        <div v-else class="locations-list">
          <div class="location-item no-shelf-item">
            <div class="location-info">
              <span class="location-code no-shelf-label">Sin estantería</span>
              <span class="location-detail">Solo descuenta del stock del producto</span>
            </div>
            <div class="location-add">
              <input
                v-model.number="noShelfQty"
                type="number"
                class="qty-input"
                min="1"
                :max="store.selectedProduct?.stock ?? 0"
                aria-label="Cantidad sin estantería"
              />
              <button class="btn btn-primary btn-sm" @click="addWithoutShelf()">
                Agregar
              </button>
            </div>
          </div>

          <div v-if="store.locations.length === 0" class="empty-state picker-empty">
            <p>Este producto no tiene ubicaciones asignadas.</p>
          </div>

          <div v-for="loc in store.locations" :key="loc.shelf_id" class="location-item">
            <div class="location-info">
              <span class="location-code">{{ loc.code }}</span>
              <span class="location-detail">Pasillo {{ loc.aisle }} · Fila {{ loc.row }} · Nivel {{ loc.level }}</span>
              <span class="location-qty">Disponible: {{ loc.quantity }}</span>
            </div>
            <div class="location-add">
              <input
                v-model.number="quantity"
                type="number"
                class="qty-input"
                min="1"
                :max="loc.quantity"
                aria-label="Cantidad a agregar al carrito"
              />
              <button class="btn btn-primary btn-sm" @click="add(loc.shelf_id, loc.code)">
                Agregar
              </button>
            </div>
          </div>
        </div>

        <div class="actions picker-actions">
          <button type="button" class="btn" @click="store.closeShelfPicker()">Cancelar</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.shelf-picker-modal {
  width: 520px;
  max-height: 80vh;
  overflow-y: auto;
}

.picker-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 16px;
  margin-top: -16px;
}

.locations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.location-code {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--mono);
}

.location-detail {
  font-size: 12px;
  color: var(--text-secondary);
}

.location-qty {
  font-size: 12px;
  color: var(--success);
  font-weight: 500;
}

.location-add {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.qty-input {
  width: 60px !important;
  text-align: center;
  padding: 6px 8px !important;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.no-shelf-item {
  border-style: dashed;
  border-color: var(--accent);
  background: var(--accent-light);
  margin-bottom: 12px;
}

.no-shelf-label {
  color: var(--accent);
}

.picker-loading {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
}

.picker-empty {
  padding: 24px 0;
}

.picker-actions {
  margin-top: 16px;
}
</style>
