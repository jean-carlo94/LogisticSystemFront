<script setup lang="ts">
import { usePaymentsStore } from '@/stores/payments'
import { PaymentMethod } from '@/types/payment'

const store = usePaymentsStore()

const methods: { value: PaymentMethod; label: string }[] = [
  { value: PaymentMethod.CASH, label: 'Efectivo' },
  { value: PaymentMethod.CARD, label: 'Tarjeta' },
  { value: PaymentMethod.TRANSFER, label: 'Transferencia' },
  { value: PaymentMethod.WALLET, label: 'Billetera digital' },
  { value: PaymentMethod.OTHER, label: 'Otro' },
]
</script>

<template>
  <Transition name="fade">
    <div v-if="store.isFormOpen" class="overlay" @click.self="store.closePaymentForm()">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-form-title"
        @keydown.escape="store.closePaymentForm()"
      >
        <h2 id="payment-form-title">Registrar pago</h2>

        <div v-if="store.error" class="error-banner">
          <span>{{ store.error }}</span>
        </div>

        <form class="form" @submit.prevent="store.submitPayment()">
          <label class="field">
            <span>Método</span>
            <select v-model="store.formMethod" aria-label="Método de pago">
              <option v-for="m in methods" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </label>

          <label class="field">
            <span>Monto</span>
            <input
              v-model.number="store.formAmount"
              type="number"
              min="0.01"
              step="0.01"
              required
              aria-label="Monto del pago"
            />
          </label>

          <label class="field">
            <span>Referencia (opcional)</span>
            <input
              v-model="store.formReference"
              type="text"
              placeholder="Ej: #00123"
              aria-label="Referencia del pago"
              autocomplete="off"
            />
          </label>

          <div class="actions">
            <button type="button" class="btn" @click="store.closePaymentForm()">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="store.saving">
              {{ store.saving ? 'Registrando...' : 'Registrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
