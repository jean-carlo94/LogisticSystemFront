<script setup lang="ts">
import { onMounted } from 'vue'
import { useCashRegisterStore } from '@/stores/cashRegister'
import { useAuthStore } from '@/stores/auth'
import type { CashRegister } from '@/types/cashRegister'
import { formatCurrency, formatDate } from '@/composables/useFormat'
import Pagination from '@/components/ui/Pagination.vue'

const store = useCashRegisterStore()
const auth = useAuthStore()

onMounted(() => {
  store.fetchCurrent()
  store.fetchHistory()
})

function statusClass(entry: CashRegister): string {
  return entry.closed_at ? 'status-closed' : 'status-open'
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Caja Registradora</h1>
    </div>

    <div v-if="store.loading && store.current === undefined" class="skeleton" style="height: 200px; border-radius: var(--radius)"></div>

    <div v-else class="cash-layout">
      <!-- Current state -->
      <div class="cash-current">
        <h2>Estado actual</h2>

        <div v-if="store.error" class="error-banner">
          <span>{{ store.error }}</span>
        </div>

        <!-- Open state -->
        <div v-if="store.current && !store.current.closed_at" class="cash-card cash-open">
          <div class="cash-card-header">
            <span class="cash-status-open">Abierta</span>
            <span class="cash-date">Desde {{ formatDate(store.current.opened_at, 'full') }}</span>
          </div>
          <div class="cash-detail">
            <div class="cash-row">
              <span>Apertura</span>
              <span class="cash-amount">{{ formatCurrency(store.current.opening_amount) }}</span>
            </div>
            <div v-if="store.current.expected_cash !== null" class="cash-row">
              <span>Esperado</span>
              <span class="cash-amount">{{ formatCurrency(store.current.expected_cash) }}</span>
            </div>
          </div>

          <div v-if="auth.hasPermission('cash_register_manage')" class="cash-close-form">
            <label class="field">
              <span>Monto de cierre</span>
              <input
                v-model.number="store.closingAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Monto al cerrar"
                aria-label="Monto de cierre de caja"
              />
            </label>
            <label class="field">
              <span>Notas (opcional)</span>
              <input
                v-model="store.closeNotes"
                type="text"
                placeholder="Observaciones"
                aria-label="Notas del cierre"
                autocomplete="off"
              />
            </label>
            <button class="btn btn-primary" :disabled="store.saving || store.closingAmount < 0" @click="store.closeRegister()">
              {{ store.saving ? 'Cerrando...' : 'Cerrar Caja' }}
            </button>
          </div>
        </div>

        <!-- Closed / none -->
        <div v-else class="cash-card cash-closed">
          <div v-if="store.current" class="cash-card-header">
            <span class="cash-status-closed">Cerrada</span>
            <span class="cash-date">Cerrada {{ store.current.closed_at ? formatDate(store.current.closed_at, 'full') : '' }}</span>
          </div>
          <div v-if="store.current" class="cash-detail">
            <div class="cash-row">
              <span>Apertura</span>
              <span class="cash-amount">{{ formatCurrency(store.current.opening_amount) }}</span>
            </div>
            <div v-if="store.current.closing_amount !== null" class="cash-row">
              <span>Cierre</span>
              <span class="cash-amount">{{ formatCurrency(store.current.closing_amount) }}</span>
            </div>
            <div v-if="store.current.expected_cash !== null" class="cash-row">
              <span>Esperado</span>
              <span class="cash-amount">{{ formatCurrency(store.current.expected_cash) }}</span>
            </div>
            <div v-if="store.current.discrepancy !== null" class="cash-row">
              <span>Diferencia</span>
              <span :class="['cash-amount', { 'cash-negative': store.current.discrepancy < 0 }]">{{ formatCurrency(store.current.discrepancy) }}</span>
            </div>
            <div v-if="store.current.notes" class="cash-row">
              <span>Notas</span>
              <span class="cash-notes">{{ store.current.notes }}</span>
            </div>
          </div>

          <div v-if="!store.current" class="empty-state cash-empty">
            <p>No hay caja activa.</p>
          </div>

          <div v-if="auth.hasPermission('cash_register_manage')" class="cash-open-form">
            <label class="field">
              <span>Monto de apertura</span>
              <input
                v-model.number="store.openingAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Monto inicial"
                aria-label="Monto de apertura de caja"
              />
            </label>
            <button class="btn btn-primary" :disabled="store.saving || store.openingAmount < 0" @click="store.openRegister()">
              {{ store.saving ? 'Abriendo...' : 'Abrir Caja' }}
            </button>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="cash-history">
        <h2>Historial</h2>

        <div v-if="store.history.length > 0" class="table-wrap">
          <table aria-label="Historial de caja">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Apertura</th>
                <th scope="col">Cierre</th>
                <th scope="col">Monto Apertura</th>
                <th scope="col">Monto Cierre</th>
                <th scope="col">Esperado</th>
                <th scope="col">Diferencia</th>
                <th scope="col">Notas</th>
                <th scope="col">Inicio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in store.history" :key="entry.id" :class="statusClass(entry)">
                <td class="id-cell">{{ entry.id }}</td>
                <td class="id-cell">#{{ entry.opened_by }}</td>
                <td class="id-cell">{{ entry.closed_by ? '#' + entry.closed_by : '—' }}</td>
                <td>{{ formatCurrency(entry.opening_amount) }}</td>
                <td>{{ entry.closing_amount !== null ? formatCurrency(entry.closing_amount) : '—' }}</td>
                <td>{{ entry.expected_cash !== null ? formatCurrency(entry.expected_cash) : '—' }}</td>
                <td :class="{ 'cash-negative': (entry.discrepancy ?? 0) < 0 }">{{ entry.discrepancy !== null ? formatCurrency(entry.discrepancy) : '—' }}</td>
                <td class="desc-cell">{{ entry.notes || '—' }}</td>
                <td class="date-cell">{{ formatDate(entry.opened_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state cash-history-empty">
          <p>No hay historial de caja.</p>
        </div>

        <Pagination
          v-if="store.history.length > 0"
          :page="store.historyPage" :pages="store.historyPages" :total="store.historyTotal" :size="store.historySize"
          @change="store.goToHistoryPage" @resize="store.setHistorySize"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cash-layout {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.cash-current h2,
.cash-history h2 {
  margin-bottom: 16px;
}

.cash-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cash-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.cash-status-open {
  font-size: 13px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 99px;
  background: var(--success-light);
  color: var(--success);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cash-status-closed {
  font-size: 13px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 99px;
  background: var(--text-muted);
  color: var(--bg-surface);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cash-date {
  font-size: 12px;
  color: var(--text-muted);
}

.cash-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cash-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.cash-amount {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.cash-negative {
  color: var(--danger);
}

.cash-notes {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
}

.cash-empty {
  padding: 24px 0;
}

.cash-open-form,
.cash-close-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.cash-history-empty {
  padding: 32px 0;
}
</style>
