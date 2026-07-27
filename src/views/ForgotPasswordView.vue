<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth'

const router = useRouter()

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref<string | null>(null)

async function submit() {
  error.value = null
  loading.value = true

  try {
    await authService.forgotPassword({ email: email.value })
    sent.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Logistic System</h1>
      <p class="subtitle">Recuperar contraseña</p>

      <form @submit.prevent="submit" class="auth-form">
        <div v-if="sent" class="success-msg">
          Si el email existe, recibiras instrucciones para restablecer tu contraseña
        </div>
        <div v-if="error" class="error-msg">{{ error }}</div>

        <template v-if="!sent">
          <label class="field">
            <span>Email</span>
            <input v-model="email" type="email" required placeholder="tu@email.com" />
          </label>

          <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
            {{ loading ? 'Enviando...' : 'Enviar instrucciones' }}
          </button>
        </template>
      </form>

      <p class="toggle-text">
        <button class="link-btn" @click="router.push('/auth')">Volver al inicio de sesion</button>
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

.success-msg {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--success-light);
  color: var(--success);
  font-size: 13px;
  border: 1px solid var(--success);
}

.btn-full {
  width: 100%;
  padding: 10px;
  font-size: 15px;
}

.toggle-text {
  text-align: center;
  margin-top: 20px;
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
