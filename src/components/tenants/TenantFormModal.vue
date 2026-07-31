<script setup lang="ts">
import { useTenantsStore } from '@/stores/tenants'

const store = useTenantsStore()
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tenant-form-title"
        @keydown.escape="store.closeForm()"
      >
        <h2 id="tenant-form-title">{{ store.isEditing ? 'Editar tenant' : 'Nuevo tenant' }}</h2>
        <form @submit.prevent="store.saveTenant()" class="form">
          <label class="field">
            <span>Nombre de la empresa</span>
            <input v-model="store.form.name" type="text" required placeholder="Acme Corp" />
          </label>
          <label class="field">
            <span>Slug (identificador URL)</span>
            <input
              v-model="store.form.slug"
              type="text"
              required
              :disabled="store.isEditing"
              placeholder="acme-corp"
              pattern="[a-z0-9\-]+"
              title="Solo minúsculas, números y guiones"
            />
          </label>
          <template v-if="!store.isEditing">
            <label class="field">
              <span>Email del admin del tenant (opcional)</span>
              <input v-model="store.form.admin_email" type="email" placeholder="admin@acme.com" />
            </label>
            <label class="field">
              <span>Contraseña del admin (opcional, requerido si hay email)</span>
              <input v-model="store.form.admin_password" type="password" minlength="6" maxlength="128" autocomplete="new-password" placeholder="Mínimo 6 caracteres" />
            </label>
          </template>

          <div v-if="store.saving && store.error" class="error-msg">{{ store.error }}</div>

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
.error-msg {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--danger-light);
  color: var(--danger);
  font-size: 13px;
  border: 1px solid var(--danger);
}
</style>
