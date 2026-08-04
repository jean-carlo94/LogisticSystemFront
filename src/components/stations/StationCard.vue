<script setup lang="ts">
import type { Station } from '@/types/station'
import { StationStatus } from '@/types/station'

defineProps<{
  station: Station
}>()

defineEmits<{
  select: [station: Station]
}>()

function statusLabel(status: StationStatus): string {
  const map: Record<string, string> = {
    [StationStatus.AVAILABLE]: 'Disponible',
    [StationStatus.OCCUPIED]: 'Ocupada',
    [StationStatus.RESERVED]: 'Reservada',
    [StationStatus.MAINTENANCE]: 'Mantenimiento',
  }
  return map[status] ?? status
}

function statusClass(status: StationStatus): string {
  const map: Record<string, string> = {
    [StationStatus.AVAILABLE]: 'status-available',
    [StationStatus.OCCUPIED]: 'status-occupied',
    [StationStatus.RESERVED]: 'status-reserved',
    [StationStatus.MAINTENANCE]: 'status-maintenance',
  }
  return map[status] ?? ''
}
</script>

<template>
  <div
    :class="['station-card', statusClass(station.status)]"
    role="button"
    tabindex="0"
    @click="$emit('select', station)"
    @keydown.enter="$emit('select', station)"
    @keydown.space.prevent="$emit('select', station)"
  >
    <div class="station-card-header">
      <span class="station-code">{{ station.code }}</span>
      <span :class="['station-status', statusClass(station.status)]">
        {{ statusLabel(station.status) }}
      </span>
    </div>
    <div class="station-card-body">
      <span v-if="station.name" class="station-name">{{ station.name }}</span>
      <span v-else class="station-name muted">Sin nombre</span>
      <div class="station-meta">
        <span v-if="station.area" class="station-area">{{ station.area }}</span>
        <span class="station-capacity">Capacidad: {{ station.capacity }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.station-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: inherit;
  color: var(--text-primary);
  padding: 0;
}

.station-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow);
  transform: translateY(-1px);
}

.station-card.status-occupied {
  border-color: var(--success);
}

.station-card.status-reserved {
  border-color: var(--warning);
}

.station-card.status-maintenance {
  border-color: var(--danger);
  opacity: 0.7;
}

.station-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.station-code {
  font-size: 18px;
  font-weight: 700;
  font-family: var(--mono);
}

.station-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-available .station-status {
  background: var(--success-light);
  color: var(--success);
}

.status-occupied .station-status {
  background: var(--accent-light);
  color: var(--accent);
}

.status-reserved .station-status {
  background: var(--warning-light);
  color: var(--warning);
}

.status-maintenance .station-status {
  background: var(--danger-light);
  color: var(--danger);
}

.station-card-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.station-name {
  font-size: 15px;
  font-weight: 600;
}

.station-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.station-area {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--bg-hover);
}

.station-capacity {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
