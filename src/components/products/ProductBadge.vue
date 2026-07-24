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
  <span :class="['badge', state.toLowerCase()]">{{ labels[state] }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
}

.active {
  background: var(--success-light);
  color: var(--success);
}

.inactive {
  background: var(--bg-hover);
  color: var(--text-muted);
}

.no_stock {
  background: var(--warning-light);
  color: var(--warning);
}

.discontinued {
  background: var(--danger-light);
  color: var(--danger);
}
</style>
