<script setup lang="ts">
import { useShelvesStore } from '@/stores/shelves'

const store = useShelvesStore()
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shelf-form-title"
        @keydown.escape="store.closeForm()"
      >
        <h2 id="shelf-form-title">{{ store.isEditing ? 'Editar estantería' : 'Nueva estantería' }}</h2>

        <form @submit.prevent="store.saveShelf()" class="form">
          <div class="row">
            <label class="field">
              <span>Nombre</span>
              <input v-model="store.form.name" type="text" required placeholder="Ej: Estante A-1" />
            </label>
            <label class="field">
              <span>Código</span>
              <input v-model="store.form.code" type="text" required placeholder="Ej: A-01-03" />
            </label>
          </div>

          <div class="row">
            <label class="field">
              <span>Pasillo</span>
              <input v-model="store.form.aisle" type="text" placeholder="Ej: A" />
            </label>
            <label class="field">
              <span>Fila</span>
              <input v-model.number="store.form.row" type="number" min="0" placeholder="0" />
            </label>
            <label class="field">
              <span>Nivel</span>
              <input v-model.number="store.form.level" type="number" min="0" placeholder="0" />
            </label>
          </div>

          <label class="field">
            <span>Peso máximo (kg)</span>
            <input v-model.number="store.form.max_weight_kg" type="number" min="0" step="0.1" placeholder="0 = sin límite" />
          </label>

          <div class="row">
            <label class="field">
              <span>Ancho (cm)</span>
              <input v-model.number="store.form.width_cm" type="number" min="0" step="0.1" placeholder="0" />
            </label>
            <label class="field">
              <span>Alto (cm)</span>
              <input v-model.number="store.form.height_cm" type="number" min="0" step="0.1" placeholder="0" />
            </label>
            <label class="field">
              <span>Fondo (cm)</span>
              <input v-model.number="store.form.depth_cm" type="number" min="0" step="0.1" placeholder="0" />
            </label>
          </div>

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

