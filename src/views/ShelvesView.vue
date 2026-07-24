<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useShelvesStore } from '@/stores/shelves'
import { useAuthStore } from '@/stores/auth'
import ShelvesGrid from '@/components/shelves/ShelvesGrid.vue'
import ShelfFormModal from '@/components/shelves/ShelfFormModal.vue'
import ShelfDetailModal from '@/components/shelves/ShelfDetailModal.vue'
import ProductPalette from '@/components/shelves/ProductPalette.vue'

const store = useShelvesStore()
const auth = useAuthStore()

const fCode = ref('')
const fName = ref('')
const fAisle = ref('')
const fRow = ref('')
const fLevel = ref('')


watch([fCode, fName, fAisle, fRow, fLevel], () => {
  if (hasFilters()) {
    doFilter()
  } else if (Object.keys(store.filterParams).length > 0) {
    store.setFilter({})
  }
})

function doFilter() {
  const p: Record<string, string> = {}
  if (fCode.value) p.code = fCode.value
  if (fName.value) p.name = fName.value
  if (fAisle.value) p.aisle = fAisle.value
  if (fRow.value) p.row = fRow.value
  if (fLevel.value) p.level = fLevel.value
  store.setFilter(p)
}

function clearFilter() {
  fCode.value = ''
  fName.value = ''
  fAisle.value = ''
  fRow.value = ''
  fLevel.value = ''
  store.setFilter({})
}

const hasFilters = () => fCode.value || fName.value || fAisle.value || fRow.value || fLevel.value

onMounted(() => {
  store.fetchShelves()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Estanterías</h1>
      <div class="header-actions">
        <button
          v-if="auth.hasPermission('shelves_create')"
          class="btn btn-primary"
          @click="store.openCreateForm()"
        >+ Nueva</button>
        <button class="btn" @click="store.togglePalette()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>
          <span>Productos</span>
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <input v-model="fCode" type="text" placeholder="Código" class="filter-field" @keyup.enter="doFilter" />
      <input v-model="fName" type="text" placeholder="Nombre" class="filter-field" @keyup.enter="doFilter" />
      <input v-model="fAisle" type="text" placeholder="Pasillo" class="filter-field filter-sm" @keyup.enter="doFilter" />
      <input v-model="fRow" type="number" min="0" placeholder="Fila" class="filter-field filter-num" @keyup.enter="doFilter" />
      <input v-model="fLevel" type="number" min="0" placeholder="Nivel" class="filter-field filter-num" @keyup.enter="doFilter" />
      <button class="btn" @click="doFilter">Filtrar</button>
      <button v-if="hasFilters()" class="btn btn-ghost" @click="clearFilter">Limpiar</button>
    </div>

    <ShelfFormModal />
    <ShelfDetailModal />

    <div v-if="store.dropFeedback" class="toast" :class="{ error: store.dropFeedback.includes('Error') || store.dropFeedback.includes('excede') || store.dropFeedback.includes('ya está') }">
      {{ store.dropFeedback }}
    </div>

    <div v-if="store.loading && store.shelves.length === 0" class="skeleton-grid">
      <div v-for="i in 6" :key="i" class="skeleton shelf-skeleton"></div>
    </div>

    <div v-else-if="store.error && store.shelves.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchShelves()">Reintentar</button>
    </div>

    <div v-else-if="store.shelves.length === 0" class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.3">
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
        <polyline points="3 10 3 3 21 3 21 10"/>
        <line x1="21" y1="10" x2="21" y2="17"/>
        <line x1="3" y1="10" x2="3" y2="17"/>
        <line x1="8" y1="7" x2="8" y2="10"/>
        <line x1="16" y1="7" x2="16" y2="10"/>
      </svg>
      <p>No hay estanterías registradas.</p>
    </div>

    <div v-if="store.error && store.shelves.length > 0" class="error-banner">
      <span>{{ store.error }}</span>
    </div>

    <div class="content-layout">
      <div class="main-content">
        <ShelvesGrid />
      </div>
      <ProductPalette v-if="store.isPaletteOpen" />
    </div>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  gap: 8px;
}

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-field {
  width: auto;
  min-width: 140px;
}

.filter-sm {
  max-width: 100px;
}

.filter-num {
  max-width: 80px;
}

.content-layout {
  display: flex;
  gap: 0;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.shelf-skeleton {
  min-height: 180px;
  border-radius: var(--radius);
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 200;
  padding: 12px 20px;
  background: var(--success);
  color: #fff;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  animation: toast-in 0.25s ease;
}

.toast.error {
  background: var(--danger);
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
