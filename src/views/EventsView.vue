<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import EventsTable from '@/components/events/EventsTable.vue'
import Pagination from '@/components/ui/Pagination.vue'

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
  <div class="events-page">
    <header class="page-header">
      <h1>Log de eventos</h1>
    </header>

    <div v-if="store.loading" class="empty-state">
      <p>Cargando eventos...</p>
    </div>

    <div v-else-if="store.error" class="error-banner">
      <p>{{ store.error }}</p>
      <button class="btn btn-sm" @click="store.fetchEvents()">Reintentar</button>
    </div>

    <div v-else-if="store.events.length === 0" class="empty-state">
      <p>No hay eventos registrados.</p>
    </div>

    <EventsTable />

    <Pagination
      :page="store.page"
      :pages="store.pages"
      :total="store.total"
      @change="store.goToPage"
    />
  </div>
</template>

<style scoped>
.events-page {
  width: 100%;
  padding: 32px;
  text-align: left;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
}

.empty-state {
  text-align: center;
  padding: 64px 0;
  color: var(--text);
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.error-banner p {
  color: #ef4444;
  margin: 0;
}

.btn {
  font-family: inherit;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
  cursor: pointer;
  background: var(--bg);
  color: var(--text-h);
  transition: background 0.2s, border-color 0.2s;
}

.btn:hover {
  border-color: var(--accent-border);
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .events-page {
    padding: 20px;
  }
}
</style>
