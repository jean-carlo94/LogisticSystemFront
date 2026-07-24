<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProductsStore } from '@/stores/products'
import { ProductState } from '@/types/product'
import { getMediaUrl } from '@/composables/useFormat'

const store = useProductsStore()

const stateOptions = [
  { value: ProductState.ACTIVE, label: 'Activo' },
  { value: ProductState.INACTIVE, label: 'Inactivo' },
  { value: ProductState.NO_STOCK, label: 'Sin stock' },
  { value: ProductState.DISCONTINUED, label: 'Descontinuado' },
]

const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const imageUploading = ref(false)
const dropActive = ref(false)

const currentImageUrl = computed(() => {
  if (!store.editingId) return null
  const product = store.products.find((p) => p.id === store.editingId)
  return product?.image_url ?? null
})

const fileInput = ref<HTMLInputElement | null>(null)

function handleFile(file: File) {
  if (!store.editingId || !file.type.startsWith('image/')) return
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

async function uploadImage() {
  if (!imageFile.value || !store.editingId) return
  imageUploading.value = true
  try {
    await store.uploadProductImage(store.editingId, imageFile.value)
    imageFile.value = null
    imagePreview.value = null
  } finally {
    imageUploading.value = false
  }
}

async function removeImage() {
  if (!store.editingId) return
  await store.deleteProductImage(store.editingId)
  imagePreview.value = null
  imageFile.value = null
}
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div class="modal" style="width: 560px; max-height: 90vh; overflow-y: auto;">
        <h2>{{ store.isEditing ? 'Editar producto' : 'Nuevo producto' }}</h2>

        <form @submit.prevent="store.saveProduct()" class="form">
          <label class="field">
            <span>Nombre</span>
            <input v-model="store.form.name" type="text" required placeholder="Nombre del producto" />
          </label>

          <label class="field">
            <span>Descripción</span>
            <textarea v-model="store.form.description" rows="3" placeholder="Opcional"></textarea>
          </label>

          <label class="field">
            <span>Código de barras</span>
            <input v-model="store.form.barcode" type="text" placeholder="Opcional, único" />
          </label>

          <div class="row">
            <label class="field">
              <span>Precio</span>
              <input v-model.number="store.form.price" type="number" min="0.01" step="0.01" />
            </label>
            <label class="field">
              <span>Stock</span>
              <input v-model.number="store.form.stock" type="number" min="0" />
            </label>
          </div>

          <label class="field">
            <span>Estado</span>
            <select v-model="store.form.state">
              <option v-for="opt in stateOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </label>

          <fieldset class="dimensions-fieldset">
            <legend>Dimensiones y peso</legend>
            <div class="row">
              <label class="field">
                <span>Peso (kg)</span>
                <input v-model.number="store.form.weight_kg" type="number" min="0" step="0.1" placeholder="0" />
              </label>
            </div>
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
          </fieldset>

          <div v-if="store.isEditing" class="image-section">
            <span class="image-section-label">Imagen del producto</span>

            <div v-if="currentImageUrl || imagePreview" class="image-preview-wrap">
              <img
                :src="imagePreview || getMediaUrl(currentImageUrl) || ''"
                alt="Vista previa"
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

            <button
              v-if="imageFile"
              type="button"
              class="btn btn-primary"
              :disabled="imageUploading"
              @click="uploadImage()"
            >
              {{ imageUploading ? 'Subiendo...' : 'Subir imagen' }}
            </button>
          </div>

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

<style scoped>
.dimensions-fieldset {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 16px 10px;
}

.dimensions-fieldset legend {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0 6px;
}

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
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.image-upload-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.file-input {
  width: auto;
  font-size: 13px;
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
</style>
