import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Station, StationSession, SessionItem } from '@/types/station'
import { SessionItemStatus, createEmptyStation } from '@/types/station'
import type { StationForm } from '@/types/station'
import { stationsService } from '@/services/stations'
import { productsService } from '@/services/products'
import type { Product } from '@/types/product'
import { useAutoClearError } from '@/composables/useAutoClearError'

export const useStationsStore = defineStore('stations', () => {
  const stations = ref<Station[]>([])
  const form = ref<StationForm>(createEmptyStation())
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

  const selectedStation = ref<Station | null>(null)
  const sessionDetail = ref<StationSession | null>(null)
  const sessionLoading = ref(false)
  const sessionError = ref<string | null>(null)

  const sessionCustomerName = ref('')
  const sessionCustomerEmail = ref('')
  const sessionCustomerPhone = ref('')
  const sessionCustomerDocument = ref('')
  const sessionCustomerAddress = ref('')

  const searchedProducts = ref<Product[]>([])
  const searchQuery = ref('')
  const searchLoading = ref(false)
  const searchError = ref<string | null>(null)

  const isTransferOpen = ref(false)
  const transferSaving = ref(false)

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  const isEditing = computed(() => editingId.value !== null)
  const isSessionActive = computed(() => sessionDetail.value?.status === 'OPEN')

  // ── Stations CRUD ──

  async function fetchStations() {
    loading.value = true
    error.value = null
    try {
      const res = await stationsService.getAll(page.value, size.value, filterParams.value)
      stations.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar estaciones'
    } finally {
      loading.value = false
    }
  }

  function setFilter(filters: Record<string, string>) {
    filterParams.value = filters
    page.value = 1
    fetchStations()
  }

  function goToPage(p: number) {
    page.value = p
    fetchStations()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchStations()
  }

  function openCreateForm() {
    form.value = createEmptyStation()
    editingId.value = null
    isFormOpen.value = true
  }

  function openEditForm(station: Station) {
    form.value = {
      code: station.code,
      name: station.name ?? '',
      area: station.area ?? '',
      capacity: station.capacity,
    }
    editingId.value = station.id
    isFormOpen.value = true
  }

  function closeForm() {
    isFormOpen.value = false
    error.value = null
  }

  async function saveStation() {
    if (!form.value.code.trim()) return
    saving.value = true
    error.value = null
    try {
      if (editingId.value !== null) {
        await stationsService.update(editingId.value, form.value)
      } else {
        await stationsService.create(form.value)
      }
      closeForm()
      fetchStations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar estación'
    } finally {
      saving.value = false
    }
  }

  async function deleteStation(id: number) {
    loading.value = true
    error.value = null
    try {
      await stationsService.remove(id)
      if (editingId.value === id) closeForm()
      if (stations.value.length === 1 && page.value > 1) page.value--
      fetchStations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar estación'
    } finally {
      loading.value = false
    }
  }

  // ── Session management ──

  async function selectStation(station: Station) {
    selectedStation.value = station
    await fetchStationDetail(station.id)
    if (sessionDetail.value) {
      clearCustomerFields()
    }
  }

  async function fetchStationDetail(id: number) {
    sessionLoading.value = true
    sessionError.value = null
    try {
      const detail = await stationsService.getDetail(id)
      sessionDetail.value = detail.active_session
      if (!sessionDetail.value) {
        selectedStation.value = { ...detail, active_session: undefined as unknown as never } as Station
      }
    } catch (e) {
      sessionError.value = e instanceof Error ? e.message : 'Error al cargar sesión'
    } finally {
      sessionLoading.value = false
    }
  }

  async function openSession(stationId: number) {
    saving.value = true
    error.value = null
    try {
      sessionDetail.value = await stationsService.open(stationId, {
        customer_name: sessionCustomerName.value.trim() || 'Cliente mostrador',
        customer_email: sessionCustomerEmail.value.trim() || undefined,
        customer_phone: sessionCustomerPhone.value.trim() || undefined,
        customer_document: sessionCustomerDocument.value.trim() || undefined,
        customer_address: sessionCustomerAddress.value.trim() || undefined,
      })
      clearCustomerFields()
      fetchStations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al abrir sesión'
    } finally {
      saving.value = false
    }
  }

  async function closeSession() {
    if (!selectedStation.value || !sessionDetail.value) return
    saving.value = true
    error.value = null
    try {
      await stationsService.close(selectedStation.value.id)
      sessionDetail.value = null
      fetchStations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cerrar sesión'
    } finally {
      saving.value = false
    }
  }

  async function cancelSession() {
    if (!selectedStation.value || !sessionDetail.value) return
    saving.value = true
    error.value = null
    try {
      await stationsService.cancelSession(selectedStation.value.id)
      sessionDetail.value = null
      fetchStations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cancelar sesión'
    } finally {
      saving.value = false
    }
  }

  function clearCustomerFields() {
    sessionCustomerName.value = ''
    sessionCustomerEmail.value = ''
    sessionCustomerPhone.value = ''
    sessionCustomerDocument.value = ''
    sessionCustomerAddress.value = ''
  }

  function clearSelection() {
    selectedStation.value = null
    sessionDetail.value = null
    sessionError.value = null
  }

  // ── Product search ──

  async function searchProducts(query: string) {
    if (searchTimer) clearTimeout(searchTimer)

    searchQuery.value = query

    if (!query.trim()) {
      searchedProducts.value = []
      return
    }

    searchTimer = setTimeout(async () => {
      searchLoading.value = true
      searchError.value = null
      try {
        const filters: Record<string, string> = {}
        const trimmed = query.trim()
        if (/^\d+$/.test(trimmed)) {
          filters.barcode = trimmed
        } else {
          filters.name = trimmed
        }
        const res = await productsService.getAll(1, 20, filters)
        searchedProducts.value = res.items
      } catch (e) {
        searchError.value = e instanceof Error ? e.message : 'Error al buscar productos'
      } finally {
        searchLoading.value = false
      }
    }, 400)
  }

  // ── Session items ──

  async function addItem(productId: number, quantity: number, notes?: string) {
    if (!selectedStation.value || !sessionDetail.value) return
    saving.value = true
    error.value = null
    try {
      const newItems = await stationsService.addItems(selectedStation.value.id, {
        items: [{ product_id: productId, quantity, notes }],
      })
      await fetchSessionItems()
      return newItems
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al agregar item'
    } finally {
      saving.value = false
    }
  }

  async function fetchSessionItems() {
    if (!selectedStation.value || !sessionDetail.value) return
    try {
      sessionDetail.value.items = await stationsService.getItems(selectedStation.value.id)
    } catch {
      /* silent */
    }
  }

  async function updateItemQuantity(itemId: number, quantity: number) {
    if (!selectedStation.value) return
    saving.value = true
    error.value = null
    try {
      await stationsService.updateItem(selectedStation.value.id, itemId, { quantity })
      await fetchSessionItems()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al actualizar item'
    } finally {
      saving.value = false
    }
  }

  async function cancelItem(itemId: number) {
    if (!selectedStation.value) return
    saving.value = true
    error.value = null
    try {
      await stationsService.cancelItem(selectedStation.value.id, itemId)
      await fetchSessionItems()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cancelar item'
    } finally {
      saving.value = false
    }
  }

  async function transitionItem(itemId: number, action: 'prepare' | 'ready' | 'deliver') {
    if (!selectedStation.value) return
    saving.value = true
    error.value = null
    try {
      const fn = {
        prepare: stationsService.prepareItem,
        ready: stationsService.readyItem,
        deliver: stationsService.deliverItem,
      }[action]
      await fn(selectedStation.value.id, itemId)
      await fetchSessionItems()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cambiar estado'
    } finally {
      saving.value = false
    }
  }

  // ── Transfer ──

  function openTransfer() {
    isTransferOpen.value = true
  }

  function closeTransfer() {
    isTransferOpen.value = false
    error.value = null
  }

  async function transferTo(targetId: number) {
    if (!selectedStation.value) return
    transferSaving.value = true
    error.value = null
    try {
      await stationsService.transfer(selectedStation.value.id, targetId)
      isTransferOpen.value = false
      sessionDetail.value = null
      fetchStations()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al transferir sesión'
    } finally {
      transferSaving.value = false
    }
  }

  // ── Computed ──

  const activeItems = computed(() =>
    (sessionDetail.value?.items ?? []).filter((i) => i.status !== SessionItemStatus.CANCELLED)
  )

  const sessionTotal = computed(() =>
    activeItems.value.reduce((sum, i) => sum + i.subtotal, 0)
  )

  function availableActions(item: SessionItem): string[] {
    switch (item.status) {
      case SessionItemStatus.CREATED: return ['prepare']
      case SessionItemStatus.PREPARING: return ['ready']
      case SessionItemStatus.READY: return ['deliver']
      default: return []
    }
  }

  function nextAction(item: SessionItem): string | null {
    switch (item.status) {
      case SessionItemStatus.CREATED: return 'Preparar'
      case SessionItemStatus.PREPARING: return 'Listo'
      case SessionItemStatus.READY: return 'Entregar'
      default: return null
    }
  }

  // ── Reset ──

  function reset() {
    clearErrorTimer()
    stations.value = []
    form.value = createEmptyStation()
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
    selectedStation.value = null
    sessionDetail.value = null
    sessionLoading.value = false
    sessionError.value = null
    sessionCustomerName.value = ''
    sessionCustomerEmail.value = ''
    sessionCustomerPhone.value = ''
    sessionCustomerDocument.value = ''
    sessionCustomerAddress.value = ''
    searchedProducts.value = []
    searchQuery.value = ''
    searchLoading.value = false
    searchError.value = null
    isTransferOpen.value = false
    transferSaving.value = false
    if (searchTimer) {
      clearTimeout(searchTimer)
      searchTimer = null
    }
  }

  return {
    stations,
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
    selectedStation,
    sessionDetail,
    sessionLoading,
    sessionError,
    sessionCustomerName,
    sessionCustomerEmail,
    sessionCustomerPhone,
    sessionCustomerDocument,
    sessionCustomerAddress,
    searchedProducts,
    searchQuery,
    searchLoading,
    searchError,
    isTransferOpen,
    transferSaving,
    isEditing,
    isSessionActive,
    activeItems,
    sessionTotal,
    fetchStations,
    setFilter,
    goToPage,
    setSize,
    openCreateForm,
    openEditForm,
    closeForm,
    saveStation,
    deleteStation,
    selectStation,
    openSession,
    closeSession,
    cancelSession,
    clearCustomerFields,
    clearSelection,
    searchProducts,
    addItem,
    fetchSessionItems,
    updateItemQuantity,
    cancelItem,
    transitionItem,
    availableActions,
    nextAction,
    openTransfer,
    closeTransfer,
    transferTo,
    reset,
  }
})
