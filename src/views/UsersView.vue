<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import UsersTable from '@/components/users/UsersTable.vue'
import UserFormModal from '@/components/users/UserFormModal.vue'
import RoleAssignModal from '@/components/users/RoleAssignModal.vue'

const store = useUsersStore()

onMounted(() => {
  store.fetchUsers()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Usuarios</h1>
    </div>

    <div v-if="store.loading && store.users.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 30px; height: 16px"></div>
        <div class="skeleton" style="width: 200px; height: 16px"></div>
        <div class="skeleton" style="width: 140px; height: 16px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
        <div class="skeleton" style="width: 70px; height: 22px"></div>
        <div class="skeleton" style="width: 80px; height: 22px"></div>
        <div class="skeleton" style="width: 80px; height: 16px"></div>
      </div>
    </div>
    <div v-else-if="store.error && store.users.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchUsers()">Reintentar</button>
    </div>

    <UsersTable />

    <UserFormModal />
    <RoleAssignModal />
  </div>
</template>

<style scoped>
.empty-state {
  padding: 32px 0;
}
</style>
