<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const store = useAuthStore()
const router = useRouter()
const { theme, toggle: toggleTheme } = useTheme()

const links = [
  { to: '/products', label: 'Productos' },
  { to: '/events', label: 'Eventos' },
]

function logout() {
  store.logout()
  router.push('/auth')
}
</script>

<template>
  <nav class="app-nav">
    <div class="nav-left">
      <router-link to="/products" class="brand">Logistic System</router-link>
      <div class="nav-links">
        <router-link
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          active-class="active"
        >
          {{ link.label }}
        </router-link>
      </div>
    </div>

    <div class="nav-right">
      <button class="theme-toggle" @click="toggleTheme" :title="theme === 'light' ? 'Modo oscuro' : 'Modo claro'">
        <svg v-if="theme === 'light'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </button>

      <span v-if="store.user" class="user-email">{{ store.user.email }}</span>

      <button class="btn btn-danger" @click="logout">Salir</button>
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.brand {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  letter-spacing: -0.3px;
}

.nav-links {
  display: flex;
  gap: 2px;
}

.nav-link {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.15s;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.nav-link.active {
  color: var(--accent);
  background: var(--accent-light);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.user-email {
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .app-nav {
    padding: 0 16px;
  }

  .nav-left {
    gap: 16px;
  }

  .user-email {
    display: none;
  }
}
</style>
