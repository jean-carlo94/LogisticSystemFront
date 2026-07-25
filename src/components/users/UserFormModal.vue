<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useUsersStore } from '@/stores/users'
import { getMediaUrl } from '@/composables/useFormat'

const store = useUsersStore()

const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const dropActive = ref(false)
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

function handleFile(file: File) {
  if (!file.type.startsWith('image/')) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
}

function onDrop(event: DragEvent) {
  dropActive.value = false
  const file = event.dataTransfer?.files[0]
  if (file) handleFile(file)
}

async function removeImage() {
  if (!store.editingId) return
  await store.deleteUserImage(store.editingId)
  imagePreview.value = null
  imageFile.value = null
}

function currentImageUrl(): string | null {
  if (!store.editingId) return null
  const user = store.users.find((u) => u.id === store.editingId)
  return user?.image_url ?? null
}

async function submitForm() {
  await store.saveUser(imageFile.value)
  imageFile.value = null
  imagePreview.value = null
}
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div class="modal user-form-modal">
        <h2>Editar usuario</h2>
        <form @submit.prevent="submitForm()" class="form">
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

          <div class="image-section">
            <span class="image-section-label">Avatar</span>

            <div v-if="currentImageUrl() || imagePreview" class="image-preview-wrap">
              <img
                :src="imagePreview || getMediaUrl(currentImageUrl()) || ''"
                alt="Avatar"
                class="image-preview"
              />
              <button type="button" class="btn btn-ghost danger" @click="removeImage()">Quitar</button>
            </div>

            <div
              :class="['drop-zone', { 'drop-active': dropActive }]"
              @dragover.prevent="dropActive = true"
              @dragleave="dropActive = false"
              @drop.prevent="onDrop"
              @click="fileInput?.click()"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>{{ imageFile ? imageFile.name : 'Arrastra una imagen o haz clic aquí' }}</span>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                hidden
                @change="onFileInput"
              />
            </div>
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

<style scoped>
.image-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.image-section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.image-preview-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.image-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 99px;
  border: 2px solid var(--border);
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-muted);
  font-size: 13px;
  min-height: 100px;
}

.drop-zone:hover {
  border-color: var(--text-muted);
  color: var(--text-secondary);
}

.drop-zone.drop-active {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
}

.user-form-modal {
  width: 540px;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
