<script setup lang="ts">
import { useStationsStore } from '@/stores/stations'

const store = useStationsStore()
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="station-form-title"
        @keydown.escape="store.closeForm()"
      >
        <h2 id="station-form-title">{{ store.isEditing ? 'Editar estación' : 'Nueva estación' }}</h2>

        <div v-if="store.error" class="error-banner">
          <span>{{ store.error }}</span>
        </div>

        <form class="form" @submit.prevent="store.saveStation()">
          <label class="field">
            <span>Código</span>
            <input
              v-model="store.form.code"
              type="text"
              required
              maxlength="50"
              placeholder="Ej: MESA-01"
              aria-label="Código de estación"
              autocomplete="off"
            />
          </label>

          <label class="field">
            <span>Nombre</span>
            <input
              v-model="store.form.name"
              type="text"
              maxlength="100"
              placeholder="Ej: Mesa 1"
              aria-label="Nombre de estación"
              autocomplete="off"
            />
          </label>

          <label class="field">
            <span>Área</span>
            <input
              v-model="store.form.area"
              type="text"
              maxlength="100"
              placeholder="Ej: SALÓN, BAR, HABITACIONES"
              aria-label="Área de estación"
              autocomplete="off"
            />
          </label>

          <label class="field">
            <span>Capacidad</span>
            <input
              v-model.number="store.form.capacity"
              type="number"
              min="1"
              required
              aria-label="Capacidad de estación"
            />
          </label>

          <div class="actions">
            <button type="button" class="btn" @click="store.closeForm()">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="store.saving">
              {{ store.saving ? 'Guardando...' : store.isEditing ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
