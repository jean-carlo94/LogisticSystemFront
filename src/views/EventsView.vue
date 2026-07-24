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
  <div class="page">
    <div class="page-header">
      <h1>Log de eventos</h1>
    </div>

    <div v-if="store.loading && store.events.length === 0" class="empty-state">
      <p>Cargando eventos...</p>
    </div>

    <div v-else-if="store.error && store.events.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchEvents()">Reintentar</button>
    </div>

    <div v-else-if="store.events.length === 0" class="empty-state">
      <p>No hay eventos registrados.</p>
    </div>

    <div v-if="store.error && store.events.length > 0" class="error-banner">
      <span>{{ store.error }}</span>
    </div>

    <EventsTable />

    <Pagination
      :page="store.page"
      :pages="store.pages"
      :total="store.total"
      :size="store.size"
      @change="store.goToPage"
      @resize="store.setSize"
    />
  </div>
</template>

<style scoped>
.page {
  flex: 1;
  padding: 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.empty-state {
  text-align: center;
  padding: 64px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  margin-bottom: 16px;
  border-radius: var(--radius-sm);
  background: var(--danger-light);
  border: 1px solid var(--danger);
  color: var(--danger);
  font-size: 13px;
}

@media (max-width: 768px) {
  .page {
    padding: 20px 16px;
  }
}
</style>
