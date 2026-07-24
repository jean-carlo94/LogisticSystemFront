<script setup lang="ts">
import { onMounted } from 'vue'
import { useRolesStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'
import Pagination from '@/components/ui/Pagination.vue'

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

    <div v-if="store.roles.length > 0" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th v-if="auth.hasPermission('roles_manage')"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in store.roles" :key="role.id">
            <td class="id-cell">{{ role.id }}</td>
            <td class="name-cell">{{ role.name }}</td>
            <td class="desc-cell">{{ role.description || '—' }}</td>
            <td class="actions-cell" v-if="auth.hasPermission('roles_manage')">
              <button class="btn btn-ghost" @click="store.openPermissions(role.id)">Permisos</button>
              <button class="btn btn-ghost" @click="store.openEditForm(role)">Editar</button>
              <button class="btn btn-ghost danger" @click="store.deleteRole(role.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination :page="store.page" :pages="store.pages" :total="store.total" :size="store.size" @change="store.goToPage" @resize="store.setSize" />

    <!-- Role Form Modal -->
    <Transition name="fade">
      <div v-if="store.isFormOpen" class="overlay" @click.self="store.closeForm()">
        <div class="modal">
          <h2>{{ store.isEditing ? 'Editar rol' : 'Nuevo rol' }}</h2>
          <form @submit.prevent="store.saveRole()" class="form">
            <label class="field">
              <span>Nombre</span>
              <input v-model="store.form.name" type="text" required placeholder="Nombre del rol" />
            </label>
            <label class="field">
              <span>Descripción</span>
              <input v-model="store.form.description" type="text" placeholder="Opcional" />
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

    <!-- Permissions Modal -->
    <Transition name="fade">
      <div v-if="store.isPermsOpen" class="overlay" @click.self="store.closePermissions()">
        <div class="modal">
          <h2>Permisos del rol</h2>
          <div class="perms-list">
            <label
              v-for="perm in store.permissions"
              :key="perm.id"
              class="perm-item"
              :class="{ checked: store.rolePermissions.some(p => p.id === perm.id) }"
            >
              <input
                type="checkbox"
                :checked="store.rolePermissions.some(p => p.id === perm.id)"
                :disabled="!auth.hasPermission('roles_manage')"
                @change="
                  (e) => {
                    const target = e.target as HTMLInputElement
                    const ids = store.rolePermissions.map(p => p.id)
                    if (target.checked) ids.push(perm.id)
                    else ids.splice(ids.indexOf(perm.id), 1)
                    store.savePermissions(ids)
                  }
                "
              />
              <div class="perm-info">
                <code>{{ perm.code }}</code>
                <span>{{ perm.description }}</span>
              </div>
            </label>
          </div>
          <div class="actions">
            <button class="btn" @click="store.closePermissions()">Cerrar</button>
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

.table-wrap { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.id-cell { font-size: 13px; color: var(--text-muted); }
.name-cell { font-weight: 500; }
.desc-cell { color: var(--text-secondary); font-size: 13px; }
.actions-cell { display: flex; gap: 4px; }

.btn-ghost {
  padding: 5px 10px; font-size: 13px; border: none; border-radius: var(--radius-sm);
  background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
}
.btn-ghost:hover { background: var(--bg-hover); color: var(--text-primary); }
.btn-ghost.danger:hover { background: var(--danger-light); color: var(--danger); }

.overlay {
  position: fixed; inset: 0; background: var(--bg-modal);
  display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px;
}

.modal {
  width: 480px; max-width: 100%; padding: 32px;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius); box-shadow: var(--shadow-lg);
}

.modal h2 { margin-bottom: 24px; }
.form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field span { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
.actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

.perms-list { display: flex; flex-direction: column; gap: 2px; max-height: 320px; overflow-y: auto; }
.perm-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 12px; border-radius: var(--radius-sm); cursor: pointer;
}
.perm-item:hover { background: var(--bg-hover); }
.perm-item.checked { background: var(--accent-light); }
.perm-item input[type='checkbox'] { width: auto; margin-top: 2px; accent-color: var(--accent); }
.perm-info { display: flex; flex-direction: column; gap: 2px; }
.perm-info code { font-size: 13px; padding: 0; background: transparent; font-family: var(--mono); color: var(--text-primary); }
.perm-info span { font-size: 12px; color: var(--text-muted); }

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
}
</style>
