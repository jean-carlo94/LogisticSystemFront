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
</style>
