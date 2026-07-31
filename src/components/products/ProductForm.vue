<script setup lang="ts">
import { ref, computed, watch, onUnmounted, useTemplateRef } from 'vue'
import { useProductsStore } from '@/stores/products'
import { ProductState } from '@/types/product'
import type { Category } from '@/types/category'
import { categoriesService } from '@/services/categories'
import { taxesService } from '@/services/taxes'
import type { Tax } from '@/types/tax'
import { getMediaUrl, formatCurrency } from '@/composables/useFormat'

const store = useProductsStore()

const stateOptions = [
  { value: ProductState.ACTIVE, label: 'Activo' },
  { value: ProductState.INACTIVE, label: 'Inactivo' },
  { value: ProductState.NO_STOCK, label: 'Sin stock' },
  { value: ProductState.DISCONTINUED, label: 'Descontinuado' },
]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const dropActive = ref(false)
const imageError = ref<string | null>(null)

const currentImageUrl = computed(() => {
  if (!store.editingId) return null
  const product = store.products.find((p) => p.id === store.editingId)
  return product?.image_url ?? null
})

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

const categorySearch = ref('')
const searchResults = ref<Category[]>([])
const searchLoading = ref(false)
const showCategoryDropdown = ref(false)
const selectedCategories = ref<{ id: number; name: string }[]>([])

const taxSearch = ref('')
const taxResults = ref<Tax[]>([])
const taxLoading = ref(false)
const showTaxDropdown = ref(false)
const selectedTaxes = ref<{ id: number; name: string; rate: number }[]>([])

let searchTimer: ReturnType<typeof setTimeout> | null = null
let taxTimer: ReturnType<typeof setTimeout> | null = null

const priceWithTax = computed(() => {
  const rate = selectedTaxes.value.reduce((sum, t) => sum + t.rate, 0)
  return store.form.price * (1 + rate / 100)
})

const unwatch = watch(() => store.isFormOpen, (open) => {
  if (open) {
    categorySearch.value = ''
    searchResults.value = []
    taxSearch.value = ''
    taxResults.value = []
    imageError.value = null
    if (store.isEditing) {
      const product = store.products.find((p) => p.id === store.editingId)
      selectedCategories.value = product?.categories ?? []
      selectedTaxes.value = product?.taxes ?? []
    } else {
      selectedCategories.value = []
      selectedTaxes.value = []
    }
  }
})

function onCategorySearch() {
  if (searchTimer) clearTimeout(searchTimer)
  const q = categorySearch.value.trim()
  if (!q) {
    searchResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      const res = await categoriesService.getAll(1, 10, { name: q })
      searchResults.value = res.items.filter(
        (c) => !store.form.category_ids.includes(c.id)
      )
    } catch {
      searchResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

function addCategory(cat: Category) {
  store.form.category_ids.push(cat.id)
  selectedCategories.value.push({ id: cat.id, name: cat.name })
  categorySearch.value = ''
  searchResults.value = []
}

function removeCategory(id: number) {
  const idx = store.form.category_ids.indexOf(id)
  if (idx !== -1) store.form.category_ids.splice(idx, 1)
  const selIdx = selectedCategories.value.findIndex((c) => c.id === id)
  if (selIdx !== -1) selectedCategories.value.splice(selIdx, 1)
}

function onTaxSearch() {
  if (taxTimer) clearTimeout(taxTimer)
  const q = taxSearch.value.trim()
  if (!q) {
    taxResults.value = []
    return
  }
  taxTimer = setTimeout(async () => {
    taxLoading.value = true
    try {
      const res = await taxesService.getAll(1, 10, { name: q })
      taxResults.value = res.items.filter(
        (t) => !store.form.tax_ids.includes(t.id)
      )
    } catch {
      taxResults.value = []
    } finally {
      taxLoading.value = false
    }
  }, 300)
}

function addTax(tax: Tax) {
  store.form.tax_ids.push(tax.id)
  selectedTaxes.value.push({ id: tax.id, name: tax.name, rate: tax.rate })
  taxSearch.value = ''
  taxResults.value = []
}

function removeTax(id: number) {
  const idx = store.form.tax_ids.indexOf(id)
  if (idx !== -1) store.form.tax_ids.splice(idx, 1)
  const selIdx = selectedTaxes.value.findIndex((t) => t.id === id)
  if (selIdx !== -1) selectedTaxes.value.splice(selIdx, 1)
}

function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    imageError.value = 'Solo se permiten imágenes'
    return
  }
  if (file.size > MAX_IMAGE_SIZE) {
    imageError.value = 'La imagen no debe superar 5 MB'
    return
  }
  imageError.value = null
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
  await store.deleteProductImage(store.editingId)
  imagePreview.value = null
  imageFile.value = null
}

async function submitForm() {
  await store.saveProduct(imageFile.value)
  imageFile.value = null
  imagePreview.value = null
}

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
  if (taxTimer) clearTimeout(taxTimer)
  unwatch()
})
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
      <div
        class="modal product-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        @keydown.escape="store.closeForm()"
      >
        <h2 id="product-form-title">{{ store.isEditing ? 'Editar producto' : 'Nuevo producto' }}</h2>

        <form @submit.prevent="submitForm()" class="form">
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

          <fieldset class="categories-fieldset">
            <legend>Impuestos</legend>

            <div v-if="selectedTaxes.length > 0" class="selected-categories">
              <span v-for="tax in selectedTaxes" :key="tax.id" class="category-chip">
                {{ tax.name }} ({{ tax.rate }}%)
                <button
                  type="button"
                  class="chip-remove"
                  :aria-label="'Quitar ' + tax.name"
                  @click="removeTax(tax.id)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </span>
            </div>

            <div class="category-search-wrap">
              <input
                v-model="taxSearch"
                type="text"
                class="category-search-input"
                placeholder="Buscar impuesto..."
                aria-label="Buscar impuesto para añadir"
                @input="onTaxSearch"
                @focus="showTaxDropdown = true"
                @blur="showTaxDropdown = false"
              />
              <div v-if="showTaxDropdown && taxResults.length > 0" class="category-dropdown">
                <button
                  v-for="tax in taxResults"
                  :key="tax.id"
                  type="button"
                  class="category-dropdown-item"
                  @mousedown.prevent="addTax(tax)"
                >
                  {{ tax.name }} ({{ tax.rate }}%)
                </button>
              </div>
            </div>

            <div v-if="taxLoading" class="categories-empty">Buscando...</div>
          </fieldset>

          <div v-if="selectedTaxes.length > 0" class="price-final-row">
            <span>Precio final</span>
            <span class="price-final-value">{{ formatCurrency(priceWithTax) }}</span>
          </div>

          <label class="field">
            <span>Estado</span>
            <select v-model="store.form.state">
              <option v-for="opt in stateOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </label>

          <fieldset class="categories-fieldset">
            <legend>Categorías</legend>

            <div v-if="selectedCategories.length > 0" class="selected-categories">
              <span v-for="cat in selectedCategories" :key="cat.id" class="category-chip">
                {{ cat.name }}
                <button
                  type="button"
                  class="chip-remove"
                  :aria-label="'Quitar ' + cat.name"
                  @click="removeCategory(cat.id)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </span>
            </div>

            <div class="category-search-wrap">
              <input
                v-model="categorySearch"
                type="text"
                class="category-search-input"
                placeholder="Buscar categoría..."
                aria-label="Buscar categoría para añadir"
                @input="onCategorySearch"
                @focus="showCategoryDropdown = true"
                @blur="showCategoryDropdown = false"
              />
              <div v-if="showCategoryDropdown && searchResults.length > 0" class="category-dropdown">
                <button
                  v-for="cat in searchResults"
                  :key="cat.id"
                  type="button"
                  class="category-dropdown-item"
                  @mousedown.prevent="addCategory(cat)"
                >
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <div v-if="searchLoading" class="categories-empty">Buscando...</div>
          </fieldset>

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

          <div class="image-section">
            <span class="image-section-label">Imagen del producto</span>

            <div v-if="imageError" class="error-banner image-error">
              <span>{{ imageError }}</span>
            </div>

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
              role="button"
              tabindex="0"
              @dragover.prevent="dropActive = true"
              @dragleave="dropActive = false"
              @drop.prevent="onDrop"
              @click="fileInput?.click()"
              @keydown.enter.prevent="fileInput?.click()"
              @keydown.space.prevent="fileInput?.click()"
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

.categories-fieldset {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px 16px 10px;
}

.categories-fieldset legend {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 0 6px;
}

.selected-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  padding: 3px 6px 3px 10px;
  border-radius: 99px;
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 500;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  padding: 0;
}

.chip-remove:hover {
  background: var(--accent);
  color: #fff;
}

.category-search-wrap {
  position: relative;
}

.category-search-input {
  width: 100% !important;
  font-size: 13px !important;
  padding: 7px 10px !important;
}

.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 180px;
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  margin-top: 2px;
}

.category-dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  font-size: 13px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-family: inherit;
}

.category-dropdown-item:hover {
  background: var(--bg-hover);
}

.categories-empty {
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
}

.image-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.image-error {
  margin: 0;
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

.product-form-modal {
  width: 560px;
  max-height: 90vh;
  overflow-y: auto;
}

.price-final-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--accent-light);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 14px;
}

.price-final-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
</style>
