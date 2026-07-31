<script setup lang="ts">
import { useTaxesStore } from '@/stores/taxes'

const store = useTaxesStore()

async function submitForm() {
  await store.saveTax()
}
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tax-form-title"
        @keydown.escape="store.closeForm()"
      >
        <h2 id="tax-form-title">{{ store.isEditing ? 'Editar impuesto' : 'Nuevo impuesto' }}</h2>

        <div v-if="store.error" class="error-banner">
          <span>{{ store.error }}</span>
        </div>

        <form @submit.prevent="submitForm()" class="form">
          <label class="field">
            <span>Nombre</span>
            <input v-model="store.form.name" type="text" required placeholder="Ej: IVA 19%" />
          </label>

          <label class="field">
            <span>Tasa (%)</span>
            <input v-model.number="store.form.rate" type="number" min="0" step="0.01" required placeholder="Ej: 19" />
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
