<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import EventsTable from '@/components/events/EventsTable.vue'
import { AuditAction, EntityType } from '@/types/event'

const store = useEventsStore()
const route = useRoute()

const fAction = ref(store.filterParams.action ?? '')
const fEntityType = ref(store.filterParams.entity_type ?? '')
const fUserId = ref(store.filterParams.user_id ?? '')
const fEntityId = ref(store.filterParams.entity_id ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const unwatch = watch([fAction, fEntityType, fUserId, fEntityId], () => {
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
  if (fAction.value) p.action = fAction.value
  if (fEntityType.value) p.entity_type = fEntityType.value
  if (fUserId.value) p.user_id = fUserId.value
  if (fEntityId.value) p.entity_id = fEntityId.value
  store.setFilter(p)
}

function clearFilter() {
  fAction.value = ''
  fEntityType.value = ''
  fUserId.value = ''
  fEntityId.value = ''
  store.setFilter({})
}

const hasFilters = () => fAction.value || fEntityType.value || fUserId.value || fEntityId.value

onMounted(() => {
  const productId = route.query.product_id
  if (productId) {
    store.setProductFilter(Number(productId))
  }
  store.fetchEvents()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Log de eventos</h1>
    </div>

    <div class="filter-bar">
      <select v-model="fAction" class="filter-field" @change="doFilter">
        <option value="">Acción</option>
        <option :value="AuditAction.CREATE">Creación</option>
        <option :value="AuditAction.UPDATE">Actualización</option>
        <option :value="AuditAction.DELETE">Eliminación</option>
        <option :value="AuditAction.STATUS_CHANGED">Cambio de estado</option>
      </select>
      <select v-model="fEntityType" class="filter-field" @change="doFilter">
        <option value="">Tipo de entidad</option>
        <option :value="EntityType.Product">Producto</option>
        <option :value="EntityType.User">Usuario</option>
      </select>
      <input v-model="fUserId" type="number" min="1" placeholder="ID Usuario" class="filter-field filter-num" @keyup.enter="doFilter" />
      <input v-model="fEntityId" type="number" min="1" placeholder="ID Entidad" class="filter-field filter-num" @keyup.enter="doFilter" />
      <button class="btn" @click="doFilter">Filtrar</button>
      <button v-if="hasFilters()" class="btn btn-ghost" @click="clearFilter">Limpiar</button>
    </div>

    <div v-if="store.loading && store.events.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 30px; height: 16px"></div>
        <div class="skeleton" style="width: 120px; height: 16px"></div>
        <div class="skeleton" style="width: 100px; height: 22px"></div>
        <div class="skeleton" style="width: 240px; height: 16px"></div>
        <div class="skeleton" style="width: 40px; height: 16px"></div>
        <div class="skeleton" style="width: 140px; height: 16px"></div>
      </div>
    </div>
    <div v-else-if="store.error && store.events.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchEvents()">Reintentar</button>
    </div>
    <div v-else-if="store.events.length === 0" class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px; opacity: 0.3">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <p>No hay eventos registrados.</p>
    </div>
    <div v-if="store.error && store.events.length > 0" class="error-banner">
      <span>{{ store.error }}</span>
    </div>

    <EventsTable />
  </div>
</template>

<style scoped>
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

.filter-num {
  max-width: 100px;
}
</style>
