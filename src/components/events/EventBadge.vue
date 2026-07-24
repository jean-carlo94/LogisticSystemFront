<script setup lang="ts">
defineProps<{
  action: string
}>()

const labels: Record<string, string> = {
  CREATE: 'Creado',
  UPDATE: 'Actualizado',
  DELETE: 'Eliminado',
  STATUS_CHANGED: 'Estado cambiado',
}
</script>

<template>
  <span :class="['badge', `badge-action-${action.toLowerCase()}`]">
    {{ labels[action] || action }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.badge-action-create {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.badge-action-update {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.badge-action-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.badge-action-status_changed {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}
</style>
