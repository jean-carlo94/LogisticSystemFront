<script setup lang="ts">
import { useRolesStore } from '@/stores/roles'

const store = useRolesStore()
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-form-title"
        @keydown.escape="store.closeForm()"
      >
        <h2 id="role-form-title">{{ store.isEditing ? 'Editar rol' : 'Nuevo rol' }}</h2>
        <form @submit.prevent="store.saveRole()" class="form">
          <label class="field">
            <span>Nombre</span>
            <input v-model="store.form.name" type="text" required placeholder="Nombre del rol" />
          </label>
          <label class="field">
            <span>Descripción</span>
            <input v-model="store.form.description" type="text" placeholder="Opcional" />
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
