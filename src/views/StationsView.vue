<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useStationsStore } from '@/stores/stations'
import { useAuthStore } from '@/stores/auth'
import StationFormModal from '@/components/stations/StationFormModal.vue'
import StationsGrid from '@/components/stations/StationsGrid.vue'
import StationSessionPanel from '@/components/stations/StationSessionPanel.vue'
import TransferModal from '@/components/stations/TransferModal.vue'

const store = useStationsStore()
const auth = useAuthStore()

const fCode = ref(store.filterParams.code ?? '')
const fName = ref(store.filterParams.name ?? '')
const fArea = ref(store.filterParams.area ?? '')
const fStatus = ref(store.filterParams.status ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const unwatch = watch([fCode, fName, fArea, fStatus], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (hasFilters()) {
      doFilter()
    } else if (Object.keys(store.filterParams).length > 0) {
      store.setFilter({})
    }
  }, 400)
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  unwatch()
})

function doFilter() {
  const p: Record<string, string> = {}
  if (fCode.value) p.code = fCode.value
  if (fName.value) p.name = fName.value
  if (fArea.value) p.area = fArea.value
  if (fStatus.value) p.status = fStatus.value
  store.setFilter(p)
}

function clearFilter() {
  fCode.value = ''
  fName.value = ''
  fArea.value = ''
  fStatus.value = ''
  store.setFilter({})
}

const hasFilters = () => fCode.value || fName.value || fArea.value || fStatus.value

onMounted(() => {
  store.fetchStations()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Estaciones</h1>
      <button v-if="auth.hasPermission('stations_manage')" class="btn btn-primary" @click="store.openCreateForm()">+ Nueva</button>
    </div>

    <StationFormModal />
    <TransferModal />

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Código</label>
        <input v-model="fCode" type="text" placeholder="Ej: MESA-01" aria-label="Filtrar por código" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Nombre</label>
        <input v-model="fName" type="text" placeholder="Buscar..." aria-label="Filtrar por nombre" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Área</label>
        <input v-model="fArea" type="text" placeholder="Ej: SALÓN" aria-label="Filtrar por área" class="filter-field" @keyup.enter="doFilter" />
      </div>
      <div class="filter-group">
        <label class="filter-label">Estado</label>
        <select v-model="fStatus" aria-label="Filtrar por estado" class="filter-field" @change="doFilter">
          <option value="">Todos</option>
          <option value="AVAILABLE">Disponible</option>
          <option value="OCCUPIED">Ocupada</option>
          <option value="RESERVED">Reservada</option>
          <option value="MAINTENANCE">Mantenimiento</option>
        </select>
      </div>
      <button class="btn" @click="doFilter">Filtrar</button>
      <button v-if="hasFilters()" class="btn btn-ghost" @click="clearFilter">Limpiar</button>
    </div>

    <div class="stations-layout">
      <div class="stations-main" :class="{ 'with-panel': store.selectedStation }">
        <div v-if="store.loading && store.stations.length === 0" class="skeleton-grid">
          <div v-for="i in 6" :key="i" class="skeleton" style="height: 140px; border-radius: var(--radius)"></div>
        </div>
        <div v-else-if="store.error && store.stations.length === 0" class="error-banner">
          <span>{{ store.error }}</span>
          <button class="btn" @click="store.fetchStations()">Reintentar</button>
        </div>
        <div v-else-if="store.stations.length === 0" class="empty-state">
          <p>No hay estaciones registradas.</p>
        </div>
        <div v-if="store.error && store.stations.length > 0" class="error-banner">
          <span>{{ store.error }}</span>
        </div>
        <StationsGrid />
      </div>

      <div v-if="store.selectedStation" class="stations-sidebar">
        <StationSessionPanel />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end; }
.filter-field { width: auto; min-width: 130px; }

.stations-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.stations-main {
  flex: 1;
  min-width: 0;
}

.stations-main.with-panel {
  flex: 1;
  min-width: 0;
}

.stations-sidebar {
  width: 420px;
  flex-shrink: 0;
}

@media (max-width: 1100px) {
  .stations-layout {
    flex-direction: column;
  }
  .stations-sidebar {
    width: 100%;
  }
}
</style>
