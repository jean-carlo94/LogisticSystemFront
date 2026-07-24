<script setup lang="ts">
import { useRolesStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'

const store = useRolesStore()
const auth = useAuthStore()
</script>

<template>
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
</template>

<style scoped>
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
  width: 480px;
  max-width: 100%;
  padding: 32px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
}

.modal h2 { margin-bottom: 24px; }

.perms-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 320px;
  overflow-y: auto;
}

.perm-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s;
}

.perm-item:hover { background: var(--bg-hover); }
.perm-item.checked { background: var(--accent-light); }

.perm-item input[type='checkbox'] {
  width: auto;
  margin-top: 2px;
  accent-color: var(--accent);
}

.perm-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.perm-info code {
  font-size: 13px;
  padding: 0;
  background: transparent;
  font-family: var(--mono);
  color: var(--text-primary);
}

.perm-info span { font-size: 12px; color: var(--text-muted); }

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
