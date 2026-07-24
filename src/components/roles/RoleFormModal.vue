<script setup lang="ts">
import { useRolesStore } from '@/stores/roles'

const store = useRolesStore()
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div class="modal">
        <h2>{{ store.isEditing ? 'Editar rol' : 'Nuevo rol' }}</h2>
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

.modal h2 { margin-bottom: 24px; }

.form { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field span { font-size: 13px; font-weight: 600; color: var(--text-secondary); }

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
</style>
