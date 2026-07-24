<script setup lang="ts">
import { useEventsStore } from '@/stores/events'
import EventBadge from './EventBadge.vue'

const store = useEventsStore()

function formatDate(date: string): string {
  return new Date(date).toLocaleString('es-PE')
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}
</script>

<template>
  <div v-if="store.events.length > 0" class="table-wrap">
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
          <td class="date-cell">{{ formatDate(event.create_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.id-cell {
  font-size: 13px;
  color: var(--text-muted);
}

.date-cell {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.json-cell pre {
  margin: 0;
  padding: 8px 12px;
  background: var(--bg-input);
  border-radius: var(--radius-sm);
  font-family: var(--mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 160px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .table-wrap {
    overflow-x: auto;
  }
}
</style>
