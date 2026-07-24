<script setup lang="ts">
import { AuditAction } from '@/types/event'

defineProps<{
  action: AuditAction
}>()

const labels: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'Creado',
  [AuditAction.UPDATE]: 'Actualizado',
  [AuditAction.DELETE]: 'Eliminado',
  [AuditAction.STATUS_CHANGED]: 'Estado',
}
</script>

<template>
  <span :class="['badge', action.toLowerCase()]">{{ labels[action] || action }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.create {
  background: var(--success-light);
  color: var(--success);
}

.update {
  background: var(--info-light);
  color: var(--info);
}

.delete {
  background: var(--danger-light);
  color: var(--danger);
}

.status_changed {
  background: var(--purple-light);
  color: var(--purple);
}
</style>
