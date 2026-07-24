<script setup lang="ts">
import { onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import Pagination from '@/components/ui/Pagination.vue'

const store = useUsersStore()
const auth = useAuthStore()

onMounted(() => {
  store.fetchUsers()
})

function formatDate(date: string): string {
  return new Date(date).toLocaleString('es-PE', { dateStyle: 'short' })
}
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

    <div v-if="store.users.length > 0" class="table-wrap">
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
            <td>
              {{ [user.first_name, user.last_name].filter(Boolean).join(' ') || '—' }}
            </td>
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
            <td class="actions-cell" v-if="auth.hasPermission('users_manage')">
              <button class="btn btn-ghost" @click="store.openAssign(user.id)">Asignar rol</button>
              <button class="btn btn-ghost" @click="store.openEditForm(user)">Editar</button>
              <button
                v-if="!user.is_super_admin"
                class="btn btn-ghost danger"
                @click="store.deleteUser(user.id)"
              >
                Eliminar
              </button>
            </td>
            <td v-else></td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :page="store.page" :pages="store.pages" :total="store.total" :size="store.size" @change="store.goToPage" @resize="store.setSize" />

    <!-- Edit User Modal -->
    <Transition name="fade">
      <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
        <div class="modal">
          <h2>Editar usuario</h2>
          <form @submit.prevent="store.saveUser()" class="form">
            <div class="row">
              <label class="field">
                <span>Nombre</span>
                <input v-model="store.form.first_name" type="text" placeholder="Nombre" />
              </label>
              <label class="field">
                <span>Apellido</span>
                <input v-model="store.form.last_name" type="text" placeholder="Apellido" />
              </label>
            </div>
            <label class="field">
              <span>Email</span>
              <input v-model="store.form.email" type="email" placeholder="usuario@email.com" />
            </label>
            <label class="field">
              <span>Teléfono</span>
              <input v-model="store.form.phone" type="text" placeholder="+569..." />
            </label>
            <div class="row">
              <label class="field">
                <span>Ciudad</span>
                <input v-model="store.form.city" type="text" placeholder="Ciudad" />
              </label>
              <label class="field">
                <span>País</span>
                <input v-model="store.form.country" type="text" placeholder="País" />
              </label>
            </div>
            <label class="field">
              <span>Nueva contraseña (dejar vacío para no cambiar)</span>
              <input v-model="store.form.password" type="password" minlength="6" maxlength="128" placeholder="Mínimo 6 caracteres" />
            </label>
            <div class="actions">
              <button type="button" class="btn" @click="store.closeForm()">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="store.saving">
                {{ store.saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Assign Role Modal -->
    <Transition name="fade">
      <div v-if="store.isAssignOpen" class="overlay" @click.self="store.closeAssign()">
        <div class="modal">
          <h2>Asignar rol</h2>
          <div class="role-list">
            <label
              v-for="role in store.roles"
              :key="role.id"
              class="role-item"
              :class="{ selected: store.selectedRoleId === role.id }"
            >
              <input
                type="radio"
                name="assignRole"
                :value="role.id"
                :checked="store.selectedRoleId === role.id"
                @change="store.selectedRoleId = role.id"
              />
              <div>
                <strong>{{ role.name }}</strong>
                <span v-if="role.description">{{ role.description }}</span>
              </div>
            </label>
          </div>
          <div v-if="store.roles.length === 0" class="empty-state">Cargando roles...</div>
          <div class="actions">
            <button class="btn" @click="store.closeAssign()">Cancelar</button>
            <button class="btn btn-primary" :disabled="!store.selectedRoleId || store.saving" @click="store.saveAssign()">
              {{ store.saving ? 'Asignando...' : 'Asignar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
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

.empty-state {
  text-align: center;
  padding: 32px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.error-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  margin-bottom: 16px;
  border-radius: var(--radius-sm);
  background: var(--danger-light);
  border: 1px solid var(--danger);
  color: var(--danger);
  font-size: 13px;
}

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
  padding: 3px 10px;
  border-radius: 99px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: var(--bg-hover);
  color: var(--text-muted);
}

.status-toggle.active {
  background: var(--success-light);
  color: var(--success);
}

.status-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-hover);
  color: var(--text-muted);
}

.status-badge.active {
  background: var(--success-light);
  color: var(--success);
}

.badge-super {
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  background: var(--purple-light);
  color: var(--purple);
}

.badge-normal {
  font-size: 13px;
  color: var(--text-muted);
}

.btn-ghost {
  padding: 5px 10px;
  font-size: 13px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-ghost:hover { background: var(--bg-hover); color: var(--text-primary); }
.btn-ghost.danger:hover { background: var(--danger-light); color: var(--danger); }

.overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.modal {
  width: 520px;
  max-width: 100%;
  padding: 32px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
}

.modal h2 { margin-bottom: 24px; }

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field span { font-size: 13px; font-weight: 600; color: var(--text-secondary); }

.row { display: flex; gap: 16px; }
.row .field { flex: 1; }

.actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

.role-list { display: flex; flex-direction: column; gap: 4px; }
.role-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px; border-radius: var(--radius-sm); cursor: pointer;
}

.role-item:hover { background: var(--bg-hover); }
.role-item.selected { background: var(--accent-light); }
.role-item input[type='radio'] { width: auto; margin-top: 2px; accent-color: var(--accent); }
.role-item strong { display: block; font-size: 14px; font-weight: 500; color: var(--text-primary); }
.role-item span { font-size: 12px; color: var(--text-muted); }

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .row { flex-direction: column; }
}
</style>
