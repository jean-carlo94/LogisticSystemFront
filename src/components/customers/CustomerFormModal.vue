<script setup lang="ts">
import { useCustomersStore } from '@/stores/customers'

const store = useCustomersStore()
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-form-title"
        @keydown.escape="store.closeForm()"
      >
        <h2 id="customer-form-title">{{ store.isEditing ? 'Editar cliente' : 'Nuevo cliente' }}</h2>

        <div v-if="store.error" class="error-banner">
          <span>{{ store.error }}</span>
        </div>

        <form class="form" @submit.prevent="store.saveCustomer()">
          <label class="field">
            <span>Nombre</span>
            <input
              v-model="store.form.name"
              type="text"
              required
              maxlength="200"
              placeholder="Nombre del cliente"
              aria-label="Nombre del cliente"
              autocomplete="off"
            />
          </label>

          <label class="field">
            <span>Email</span>
            <input
              v-model="store.form.email"
              type="email"
              placeholder="Opcional"
              aria-label="Email del cliente"
              autocomplete="off"
            />
          </label>

          <label class="field">
            <span>Teléfono</span>
            <input
              v-model="store.form.phone"
              type="text"
              maxlength="30"
              placeholder="Opcional"
              aria-label="Teléfono del cliente"
              autocomplete="off"
            />
          </label>

          <label class="field">
            <span>Documento</span>
            <input
              v-model="store.form.document"
              type="text"
              maxlength="30"
              placeholder="RUT/DNI/CUIT"
              aria-label="Documento del cliente"
              autocomplete="off"
            />
          </label>

          <label class="field">
            <span>Dirección</span>
            <input
              v-model="store.form.address"
              type="text"
              maxlength="500"
              placeholder="Opcional"
              aria-label="Dirección del cliente"
              autocomplete="off"
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
