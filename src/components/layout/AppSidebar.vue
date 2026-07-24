<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import { useSidebar } from '@/composables/useSidebar'

const store = useAuthStore()
const router = useRouter()
const { theme, toggle: toggleTheme } = useTheme()
const { collapsed, toggle: toggleSidebar } = useSidebar()

const links = computed(() => {
  const items = [
    { to: '/products', label: 'Productos', icon: 'box', show: true },
    { to: '/events', label: 'Eventos', icon: 'clock', show: store.hasPermission('events_read') },
    { to: '/roles', label: 'Roles', icon: 'shield', show: store.hasPermission('roles_manage') },
    { to: '/users', label: 'Usuarios', icon: 'users', show: store.hasPermission('users_manage') },
  ]
  return items.filter(l => l.show)
})

function logout() {
  store.logout()
  router.push('/auth')
}

const displayName = computed(() => {
  const u = store.user
  if (!u) return ''
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email
})
</script>

<template>
  <aside :class="['sidebar', { collapsed }]">
    <div class="sidebar-header">
      <router-link to="/products" class="brand">
        <span v-if="!collapsed" class="brand-text">Logistic System</span>
        <span v-else class="brand-icon">LS</span>
      </router-link>
      <button class="collapse-btn" @click="toggleSidebar()" :title="collapsed ? 'Expandir' : 'Colapsar'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline v-if="collapsed" points="9 18 15 12 9 6"/>
          <polyline v-else points="15 18 9 12 15 6"/>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="nav-item"
        active-class="active"
        :title="link.label"
      >
        <svg v-if="link.icon === 'box'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
        <svg v-else-if="link.icon === 'clock'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <svg v-else-if="link.icon === 'shield'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <svg v-else-if="link.icon === 'users'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span v-if="!collapsed" class="nav-label">{{ link.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="theme-toggle" @click="toggleTheme()" :title="theme === 'light' ? 'Modo oscuro' : 'Modo claro'">
        <svg v-if="theme === 'light'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <span v-if="!collapsed" class="footer-label">{{ theme === 'light' ? 'Claro' : 'Oscuro' }}</span>
      </button>

      <div v-if="store.user && !collapsed" class="user-info">
        <span class="user-name">{{ displayName }}</span>
        <span class="user-email">{{ store.user.email }}</span>
      </div>

      <button class="logout-btn" @click="logout" title="Salir">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span v-if="!collapsed" class="footer-label">Salir</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 220px;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  transition: width 0.2s ease;
  z-index: 40;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  height: 56px;
  border-bottom: 1px solid var(--border);
}

.brand {
  text-decoration: none;
  overflow: hidden;
}

.brand-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.brand-icon {
  font-size: 18px;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: -1px;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
  white-space: nowrap;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-light);
  color: var(--accent);
}

.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-toggle,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: none;
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

.theme-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.logout-btn:hover {
  background: var(--danger-light);
  color: var(--danger);
}

.user-info {
  padding: 4px 12px 8px;
  overflow: hidden;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.user-email {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px;
  }

  .sidebar:not(.collapsed) {
    width: 220px;
    box-shadow: var(--shadow-lg);
  }
}
</style>
