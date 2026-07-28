<script setup lang="ts">
const props = defineProps<{
  page: number
  pages: number
  total: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
  (e: 'resize', size: number): void
}>()

const sizes = [10, 20, 50, 100]

function visiblePages(): (number | '...')[] {
  const result: (number | '...')[] = []
  const p = props.pages

  if (p <= 7) {
    for (let i = 1; i <= p; i++) result.push(i)
    return result
  }

  result.push(1)
  if (props.page > 3) result.push('...')

  const start = Math.max(2, props.page - 1)
  const end = Math.min(p - 1, props.page + 1)
  for (let i = start; i <= end; i++) result.push(i)

  if (props.page < p - 2) result.push('...')
  result.push(p)

  return result
}
</script>

<template>
  <div v-if="pages > 1 || total > 0" class="pagination">
    <div class="size-selector">
      <select :value="size" aria-label="Cantidad de registros por página" @change="emit('resize', Number(($event.target as HTMLSelectElement).value))">
        <option v-for="s in sizes" :key="s" :value="s">{{ s }}</option>
      </select>
      <span class="info">{{ total }} registros</span>
    </div>

    <div class="buttons">
      <button class="page-btn" :disabled="page === 1" @click="emit('change', page - 1)">&laquo;</button>

      <template v-for="p in visiblePages()" :key="p">
        <span v-if="p === '...'" class="dots">...</span>
        <button v-else class="page-btn" :class="{ active: p === page }" @click="emit('change', p)">{{ p }}</button>
      </template>

      <button class="page-btn" :disabled="page === pages" @click="emit('change', page + 1)">&raquo;</button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  gap: 12px;
}

.size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-selector select {
  width: auto;
  padding: 5px 8px;
  font-size: 13px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
}

.info {
  font-size: 13px;
  color: var(--text-muted);
}

.buttons {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: var(--bg-hover);
  border-color: var(--text-muted);
}

.page-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.dots {
  width: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 13px;
}
</style>
