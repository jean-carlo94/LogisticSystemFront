<script setup lang="ts">
const links = [
  { to: '/products', label: 'Productos' },
  { to: '/events', label: 'Eventos' },
]
</script>

<template>
  <nav class="app-nav">
    <span class="brand">AssisPrex</span>
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
  </nav>
</template>

<style scoped>
.app-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
  height: 56px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.brand {
  font-weight: 600;
  font-size: 18px;
  color: var(--text-h);
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-link {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 15px;
  color: var(--text);
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.nav-link:hover {
  background: var(--code-bg);
  color: var(--text-h);
}

.nav-link.active {
  background: var(--accent-bg);
  color: var(--accent);
}
</style>
