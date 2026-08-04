import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Payment, SaleReceipt } from '@/types/payment'
import { PaymentMethod } from '@/types/payment'
import { paymentsService } from '@/services/payments'
import { salesService } from '@/services/sales'
import { useAutoClearError } from '@/composables/useAutoClearError'

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref<Payment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  const { clearErrorTimer } = useAutoClearError(error)

  const page = ref(1)
  const size = ref(20)
  const total = ref(0)
  const pages = ref(0)

  const isFormOpen = ref(false)
  const formSaleId = ref<number | null>(null)
  const formMethod = ref<PaymentMethod>('CASH' as PaymentMethod)
  const formAmount = ref(0)
  const formReference = ref('')

  const isReceiptOpen = ref(false)
  const receipt = ref<SaleReceipt | null>(null)
  const receiptLoading = ref(false)

  async function fetchPayments() {
    loading.value = true
    error.value = null
    try {
      const res = await paymentsService.getAll(page.value, size.value)
      payments.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar pagos'
    } finally {
      loading.value = false
    }
  }

  function goToPage(p: number) {
    page.value = p
    fetchPayments()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchPayments()
  }

  function openPaymentForm(saleId: number, pendingAmount: number) {
    formSaleId.value = saleId
    formAmount.value = pendingAmount
    formMethod.value = 'CASH' as PaymentMethod
    formReference.value = ''
    isFormOpen.value = true
  }

  function closePaymentForm() {
    isFormOpen.value = false
    error.value = null
  }

  async function submitPayment() {
    if (!formSaleId.value || formAmount.value <= 0) return
    saving.value = true
    error.value = null
    try {
      await paymentsService.create({
        sale_id: formSaleId.value,
        method: formMethod.value,
        amount: formAmount.value,
        reference: formReference.value.trim() || undefined,
      })
      closePaymentForm()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al registrar pago'
    } finally {
      saving.value = false
    }
  }

  async function cancelSale(saleId: number) {
    saving.value = true
    error.value = null
    try {
      await salesService.cancel(saleId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al anular venta'
    } finally {
      saving.value = false
    }
  }

  async function fetchReceipt(saleId: number) {
    receiptLoading.value = true
    error.value = null
    try {
      receipt.value = await salesService.receipt(saleId)
      isReceiptOpen.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar recibo'
    } finally {
      receiptLoading.value = false
    }
  }

  function closeReceipt() {
    isReceiptOpen.value = false
    receipt.value = null
  }

  function reset() {
    clearErrorTimer()
    payments.value = []
    loading.value = false
    error.value = null
    saving.value = false
    page.value = 1
    size.value = 20
    total.value = 0
    pages.value = 0
    isFormOpen.value = false
    formSaleId.value = null
    formMethod.value = 'CASH' as PaymentMethod
    formAmount.value = 0
    formReference.value = ''
    isReceiptOpen.value = false
    receipt.value = null
    receiptLoading.value = false
  }

  return {
    payments,
    loading,
    error,
    saving,
    page,
    size,
    total,
    pages,
    isFormOpen,
    formSaleId,
    formMethod,
    formAmount,
    formReference,
    isReceiptOpen,
    receipt,
    receiptLoading,
    fetchPayments,
    goToPage,
    setSize,
    openPaymentForm,
    closePaymentForm,
    submitPayment,
    cancelSale,
    fetchReceipt,
    closeReceipt,
    reset,
  }
})
