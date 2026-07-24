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
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div class="modal">
        <h2>{{ store.isEditing ? 'Editar producto' : 'Nuevo producto' }}</h2>

        <form @submit.prevent="store.saveProduct()" class="form">
          <label class="field">
            <span>Nombre</span>
            <input v-model="store.form.name" type="text" required placeholder="Nombre del producto" />
          </label>

          <label class="field">
            <span>Descripción</span>
            <textarea v-model="store.form.description" rows="3" placeholder="Opcional"></textarea>
          </label>

          <div class="row">
            <label class="field">
              <span>Precio</span>
              <input v-model.number="store.form.price" type="number" min="0.01" step="0.01" />
            </label>
            <label class="field">
              <span>Stock</span>
              <input v-model.number="store.form.stock" type="number" min="0" />
            </label>
          </div>

          <label class="field">
            <span>Estado</span>
            <select v-model="store.form.state">
              <option v-for="opt in stateOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </label>

          <div class="actions">
            <button type="button" class="btn" @click="store.closeForm()">Cancelar</button>
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
.overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.modal {
  width: 480px;
  max-width: 100%;
  padding: 32px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
}

.modal h2 {
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field span {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.row {
  display: flex;
  gap: 16px;
}

.row .field {
  flex: 1;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
  }
}
</style>
