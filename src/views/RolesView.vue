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

    <div v-if="store.loading && store.roles.length === 0" class="skeleton-table">
      <div v-for="i in 5" :key="i" class="skeleton-row">
        <div class="skeleton" style="width: 30px; height: 16px"></div>
        <div class="skeleton" style="width: 180px; height: 16px"></div>
        <div class="skeleton" style="width: 260px; height: 16px"></div>
      </div>
    </div>
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
  max-width: 1100px;
}
</style>
