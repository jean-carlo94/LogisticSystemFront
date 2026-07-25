<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useAuthStore } from '@/stores/auth'
import CategoryFormModal from '@/components/categories/CategoryFormModal.vue'
import CategoriesTable from '@/components/categories/CategoriesTable.vue'

const store = useCategoriesStore()
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
  store.fetchCategories()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Categorías</h1>
      <button v-if="auth.hasPermission('categories_create')" class="btn btn-primary" @click="store.openCreateForm()">+ Nueva</button>
    </div>

    <CategoryFormModal />

    <div class="filter-bar">
      <input v-model="fName" type="text" placeholder="Buscar por nombre" class="filter-field" @keyup.enter="store.setFilter({ name: fName })" />
      <button v-if="fName" class="btn btn-ghost" @click="fName = ''; store.setFilter({})">Limpiar</button>
    </div>

    <div v-if="store.loading && store.categories.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 40px; height: 16px"></div>
        <div class="skeleton" style="width: 180px; height: 16px"></div>
        <div class="skeleton" style="width: 200px; height: 16px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
      </div>
    </div>
    <div v-else-if="store.error && store.categories.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchCategories()">Reintentar</button>
    </div>
    <div v-else-if="store.categories.length === 0" class="empty-state">
      <p>No hay categorías registradas.</p>
    </div>
    <div v-if="store.error && store.categories.length > 0" class="error-banner">
      <span>{{ store.error }}</span>
    </div>

    <CategoriesTable />
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
  min-width: 220px;
}
</style>
