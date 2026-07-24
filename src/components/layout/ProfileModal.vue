<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ (e: 'close'): void }>()
const store = useAuthStore()
const isEditing = ref(false)
const form = ref({
  first_name: '',
  last_name: '',
  phone: '',
  city: '',
  country: '',
  password: '',
})
const saving = ref(false)
const localError = ref<string | null>(null)

function openEdit() {
  const u = store.user
  if (!u) return
  form.value = {
    first_name: u.first_name ?? '',
    last_name: u.last_name ?? '',
    phone: u.phone ?? '',
    city: u.city ?? '',
    country: u.country ?? '',
    password: '',
  }
  localError.value = null
  isEditing.value = true
}

function cancel() {
  isEditing.value = false
  localError.value = null
  emit('close')
}

async function save() {
  saving.value = true
  localError.value = null
  try {
    const payload: Record<string, string> = {}
    for (const key of ['first_name', 'last_name', 'phone', 'city', 'country', 'password']) {
      const k = key as keyof typeof form.value
      if (form.value[k]) payload[key] = form.value[k]
    }
    await store.updateProfile(payload)
    isEditing.value = false
  } catch (e) {
    localError.value = e instanceof Error ? e.message : 'Error'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Transition name="fade">
    <div class="overlay" @click.self="emit('close')">
      <div class="modal">
        <div v-if="!isEditing" class="view-mode">
          <h2>Mi perfil</h2>

          <div class="profile-info">
            <div class="info-row">
              <span class="label">Nombre</span>
              <span class="value">{{ store.displayName || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Email</span>
              <span class="value">{{ store.user?.email }}</span>
            </div>
            <div class="info-row">
              <span class="label">Teléfono</span>
              <span class="value">{{ store.user?.phone || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Ciudad</span>
              <span class="value">{{ store.user?.city || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">País</span>
              <span class="value">{{ store.user?.country || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Roles</span>
              <span class="value">{{ store.user?.roles?.map(r => r.name).join(', ') || '—' }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn" @click="emit('close')">Cerrar</button>
            <button class="btn btn-primary" @click="openEdit()">Editar perfil</button>
          </div>
        </div>

        <div v-else class="edit-mode">
          <h2>Editar perfil</h2>

          <form @submit.prevent="save()" class="form">
            <div class="row">
              <label class="field">
                <span>Nombre</span>
                <input v-model="form.first_name" type="text" placeholder="Nombre" />
              </label>
              <label class="field">
                <span>Apellido</span>
                <input v-model="form.last_name" type="text" placeholder="Apellido" />
              </label>
            </div>
            <label class="field">
              <span>Teléfono</span>
              <input v-model="form.phone" type="text" placeholder="+569..." />
            </label>
            <div class="row">
              <label class="field">
                <span>Ciudad</span>
                <input v-model="form.city" type="text" placeholder="Ciudad" />
              </label>
              <label class="field">
                <span>País</span>
                <input v-model="form.country" type="text" placeholder="País" />
              </label>
            </div>
            <label class="field">
              <span>Nueva contraseña (dejar vacío para no cambiar)</span>
              <input v-model="form.password" type="password" minlength="6" maxlength="128" placeholder="Mínimo 6 caracteres" />
            </label>

            <div v-if="localError" class="error-msg">{{ localError }}</div>

            <div class="actions">
              <button type="button" class="btn" @click="cancel()">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.profile-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.value {
  font-size: 14px;
  color: var(--text-primary);
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.error-msg {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--danger-light);
  color: var(--danger);
  font-size: 13px;
  border: 1px solid var(--danger);
}
</style>
