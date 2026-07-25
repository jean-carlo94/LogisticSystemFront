<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getMediaUrl } from '@/composables/useFormat'

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

const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const dropActive = ref(false)
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

const avatarSrc = computed(() => {
  if (avatarPreview.value) return avatarPreview.value
  return getMediaUrl(store.user?.image_url)
})

const avatarInitial = computed(() => {
  if (!store.user) return '?'
  const name = [store.user.first_name, store.user.last_name].filter(Boolean).join(' ') || store.user.email
  return name.charAt(0).toUpperCase()
})

const roleNames = computed(() => store.user?.roles?.map(r => r.name).join(', ') || '—')

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
  avatarFile.value = null
  avatarPreview.value = null
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

    if (avatarFile.value) {
      await store.uploadAvatar(avatarFile.value)
      avatarFile.value = null
      avatarPreview.value = null
    }

    isEditing.value = false
  } catch (e) {
    localError.value = e instanceof Error ? e.message : 'Error'
  } finally {
    saving.value = false
  }
}

function onAvatarSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && file.type.startsWith('image/')) {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

function onAvatarDrop(event: DragEvent) {
  dropActive.value = false
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}


async function removeAvatar() {
  try {
    await store.deleteAvatar()
    avatarPreview.value = null
    avatarFile.value = null
  } catch (e) {
    localError.value = e instanceof Error ? e.message : 'Error al eliminar imagen'
  }
}
</script>

<template>
  <Transition name="fade">
    <div class="overlay" @click.self="emit('close')">
      <div class="modal profile-modal">
        <div v-if="!isEditing" class="view-mode">
          <div class="avatar-block">
            <img v-if="avatarSrc" :src="avatarSrc" alt="Avatar" class="avatar-img" />
            <div v-else class="avatar-placeholder">{{ avatarInitial }}</div>
          </div>

          <h2>{{ store.displayName || '—' }}</h2>
          <p class="profile-email">{{ store.user?.email }}</p>

          <div class="profile-info">
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
              <span class="value">{{ roleNames }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn" @click="emit('close')">Cerrar</button>
            <button class="btn btn-primary" @click="openEdit()">Editar perfil</button>
          </div>
        </div>

        <div v-else class="edit-mode">
          <div class="avatar-block">
            <img v-if="avatarSrc" :src="avatarSrc" alt="Avatar" class="avatar-img" />
            <div v-else class="avatar-placeholder">{{ avatarInitial }}</div>
          </div>

          <h2>Editar perfil</h2>

            <div class="avatar-section">
            <span class="avatar-section-label">Cambiar avatar</span>

            <div
              :class="['drop-zone', { 'drop-active': dropActive }]"
              @dragover.prevent="dropActive = true"
              @dragleave="dropActive = false"
              @drop.prevent="onAvatarDrop"
              @click="fileInput?.click()"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>{{ avatarFile ? avatarFile.name : 'Arrastra una imagen o haz clic aquí' }}</span>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                hidden
                @change="onAvatarSelect"
              />
            </div>

            <button
              v-if="store.user?.image_url && !avatarPreview"
              type="button"
              class="btn btn-ghost danger"
              @click="removeAvatar()"
            >Quitar avatar actual</button>
          </div>

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
.profile-modal {
  text-align: center;
}

.avatar-block {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.avatar-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 99px;
  border: 3px solid var(--border);
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 99px;
  background: var(--accent-light);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
}

.view-mode h2 {
  margin-bottom: 2px;
}

.profile-email {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  text-align: left;
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

.edit-mode h2 {
  margin-bottom: 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  text-align: left;
}

.avatar-section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  align-self: flex-start;
}

.avatar-upload-row {
  display: flex;
  gap: 10px;
  align-items: center;
  align-self: flex-start;
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-muted);
  font-size: 13px;
  min-height: 100px;
  align-self: stretch;
}

.drop-zone:hover {
  border-color: var(--text-muted);
  color: var(--text-secondary);
}

.drop-zone.drop-active {
  border-color: var(--accent);
  background: var(--accent-light);
  color: var(--accent);
}

.edit-mode .form {
  text-align: left;
}
</style>
