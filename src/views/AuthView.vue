<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const store = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const modeError = ref<string | null>(null)

async function submit() {
  modeError.value = null

  try {
    await store.login(email.value, password.value)
    router.push('/products')
  } catch (e) {
    modeError.value = e instanceof Error ? e.message : 'Error'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Logistic System</h1>
      <p class="subtitle">Ingresa a tu cuenta</p>

      <form @submit.prevent="submit" class="auth-form">
        <label class="field">
          <span>Email</span>
          <input v-model="email" type="email" required placeholder="admin@logistica.com" />
        </label>

        <label class="field">
          <span>Contraseña</span>
          <input v-model="password" type="password" required minlength="6" maxlength="128" autocomplete="current-password" placeholder="Mínimo 6 caracteres" />
        </label>

        <div v-if="modeError" class="error-msg">{{ modeError }}</div>

        <button type="submit" class="btn btn-primary btn-full" :disabled="store.loading">
          {{ store.loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p class="toggle-text forgot">
        <button class="link-btn" @click="router.push('/forgot-password')">¿Olvidaste tu contraseña?</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: 380px;
  max-width: 100%;
  padding: 40px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
}

.auth-card h1 {
  text-align: center;
  margin-bottom: 4px;
}

.subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 28px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field span {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.error-msg {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--danger-light);
  color: var(--danger);
  font-size: 13px;
  border: 1px solid var(--danger);
}

.btn-full {
  width: 100%;
  padding: 10px;
  font-size: 15px;
}

.toggle-text {
  text-align: center;
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.link-btn {
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}
</style>
