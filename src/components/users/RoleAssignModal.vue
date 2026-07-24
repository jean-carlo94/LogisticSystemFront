<script setup lang="ts">
import { useUsersStore } from '@/stores/users'

const store = useUsersStore()
</script>

<template>
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

.empty-state {
  text-align: center;
  padding: 32px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.role-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s;
}

.role-item:hover { background: var(--bg-hover); }
.role-item.selected { background: var(--accent-light); }

.role-item input[type='radio'] {
  width: auto;
  margin-top: 2px;
  accent-color: var(--accent);
}

.role-item strong {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.role-item span { font-size: 12px; color: var(--text-muted); }

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
