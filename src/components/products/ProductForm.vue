<script setup lang="ts">
import { useProductsStore } from '@/stores/products'
import { ProductState } from '@/types/product'

const store = useProductsStore()

const stateOptions = [
  { value: ProductState.ACTIVE, label: 'Activo' },
  { value: ProductState.INACTIVE, label: 'Inactivo' },
  { value: ProductState.NO_STOCK, label: 'Sin stock' },
  { value: ProductState.DISCONTINUED, label: 'Descontinuado' },
]
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="modal-overlay" @click.self="store.closeForm()">
      <div class="modal">
        <h2>{{ store.isEditing ? 'Editar producto' : 'Nuevo producto' }}</h2>

        <form @submit.prevent="store.saveProduct()" class="product-form">
          <div class="field">
            <label for="name">Nombre</label>
            <input id="name" v-model="store.form.name" type="text" required placeholder="Nombre del producto" />
          </div>

          <div class="field">
            <label for="description">Descripci&oacute;n</label>
            <textarea id="description" v-model="store.form.description" rows="3" placeholder="Descripci&oacute;n"></textarea>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="price">Precio</label>
              <input id="price" v-model.number="store.form.price" type="number" min="0" step="0.01" />
            </div>

            <div class="field">
              <label for="stock">Stock</label>
              <input id="stock" v-model.number="store.form.stock" type="number" min="0" />
            </div>
          </div>

          <div class="field">
            <label for="state">Estado</label>
            <select id="state" v-model="store.form.state" class="select">
              <option v-for="opt in stateOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="store.closeForm()">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="store.saving">
              {{ store.saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px;
  width: 520px;
  max-width: 90vw;
  box-shadow: var(--shadow);
}

.modal h2 {
  margin: 0 0 24px;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.field label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h);
}

.field input,
.field textarea,
.field select {
  font-family: inherit;
  font-size: 15px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--code-bg);
  color: var(--text-h);
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus,
.field textarea:focus,
.field select:focus {
  border-color: var(--accent);
}

.field-row {
  display: flex;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  font-family: inherit;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  background: var(--bg);
  color: var(--text-h);
  transition: background 0.2s, border-color 0.2s;
}

.btn:hover {
  border-color: var(--accent-border);
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: var(--code-bg);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .field-row {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
