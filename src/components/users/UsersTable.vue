<script setup lang="ts">
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import Pagination from '@/components/ui/Pagination.vue'

const store = useUsersStore()
const auth = useAuthStore()

function formatDate(date: string): string {
  return new Date(date).toLocaleString('es-PE', { dateStyle: 'short' })
}
</script>

<template>
  <div v-if="store.users.length > 0">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Nombre</th>
            <th>Ciudad</th>
            <th>Estado</th>
            <th>Tipo</th>
            <th>Creado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in store.users" :key="user.id">
            <td class="id-cell">{{ user.id }}</td>
            <td class="email-cell">{{ user.email }}</td>
            <td>{{ [user.first_name, user.last_name].filter(Boolean).join(' ') || '—' }}</td>
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
            <td class="date-cell">{{ formatDate(user.created_at) }}</td>
            <td v-if="auth.hasPermission('users_manage')" class="actions-cell">
              <button class="btn btn-ghost" @click="store.openAssign(user.id)">Asignar rol</button>
              <button class="btn btn-ghost" @click="store.openEditForm(user)">Editar</button>
              <button v-if="!user.is_super_admin" class="btn btn-ghost danger" @click="store.deleteUser(user.id)">Eliminar</button>
            </td>
            <td v-else></td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination :page="store.page" :pages="store.pages" :total="store.total" :size="store.size" @change="store.goToPage" @resize="store.setSize" />
  </div>
</template>

<style scoped>
.table-wrap {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.id-cell { font-size: 13px; color: var(--text-muted); }
.email-cell { font-weight: 500; }
.date-cell { font-size: 13px; color: var(--text-secondary); white-space: nowrap; }
.muted { color: var(--text-muted); font-size: 13px; }
.actions-cell { display: flex; gap: 4px; }

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

.btn-ghost {
  padding: 5px 10px; font-size: 13px; border: none; border-radius: var(--radius-sm);
  background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
}
.btn-ghost:hover { background: var(--bg-hover); color: var(--text-primary); }
.btn-ghost.danger:hover { background: var(--danger-light); color: var(--danger); }
</style>
