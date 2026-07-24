<script setup lang="ts">
import { useShelvesStore } from '@/stores/shelves'
import ShelfCard from './ShelfCard.vue'
import Pagination from '@/components/ui/Pagination.vue'

const store = useShelvesStore()
</script>

<template>
  <div v-if="store.shelves.length > 0">
    <div class="shelves-grid">
      <ShelfCard
        v-for="shelf in store.shelves"
        :key="shelf.id"
        :shelf="shelf"
        :detail="store.details.get(shelf.id)"
      />
    </div>
    <Pagination
      :page="store.page"
      :pages="store.pages"
      :total="store.total"
      :size="store.size"
      @change="store.goToPage"
      @resize="store.setSize"
    />
  </div>
</template>

<style scoped>
.shelves-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .shelves-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .shelves-grid {
    grid-template-columns: 1fr;
  }
}
</style>
