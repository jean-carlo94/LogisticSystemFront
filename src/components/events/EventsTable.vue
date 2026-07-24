<script setup lang="ts">
import { useEventsStore } from '@/stores/events'
import { formatDate } from '@/composables/useFormat'
import EventBadge from './EventBadge.vue'
import Pagination from '@/components/ui/Pagination.vue'

const store = useEventsStore()

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}
</script>

<template>
  <div v-if="store.events.length > 0">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Entidad</th>
            <th>Acción</th>
            <th>Datos</th>
            <th>Usuario</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in store.events" :key="event.id">
            <td class="id-cell">{{ event.id }}</td>
            <td>{{ event.entity_type }} #{{ event.entity_id }}</td>
            <td><EventBadge :action="event.action" /></td>
            <td class="json-cell"><pre>{{ prettyJson(event.description) }}</pre></td>
            <td class="id-cell">#{{ event.user_id }}</td>
            <td class="date-cell">{{ formatDate(event.create_at, 'full') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :page="store.page" :pages="store.pages" :total="store.total" :size="store.size" @change="store.goToPage" @resize="store.setSize" />
  </div>
</template>

<style scoped>
.json-cell pre {
  margin: 0; padding: 8px 12px; background: var(--bg-input); border-radius: var(--radius-sm);
  font-family: var(--mono); font-size: 12px; line-height: 1.5; color: var(--text-primary);
  white-space: pre-wrap; word-break: break-word; max-height: 160px; overflow-y: auto;
}
</style>
