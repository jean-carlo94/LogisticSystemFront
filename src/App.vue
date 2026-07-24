<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { useSidebar } from '@/composables/useSidebar'

const route = useRoute()
const authStore = useAuthStore()
const { collapsed } = useSidebar()

const showSidebar = computed(() => authStore.isAuthenticated && route.name !== 'auth')
</script>

<template>
  <AppSidebar v-if="showSidebar" />
  <main :class="{ 'with-sidebar': showSidebar, collapsed }">
    <router-view />
  </main>
</template>

<style scoped>
main {
  flex: 1;
  min-height: 100svh;
}

main.with-sidebar {
  margin-left: 220px;
  transition: margin-left 0.2s ease;
}

main.with-sidebar.collapsed {
  margin-left: 64px;
}

@media (max-width: 768px) {
  main.with-sidebar {
    margin-left: 64px;
  }
}
</style>
