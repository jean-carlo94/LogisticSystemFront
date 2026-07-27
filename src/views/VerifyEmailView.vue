<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/auth'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const success = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    error.value = 'Token de activacion no encontrado'
    loading.value = false
    return
  }

  try {
    await authService.activate(token)
    success.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al activar la cuenta'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Logistic System</h1>
      <p class="subtitle">Activacion de cuenta</p>

      <div class="auth-form">
        <div v-if="loading" class="info-msg">Verificando tu cuenta...</div>
        <div v-if="success" class="success-msg">Cuenta activada correctamente</div>
        <div v-if="error" class="error-msg">{{ error }}</div>

        <button
          v-if="!loading"
          class="btn btn-primary btn-full"
          @click="router.push('/auth')"
        >
          Ir al inicio de sesion
        </button>
      </div>
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

.info-msg {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--accent-light);
  color: var(--accent);
  font-size: 13px;
  border: 1px solid var(--accent);
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
</style>
