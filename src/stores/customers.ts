import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Customer, CustomerForm } from '@/types/customer'
import { createEmptyCustomer } from '@/types/customer'
import { customersService } from '@/services/customers'
import { useAutoClearError } from '@/composables/useAutoClearError'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
  const form = ref<CustomerForm>(createEmptyCustomer())
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

  async function fetchCustomers() {
    loading.value = true
    error.value = null
    try {
      const res = await customersService.getAll(page.value, size.value, filterParams.value)
      customers.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar clientes'
    } finally {
      loading.value = false
    }
  }

  function setFilter(filters: Record<string, string>) {
    filterParams.value = filters
    page.value = 1
    fetchCustomers()
  }

  function goToPage(p: number) {
    page.value = p
    fetchCustomers()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchCustomers()
  }

  function openCreateForm() {
    form.value = createEmptyCustomer()
    editingId.value = null
    isFormOpen.value = true
  }

  function openEditForm(customer: Customer) {
    form.value = {
      name: customer.name,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      document: customer.document ?? '',
      address: customer.address ?? '',
    }
    editingId.value = customer.id
    isFormOpen.value = true
  }

  function closeForm() {
    isFormOpen.value = false
    error.value = null
  }

  async function saveCustomer() {
    if (!form.value.name.trim()) return
    saving.value = true
    error.value = null
    try {
      if (editingId.value !== null) {
        await customersService.update(editingId.value, form.value)
      } else {
        await customersService.create(form.value)
      }
      closeForm()
      fetchCustomers()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar cliente'
    } finally {
      saving.value = false
    }
  }

  function reset() {
    clearErrorTimer()
    customers.value = []
    form.value = createEmptyCustomer()
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
    customers,
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
    fetchCustomers,
    setFilter,
    goToPage,
    setSize,
    openCreateForm,
    openEditForm,
    closeForm,
    saveCustomer,
    reset,
  }
})
