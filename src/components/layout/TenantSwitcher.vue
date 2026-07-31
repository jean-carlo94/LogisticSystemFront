<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTenantsStore } from '@/stores/tenants'
import type { Tenant } from '@/types/tenant'

const auth = useAuthStore()
const tenantsStore = useTenantsStore()
const isOpen = ref(false)
const tenants = ref<Tenant[]>([])
const selected = ref<Tenant | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) loadTenants()
}

function close() {
  isOpen.value = false
}

function select(tenant: Tenant | null) {
  selected.value = tenant
  auth.setTenant(tenant)
  close()
}

async function loadTenants() {
  const items = await tenantsStore.fetchAllTenants()
  tenants.value = items
}

function label(tenant: Tenant | null): string {
  if (!tenant) return 'Todos los tenants'
  return tenant.name
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.tenant-switcher')) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => auth.currentTenant, (t) => {
  selected.value = t
})
</script>

<template>
  <div class="tenant-switcher">
    <button class="tenant-dropdown-btn" @click="toggle" :title="label(selected)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
        <line x1="9" y1="22" x2="9" y2="2"/>
        <line x1="15" y1="22" x2="15" y2="2"/>
        <line x1="2" y1="8" x2="22" y2="8"/>
        <line x1="2" y1="16" x2="22" y2="16"/>
      </svg>
      <span class="tenant-label">{{ label(selected) }}</span>
      <svg v-if="isOpen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="tenant-dropdown">
        <button
          class="tenant-option"
          :class="{ selected: selected === null }"
          @click="select(null)"
        >
          Todos los tenants
        </button>
        <button
          v-for="t in tenants"
          :key="t.id"
          class="tenant-option"
          :class="{ selected: selected?.id === t.id }"
          @click="select(t)"
        >
          <span class="tenant-name">{{ t.name }}</span>
          <span class="tenant-slug">{{ t.slug }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tenant-switcher {
  position: relative;
  width: 100%;
}

.tenant-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.tenant-dropdown-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tenant-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tenant-dropdown {
  position: absolute;
  bottom: 100%;
  left: 8px;
  right: 8px;
  margin-bottom: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  max-height: 280px;
  overflow-y: auto;
  z-index: 50;
}

.tenant-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.1s;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.tenant-option:hover {
  background: var(--bg-hover);
}

.tenant-option.selected {
  background: var(--accent-light);
  color: var(--accent);
}

.tenant-option:first-child {
  border-radius: var(--radius) var(--radius) 0 0;
  font-weight: 600;
  border-bottom: 1px solid var(--border);
}

.tenant-name {
  font-weight: 500;
}

.tenant-slug {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
