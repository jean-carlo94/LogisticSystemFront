<script setup lang="ts">
import { useStationsStore } from '@/stores/stations'
import Pagination from '@/components/ui/Pagination.vue'
import StationCard from './StationCard.vue'

const store = useStationsStore()

function onSelect(station: Parameters<typeof store.selectStation>[0]) {
  store.selectStation(station)
}
</script>

<template>
  <div v-if="store.stations.length > 0" class="stations-section">
    <div class="stations-grid">
      <StationCard
        v-for="station in store.stations"
        :key="station.id"
        :station="station"
        @select="onSelect"
      />
    </div>
    <Pagination :page="store.page" :pages="store.pages" :total="store.total" :size="store.size" @change="store.goToPage" @resize="store.setSize" />
  </div>
</template>

<style scoped>
.stations-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
</style>
