import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CashRegister } from '@/types/cashRegister'
import { cashRegisterService } from '@/services/cashRegister'
import { useAutoClearError } from '@/composables/useAutoClearError'

export const useCashRegisterStore = defineStore('cashRegister', () => {
  const current = ref<CashRegister | null>(null)
  const history = ref<CashRegister[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  const { clearErrorTimer } = useAutoClearError(error)

  const historyPage = ref(1)
  const historySize = ref(20)
  const historyTotal = ref(0)
  const historyPages = ref(0)

  const openingAmount = ref(0)
  const closingAmount = ref(0)
  const closeNotes = ref('')

  async function fetchCurrent() {
    loading.value = true
    error.value = null
    try {
      current.value = await cashRegisterService.getCurrent()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar caja'
    } finally {
      loading.value = false
    }
  }

  async function openRegister() {
    if (openingAmount.value < 0) return
    saving.value = true
    error.value = null
    try {
      current.value = await cashRegisterService.open({ opening_amount: openingAmount.value })
      openingAmount.value = 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al abrir caja'
    } finally {
      saving.value = false
    }
  }

  async function closeRegister() {
    if (closingAmount.value < 0) return
    saving.value = true
    error.value = null
    try {
      current.value = await cashRegisterService.close({
        closing_amount: closingAmount.value,
        notes: closeNotes.value.trim() || undefined,
      })
      closingAmount.value = 0
      closeNotes.value = ''
      fetchHistory()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cerrar caja'
    } finally {
      saving.value = false
    }
  }

  async function fetchHistory() {
    try {
      const res = await cashRegisterService.getHistory(historyPage.value, historySize.value)
      history.value = res.items
      historyTotal.value = res.total
      historyPages.value = res.pages
    } catch {
      /* silent */
    }
  }

  function goToHistoryPage(p: number) {
    historyPage.value = p
    fetchHistory()
  }

  function setHistorySize(s: number) {
    historySize.value = s
    historyPage.value = 1
    fetchHistory()
  }

  function reset() {
    clearErrorTimer()
    current.value = null
    history.value = []
    loading.value = false
    error.value = null
    saving.value = false
    historyPage.value = 1
    historySize.value = 20
    historyTotal.value = 0
    historyPages.value = 0
    openingAmount.value = 0
    closingAmount.value = 0
    closeNotes.value = ''
  }

  return {
    current,
    history,
    loading,
    error,
    saving,
    historyPage,
    historySize,
    historyTotal,
    historyPages,
    openingAmount,
    closingAmount,
    closeNotes,
    fetchCurrent,
    openRegister,
    closeRegister,
    fetchHistory,
    goToHistoryPage,
    setHistorySize,
    reset,
  }
})
