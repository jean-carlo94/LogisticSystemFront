<script setup lang="ts">
import { useTenantsStore } from '@/stores/tenants'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/composables/useFormat'
import Pagination from '@/components/ui/Pagination.vue'

const store = useTenantsStore()
const auth = useAuthStore()
</script>

<template>
  <div v-if="store.tenants.length > 0">
    <div class="table-wrap">
      <table aria-label="Lista de tenants">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">Slug</th>
            <th scope="col">Estado</th>
            <th scope="col">Creado</th>
            <th scope="col" v-if="auth.hasPermission('tenants_manage')"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tenant in store.tenants" :key="tenant.id">
            <td class="id-cell">{{ tenant.id }}</td>
            <td class="name-cell">{{ tenant.name }}</td>
            <td class="muted">{{ tenant.slug }}</td>
            <td>
              <span class="status-badge" :class="{ active: tenant.is_active }">
                {{ tenant.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="date-cell">{{ formatDate(tenant.created_at, 'short') }}</td>
            <td v-if="auth.hasPermission('tenants_manage')">
              <div class="actions-cell">
                <button v-if="tenant.is_active" class="btn btn-ghost" @click="store.openEditForm(tenant)">Editar</button>
                <button class="btn btn-ghost danger" @click="store.deleteTenant(tenant.id)">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :page="store.page" :pages="store.pages" :total="store.total" :size="store.size" @change="store.goToPage" @resize="store.setSize" />
  </div>
</template>

<style scoped>
.status-badge {
  padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;
  background: var(--bg-hover); color: var(--text-muted);
}
.status-badge.active { background: var(--success-light); color: var(--success); }
</style>
