<script setup lang="ts">
const props = defineProps<{
  page: number
  pages: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const visiblePages = (): (number | '...')[] => {
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
  <div v-if="pages > 1" class="pagination">
    <span class="pagination-info">{{ total }} registros</span>

    <div class="pagination-buttons">
      <button
        class="page-btn"
        :disabled="page === 1"
        @click="emit('change', page - 1)"
      >
        &laquo;
      </button>

      <template v-for="p in visiblePages()" :key="p">
        <span v-if="p === '...'" class="page-ellipsis">...</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: p === page }"
          @click="emit('change', p)"
        >
          {{ p }}
        </button>
      </template>

      <button
        class="page-btn"
        :disabled="page === pages"
        @click="emit('change', page + 1)"
      >
        &raquo;
      </button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-info {
  font-size: 14px;
  color: var(--text);
}

.pagination-buttons {
  display: flex;
  gap: 4px;
}

.page-btn {
  font-family: inherit;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent-border);
}

.page-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 6px 4px;
  color: var(--text);
}
</style>
