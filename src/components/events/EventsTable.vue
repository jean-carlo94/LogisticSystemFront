<script setup lang="ts">
import { useEventsStore } from '@/stores/events'
import EventBadge from './EventBadge.vue'

const store = useEventsStore()

const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('es-PE')
}

const prettyJson = (raw: string): string => {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}
</script>

<template>
  <table v-if="store.events.length > 0" class="events-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Producto</th>
        <th>Acci&oacute;n</th>
        <th>Datos</th>
        <th>Fecha</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="event in store.events" :key="event.id">
        <td>{{ event.id }}</td>
        <td>#{{ event.product_id }}</td>
        <td>
          <EventBadge :action="event.action" />
        </td>
        <td class="details-cell">
          <pre>{{ prettyJson(event.description) }}</pre>
        </td>
        <td>{{ formatDate(event.create_at) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.events-table {
  width: 100%;
  border-collapse: collapse;
}

.events-table th,
.events-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.events-table th {
  text-align: left;
  font-weight: 500;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
  white-space: nowrap;
}

.events-table td {
  font-size: 14px;
}

.details-cell pre {
  margin: 0;
  padding: 8px 12px;
  background: var(--code-bg);
  border-radius: 6px;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-h);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}
</style>
