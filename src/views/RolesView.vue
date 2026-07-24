<script setup lang="ts">
import { onMounted } from 'vue'
import { useRolesStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'
import RolesTable from '@/components/roles/RolesTable.vue'
import RoleFormModal from '@/components/roles/RoleFormModal.vue'
import PermissionsModal from '@/components/roles/PermissionsModal.vue'

const store = useRolesStore()
const auth = useAuthStore()

onMounted(() => {
  store.fetchRoles()
  store.fetchPermissions()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Roles</h1>
      <button v-if="auth.hasPermission('roles_manage')" class="btn btn-primary" @click="store.openCreateForm()">+ Nuevo rol</button>
    </div>

    <div v-if="store.loading && store.roles.length === 0" class="empty-state">Cargando...</div>
    <div v-else-if="store.error && store.roles.length === 0" class="error-banner">
      <span>{{ store.error }}</span>
      <button class="btn" @click="store.fetchRoles()">Reintentar</button>
    </div>

    <RolesTable />

    <RoleFormModal />
    <PermissionsModal />
  </div>
</template>

<style scoped>
.page {
  flex: 1;
  padding: 32px;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.empty-state { text-align: center; padding: 64px 0; color: var(--text-secondary); }

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
