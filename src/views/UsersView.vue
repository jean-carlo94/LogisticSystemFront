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

    <div v-if="store.loading && store.users.length === 0" class="empty-state">Cargando...</div>
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
.page {
  flex: 1;
  padding: 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.empty-state { text-align: center; padding: 32px 0; color: var(--text-secondary); font-size: 14px; }

.error-banner {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; margin-bottom: 16px; border-radius: var(--radius-sm);
  background: var(--danger-light); border: 1px solid var(--danger);
  color: var(--danger); font-size: 13px;
}

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
}
</style>
