<script setup lang="ts">
import { useUsersStore } from '@/stores/users'

const store = useUsersStore()
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div class="modal">
        <h2>Editar usuario</h2>
        <form @submit.prevent="store.saveUser()" class="form">
          <div class="row">
            <label class="field">
              <span>Nombre</span>
              <input v-model="store.form.first_name" type="text" placeholder="Nombre" />
            </label>
            <label class="field">
              <span>Apellido</span>
              <input v-model="store.form.last_name" type="text" placeholder="Apellido" />
            </label>
          </div>
          <label class="field">
            <span>Email</span>
            <input v-model="store.form.email" type="email" placeholder="usuario@email.com" />
          </label>
          <label class="field">
            <span>Teléfono</span>
            <input v-model="store.form.phone" type="text" placeholder="+569..." />
          </label>
          <div class="row">
            <label class="field">
              <span>Ciudad</span>
              <input v-model="store.form.city" type="text" placeholder="Ciudad" />
            </label>
            <label class="field">
              <span>País</span>
              <input v-model="store.form.country" type="text" placeholder="País" />
            </label>
          </div>
          <label class="field">
            <span>Nueva contraseña (dejar vacío para no cambiar)</span>
            <input v-model="store.form.password" type="password" minlength="6" maxlength="128" placeholder="Mínimo 6 caracteres" />
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
  width: 520px;
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

.row { display: flex; gap: 16px; }
.row .field { flex: 1; }

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .row { flex-direction: column; }
}
</style>
