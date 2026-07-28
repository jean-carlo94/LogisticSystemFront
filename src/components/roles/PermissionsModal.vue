<script setup lang="ts">
import { computed } from 'vue'
import { useRolesStore } from '@/stores/roles'
import { useAuthStore } from '@/stores/auth'

const store = useRolesStore()
const auth = useAuthStore()

const checkedIds = computed(() => new Set(store.rolePermissions.map(p => p.id)))

function togglePermission(permId: number) {
  const ids = store.rolePermissions.map(p => p.id)
  if (ids.includes(permId)) {
    ids.splice(ids.indexOf(permId), 1)
  } else {
    ids.push(permId)
  }
  store.savePermissions(ids)
}
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isPermsOpen" class="overlay" @click.self="store.closePermissions()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permissions-title"
        @keydown.escape="store.closePermissions()"
      >
        <h2 id="permissions-title">Permisos del rol</h2>
        <div class="perms-list">
          <label
            v-for="perm in store.permissions"
            :key="perm.id"
            class="perm-item"
            :class="{ checked: checkedIds.has(perm.id) }"
          >
            <input
              type="checkbox"
              :checked="checkedIds.has(perm.id)"
              :disabled="!auth.hasPermission('roles_manage')"
              @change="togglePermission(perm.id)"
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
</style>
