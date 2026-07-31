<script setup lang="ts">
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { formatDate, getMediaUrl } from '@/composables/useFormat'
import Pagination from '@/components/ui/Pagination.vue'

const store = useUsersStore()
const auth = useAuthStore()

function fullName(user: { first_name: string | null; last_name: string | null }): string {
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || '—'
}
</script>

<template>
  <div v-if="store.users.length > 0">
    <div class="table-wrap">
      <table aria-label="Lista de usuarios">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Avatar</th>
            <th scope="col">Email</th>
            <th scope="col">Nombre</th>
            <th scope="col">Ciudad</th>
            <th scope="col">Estado</th>
            <th scope="col">Tipo</th>
            <th scope="col" v-if="auth.user?.is_super_admin">Tenant</th>
            <th scope="col">Creado</th>
            <th scope="col" v-if="auth.hasPermission('users_manage')"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in store.users" :key="user.id">
            <td class="id-cell">{{ user.id }}</td>
            <td>
              <img
                v-if="user.image_url"
                :src="getMediaUrl(user.image_url) || ''"
                class="user-avatar"
                alt=""
              />
              <span v-else class="no-avatar">—</span>
            </td>
            <td class="email-cell">{{ user.email }}</td>
            <td>{{ fullName(user) }}</td>
            <td class="muted">{{ user.city || '—' }}</td>
            <td>
              <button
                v-if="auth.hasPermission('users_manage')"
                class="status-toggle"
                :class="{ active: user.is_active }"
                @click="store.toggleActive(user)"
                :disabled="user.is_super_admin"
              >
                {{ user.is_active ? 'Activo' : 'Inactivo' }}
              </button>
              <span v-else class="status-badge" :class="{ active: user.is_active }">
                {{ user.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <span v-if="user.is_super_admin" class="badge-super">Super Admin</span>
              <span v-else class="badge-normal">Usuario</span>
            </td>
            <td v-if="auth.user?.is_super_admin" class="id-cell">{{ user.tenant_id ?? '—' }}</td>
            <td class="date-cell">{{ formatDate(user.created_at, 'short') }}</td>
            <td v-if="auth.hasPermission('users_manage')">
              <div class="actions-cell">
                <button class="btn btn-ghost" @click="store.openAssign(user.id)">Asignar rol</button>
                <button class="btn btn-ghost" @click="store.openEditForm(user)">Editar</button>
              <button v-if="!user.is_super_admin" class="btn btn-ghost danger" @click="store.deleteUser(user.id)">Eliminar</button>
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
.status-toggle {
  padding: 3px 10px; border-radius: 99px; border: none; font-size: 12px;
  font-weight: 600; cursor: pointer; background: var(--bg-hover); color: var(--text-muted);
}
.status-toggle.active { background: var(--success-light); color: var(--success); }
.status-toggle:disabled { opacity: 0.6; cursor: not-allowed; }

.status-badge {
  padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;
  background: var(--bg-hover); color: var(--text-muted);
}
.status-badge.active { background: var(--success-light); color: var(--success); }

.badge-super {
  padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;
  background: var(--purple-light); color: var(--purple);
}
.badge-normal { font-size: 13px; color: var(--text-muted); }

.user-avatar {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 99px;
  border: 1px solid var(--border);
}

.no-avatar {
  color: var(--text-muted);
  font-size: 13px;
}
</style>
