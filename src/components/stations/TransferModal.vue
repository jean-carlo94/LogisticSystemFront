<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStationsStore } from '@/stores/stations'
import { StationStatus } from '@/types/station'

const store = useStationsStore()

const targetId = ref<number | null>(null)

const availableStations = computed(() =>
  store.stations.filter((s) =>
    s.id !== store.selectedStation?.id &&
    s.status === StationStatus.AVAILABLE
  )
)
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isTransferOpen" class="overlay" @click.self="store.closeTransfer()">
      <div
        class="modal transfer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-title"
        @keydown.escape="store.closeTransfer()"
      >
        <h2 id="transfer-title">Transferir sesión</h2>

        <p class="transfer-subtitle">
          Transferir sesión de <strong>{{ store.selectedStation?.code }}</strong> a otra estación disponible.
        </p>

        <div v-if="store.error" class="error-banner">
          <span>{{ store.error }}</span>
        </div>

        <div v-if="availableStations.length === 0" class="empty-state">
          <p>No hay estaciones disponibles para transferir.</p>
        </div>

        <div v-else class="transfer-list">
          <label
            v-for="s in availableStations"
            :key="s.id"
            :class="['transfer-option', { selected: targetId === s.id }]"
          >
            <input
              v-model="targetId"
              type="radio"
              :value="s.id"
              name="targetStation"
              class="transfer-radio"
            />
            <div class="transfer-info">
              <span class="transfer-code">{{ s.code }}</span>
              <span v-if="s.name" class="transfer-name">{{ s.name }}</span>
              <span v-if="s.area" class="transfer-area">{{ s.area }}</span>
            </div>
          </label>
        </div>

        <div class="actions">
          <button type="button" class="btn" @click="store.closeTransfer()">Cancelar</button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="targetId === null || store.transferSaving"
            @click="store.transferTo(targetId!)"
          >
            {{ store.transferSaving ? 'Transfiriendo...' : 'Transferir' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.transfer-modal {
  width: 480px;
  max-height: 80vh;
  overflow-y: auto;
}

.transfer-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.transfer-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.transfer-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.transfer-option:hover {
  border-color: var(--accent);
}

.transfer-option.selected {
  border-color: var(--accent);
  background: var(--accent-light);
}

.transfer-radio {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
}

.transfer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.transfer-code {
  font-size: 14px;
  font-weight: 600;
  font-family: var(--mono);
}

.transfer-name {
  font-size: 13px;
  color: var(--text-secondary);
}

.transfer-area {
  font-size: 11px;
  color: var(--text-muted);
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--bg-hover);
  display: inline-block;
  width: fit-content;
}
</style>
