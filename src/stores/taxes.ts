import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tax, TaxForm } from '@/types/tax'
import { createEmptyTax } from '@/types/tax'
import { taxesService } from '@/services/taxes'
import { useAutoClearError } from '@/composables/useAutoClearError'

export const useTaxesStore = defineStore('taxes', () => {
  const taxes = ref<Tax[]>([])
  const form = ref<TaxForm>(createEmptyTax())
  const editingId = ref<number | null>(null)
  const isFormOpen = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  const { clearErrorTimer } = useAutoClearError(error)

  const page = ref(1)
  const size = ref(20)
  const total = ref(0)
  const pages = ref(0)
  const filterParams = ref<Record<string, string>>({})

  const isEditing = computed(() => editingId.value !== null)

  async function fetchTaxes() {
    loading.value = true
    error.value = null

    try {
      const res = await taxesService.getAll(page.value, size.value, filterParams.value)
      taxes.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar impuestos'
    } finally {
      loading.value = false
    }
  }

  function setFilter(filters: Record<string, string>) {
    filterParams.value = filters
    page.value = 1
    fetchTaxes()
  }

  function goToPage(p: number) {
    page.value = p
    fetchTaxes()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchTaxes()
  }

  function openCreateForm() {
    form.value = createEmptyTax()
    editingId.value = null
    isFormOpen.value = true
  }

  function openEditForm(tax: Tax) {
    form.value = {
      name: tax.name,
      rate: tax.rate,
      description: tax.description ?? '',
    }
    editingId.value = tax.id
    isFormOpen.value = true
  }

  function closeForm() {
    isFormOpen.value = false
    error.value = null
  }

  async function saveTax() {
    if (!form.value.name.trim()) return

    saving.value = true
    error.value = null

    try {
      if (editingId.value !== null) {
        await taxesService.update(editingId.value, form.value)
      } else {
        await taxesService.create(form.value)
      }
      closeForm()
      fetchTaxes()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar impuesto'
    } finally {
      saving.value = false
    }
  }

  async function deleteTax(id: number) {
    loading.value = true
    error.value = null

    try {
      await taxesService.remove(id)
      if (editingId.value === id) closeForm()

      if (taxes.value.length === 1 && page.value > 1) {
        page.value--
      }
      fetchTaxes()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar impuesto'
    } finally {
      loading.value = false
    }
  }

  async function toggleActive(tax: Tax) {
    error.value = null
    try {
      await taxesService.update(tax.id, { is_active: !tax.is_active })
      fetchTaxes()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cambiar estado'
    }
  }

  function reset() {
    clearErrorTimer()
    taxes.value = []
    form.value = createEmptyTax()
    editingId.value = null
    isFormOpen.value = false
    loading.value = false
    error.value = null
    saving.value = false
    page.value = 1
    size.value = 20
    total.value = 0
    pages.value = 0
    filterParams.value = {}
  }

  return {
    taxes,
    form,
    editingId,
    isFormOpen,
    loading,
    error,
    saving,
    page,
    size,
    total,
    pages,
    filterParams,
    isEditing,
    fetchTaxes,
    setFilter,
    goToPage,
    setSize,
    openCreateForm,
    openEditForm,
    closeForm,
    saveTax,
    deleteTax,
    toggleActive,
    reset,
  }
})
