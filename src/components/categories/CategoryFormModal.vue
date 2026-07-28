<script setup lang="ts">
import { useCategoriesStore } from '@/stores/categories'

const store = useCategoriesStore()

async function submitForm() {
  await store.saveCategory()
}
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        @keydown.escape="store.closeForm()"
      >
        <h2 id="category-form-title">{{ store.isEditing ? 'Editar categoría' : 'Nueva categoría' }}</h2>

        <div v-if="store.error" class="error-banner">
          <span>{{ store.error }}</span>
        </div>

        <form @submit.prevent="submitForm()" class="form">
          <label class="field">
            <span>Nombre</span>
            <input v-model="store.form.name" type="text" required placeholder="Nombre de la categoría" />
          </label>

          <label class="field">
            <span>Descripción</span>
            <textarea v-model="store.form.description" rows="3" placeholder="Opcional"></textarea>
          </label>

          <div class="actions">
            <button type="button" class="btn" @click="store.closeForm()">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="store.saving">
              {{ store.saving ? 'Guardando...' : (store.isEditing ? 'Guardar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
