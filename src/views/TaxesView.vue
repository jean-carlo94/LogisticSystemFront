<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useTaxesStore } from '@/stores/taxes'
import { useAuthStore } from '@/stores/auth'
import TaxFormModal from '@/components/taxes/TaxFormModal.vue'
import TaxesTable from '@/components/taxes/TaxesTable.vue'

const store = useTaxesStore()
const auth = useAuthStore()

const fName = ref(store.filterParams.name ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

const unwatch = watch(fName, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (fName.value) {
      store.setFilter({ name: fName.value })
    } else if (Object.keys(store.filterParams).length > 0) {
      store.setFilter({})
    }
  }, 400)
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  unwatch()
})

onMounted(() => {
  store.fetchTaxes()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Impuestos</h1>
      <button v-if="auth.hasPermission('taxes_manage')" class="btn btn-primary" @click="store.openCreateForm()">+ Nuevo</button>
    </div>

    <TaxFormModal />

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">Nombre</label>
        <input v-model="fName" type="text" placeholder="Buscar..." aria-label="Filtrar por nombre" class="filter-field" @keyup.enter="store.setFilter({ name: fName })" />
      </div>
      <button v-if="fName" class="btn btn-ghost" @click="fName = ''; store.setFilter({})">Limpiar</button>
    </div>

    <div v-if="store.loading && store.taxes.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 40px; height: 16px"></div>
        <div class="skeleton" style="width: 180px; height: 16px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
        <div class="skeleton" style="width: 200px; height: 16px"></div>
        <div class="skeleton" style="width: 60px; height: 16px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
      </div>
    </div>
    <div v-else-if="store.error && store.taxes.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchTaxes()">Reintentar</button>
    </div>
    <div v-else-if="store.taxes.length === 0" class="empty-state">
      <p>No hay impuestos registrados.</p>
    </div>
    <div v-if="store.error && store.taxes.length > 0" class="error-banner">
      <span>{{ store.error }}</span>
    </div>

    <TaxesTable />
  </div>
</template>

<style scoped>
.filter-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end; }
.filter-field { width: auto; min-width: 220px; }
</style>
