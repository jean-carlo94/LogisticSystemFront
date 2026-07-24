<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import EventsTable from '@/components/events/EventsTable.vue'

const store = useEventsStore()
const route = useRoute()

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
</style>
