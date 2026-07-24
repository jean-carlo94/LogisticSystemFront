<script setup lang="ts">
import { ProductState } from '@/types/product'

defineProps<{
  state: ProductState
}>()

const labels: Record<ProductState, string> = {
  [ProductState.ACTIVE]: 'Activo',
  [ProductState.INACTIVE]: 'Inactivo',
  [ProductState.NO_STOCK]: 'Sin stock',
  [ProductState.DISCONTINUED]: 'Descontinuado',
}
</script>

<template>
  <span :class="['badge', `badge-${state.toLowerCase()}`]">{{ labels[state] }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.badge-active {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.badge-inactive {
  background: rgba(156, 163, 175, 0.15);
  color: #6b7280;
}

.badge-no_stock {
  background: rgba(251, 191, 36, 0.15);
  color: #d97706;
}

.badge-discontinued {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
</style>
