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
</style>
