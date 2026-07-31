import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderFormItem } from '@/types/order'
import type { Product } from '@/types/product'
import type { ProductLocation } from '@/types/sale'
import { ordersService } from '@/services/orders'
import { productsService } from '@/services/products'
import { useAutoClearError } from '@/composables/useAutoClearError'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const formItems = ref<OrderFormItem[]>([])
  const editingId = ref<number | null>(null)
  const isFormOpen = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  const { clearErrorTimer } = useAutoClearError(error)

  const page = ref(1)
  const size = ref(10)
  const total = ref(0)
  const pages = ref(0)
  const filterParams = ref<Record<string, string>>({})

  const isDetailOpen = ref(false)
  const selectedOrder = ref<Order | null>(null)

  const productSearchQuery = ref('')
  const productSearchResults = ref<Product[]>([])
  const productSearchLoading = ref(false)

  const selectedProductForShelf = ref<Product | null>(null)
  const shelfLocations = ref<ProductLocation[]>([])
  const shelfLocationsLoading = ref(false)

  const customerName = ref('')
  const customerEmail = ref('')
  const customerPhone = ref('')
  const customerDocument = ref('')
  const customerAddress = ref('')
  const notes = ref('')

  const boardFilter = ref('')
  const boardDate = ref(new Date().toISOString().slice(0, 10))

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  const orderTotal = computed(() =>
    formItems.value.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  )

  const orderTaxTotal = computed(() =>
    formItems.value.reduce((sum, item) => {
      const subtotal = item.unit_price * item.quantity
      const taxRate = (item.taxes ?? []).reduce((r, t) => r + t.rate, 0)
      return sum + (subtotal * taxRate) / 100
    }, 0)
  )

  const canTransition = computed(() => (from: string, to: string) => {
    const transitions: Record<string, string[]> = {
      CREATED: ['PREPARING'],
      PREPARING: ['READY'],
      READY: ['DELIVERED'],
    }
    return transitions[from]?.includes(to) ?? false
  })

  interface BoardColumn {
    items: Order[]
    page: number
    hasMore: boolean
    loading: boolean
  }

  const BOARD_STATUSES = ['CREATED', 'PREPARING', 'READY', 'DELIVERED'] as const

  const boardColumns = ref<Record<string, BoardColumn>>({
    CREATED: { items: [], page: 1, hasMore: true, loading: false },
    PREPARING: { items: [], page: 1, hasMore: true, loading: false },
    READY: { items: [], page: 1, hasMore: true, loading: false },
    DELIVERED: { items: [], page: 1, hasMore: true, loading: false },
  })

  function _initColumn(): BoardColumn {
    return { items: [], page: 1, hasMore: true, loading: false }
  }

  function resetBoardColumns() {
    for (const s of BOARD_STATUSES) {
      boardColumns.value[s] = _initColumn()
    }
    for (const s of BOARD_STATUSES) {
      fetchBoardColumn(s)
    }
  }

  async function fetchBoardColumn(status: string) {
    const col = boardColumns.value[status]
    if (!col || col.loading || !col.hasMore) return
    col.loading = true
    try {
      const filters: Record<string, string> = { status }
      if (boardFilter.value.trim()) filters.customer_name = boardFilter.value.trim()
      if (boardDate.value) filters.created_at = boardDate.value
      const res = await ordersService.getAll(col.page, 20, filters)
      col.items.push(...res.items)
      col.page++
      col.hasMore = col.page <= res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar columna'
    } finally {
      col.loading = false
    }
  }

  function setBoardFilter(filter: string) {
    boardFilter.value = filter
    resetBoardColumns()
  }

  function setBoardDate(date: string) {
    boardDate.value = date
    resetBoardColumns()
  }

  async function fetchOrders() {
    loading.value = true
    error.value = null

    try {
      const res = await ordersService.getAll(page.value, size.value, filterParams.value)
      orders.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar pedidos'
    } finally {
      loading.value = false
    }
  }

  function setFilter(filters: Record<string, string>) {
    filterParams.value = filters
    page.value = 1
    fetchOrders()
  }

  function goToPage(p: number) {
    page.value = p
    fetchOrders()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchOrders()
  }

  function openCreateForm() {
    customerName.value = ''
    customerEmail.value = ''
    customerPhone.value = ''
    customerDocument.value = ''
    customerAddress.value = ''
    notes.value = ''
    formItems.value = []
    editingId.value = null
    isFormOpen.value = true
  }

  function closeForm() {
    isFormOpen.value = false
    error.value = null
    productSearchQuery.value = ''
    productSearchResults.value = []
    selectedProductForShelf.value = null
    shelfLocations.value = []
  }

  function onProductSearch() {
    if (searchTimer) clearTimeout(searchTimer)
    const q = productSearchQuery.value.trim()
    if (!q) {
      productSearchResults.value = []
      return
    }
    searchTimer = setTimeout(async () => {
      productSearchLoading.value = true
      try {
        const filters: Record<string, string> = {}
        const trimmed = q.trim()
        if (/^\d+$/.test(trimmed)) {
          filters.barcode = trimmed
        } else {
          filters.name = trimmed
        }
        const res = await productsService.getAll(1, 10, filters)
        productSearchResults.value = res.items
      } catch {
        productSearchResults.value = []
      } finally {
        productSearchLoading.value = false
      }
    }, 300)
  }

  function selectProductForShelf(product: Product) {
    if (product.stock <= 0) return
    selectedProductForShelf.value = product
    shelfLocations.value = []
    productSearchQuery.value = ''
    productSearchResults.value = []
    fetchShelfLocations(product.id)
  }

  async function fetchShelfLocations(productId: number) {
    shelfLocationsLoading.value = true
    try {
      shelfLocations.value = await productsService.getLocations(productId)
    } catch {
      shelfLocations.value = []
    } finally {
      shelfLocationsLoading.value = false
    }
  }

  function addItemToOrder(shelfId: number | null, shelfCode: string | null, quantity: number, unitPrice: number) {
    if (!selectedProductForShelf.value || quantity < 1 || unitPrice <= 0) return

    const existingIndex = formItems.value.findIndex(
      (i) => i.product_id === selectedProductForShelf.value!.id && i.shelf_id === shelfId
    )

    if (existingIndex !== -1) {
      formItems.value[existingIndex].quantity += quantity
    } else {
      formItems.value.push({
        product_id: selectedProductForShelf.value.id,
        product_name: selectedProductForShelf.value.name,
        shelf_id: shelfId,
        shelf_code: shelfCode,
        quantity,
        unit_price: unitPrice,
        taxes: selectedProductForShelf.value.taxes ?? [],
      })
    }

    selectedProductForShelf.value = null
    shelfLocations.value = []
  }

  function removeFormItem(index: number) {
    formItems.value.splice(index, 1)
  }

  function updateFormItemQuantity(index: number, quantity: number) {
    if (quantity <= 0) {
      formItems.value.splice(index, 1)
    } else {
      formItems.value[index].quantity = quantity
    }
  }

  async function createOrder() {
    if (formItems.value.length === 0) return

    saving.value = true
    error.value = null

    try {
      const created = await ordersService.create({
        customer_name: customerName.value.trim() || 'Consumidor final',
        customer_email: customerEmail.value.trim() || undefined,
        customer_phone: customerPhone.value.trim() || undefined,
        customer_document: customerDocument.value.trim() || undefined,
        customer_address: customerAddress.value.trim() || undefined,
        notes: notes.value.trim() || undefined,
        items: formItems.value.map((item) => ({
          product_id: item.product_id,
          shelf_id: item.shelf_id ?? undefined,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      })
      closeForm()
      fetchOrders()
      boardColumns.value.CREATED.items.unshift(created)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al crear pedido'
    } finally {
      saving.value = false
    }
  }

  async function fetchOrderDetail(id: number) {
    error.value = null
    try {
      selectedOrder.value = await ordersService.getOne(id)
      isDetailOpen.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar detalle del pedido'
    }
  }

  function closeDetail() {
    isDetailOpen.value = false
    selectedOrder.value = null
    error.value = null
  }

  async function prepareOrder(id: number) {
    saving.value = true
    error.value = null
    const oldStatus = 'CREATED'
    try {
      const updated = await ordersService.prepare(id)
      updateOrderInList(updated)
      moveBoardOrder(id, oldStatus, 'PREPARING', updated)
      closeDetail()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al preparar pedido'
    } finally {
      saving.value = false
    }
  }

  async function readyOrder(id: number) {
    saving.value = true
    error.value = null
    const oldStatus = 'PREPARING'
    try {
      const updated = await ordersService.ready(id)
      updateOrderInList(updated)
      moveBoardOrder(id, oldStatus, 'READY', updated)
      closeDetail()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al marcar pedido como listo'
    } finally {
      saving.value = false
    }
  }

  async function deliverOrder(id: number) {
    saving.value = true
    error.value = null
    const oldStatus = 'READY'
    try {
      const updated = await ordersService.deliver(id)
      updateOrderInList(updated)
      moveBoardOrder(id, oldStatus, 'DELIVERED', updated)
      closeDetail()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al entregar pedido'
    } finally {
      saving.value = false
    }
  }

  function moveBoardOrder(id: number, fromStatus: string, toStatus: string, replacement: Order) {
    const fromCol = boardColumns.value[fromStatus]
    if (fromCol) {
      fromCol.items = fromCol.items.filter((o) => o.id !== id)
    }
    const toCol = boardColumns.value[toStatus]
    if (toCol) {
      toCol.items.unshift(replacement)
    }
  }

  function updateOrderInList(updated: Order) {
    const index = orders.value.findIndex((o) => o.id === updated.id)
    if (index !== -1) {
      orders.value[index] = updated
    }
    if (selectedOrder.value?.id === updated.id) {
      selectedOrder.value = updated
    }
  }

  function reset() {
    clearErrorTimer()
    orders.value = []
    formItems.value = []
    editingId.value = null
    isFormOpen.value = false
    loading.value = false
    error.value = null
    saving.value = false
    page.value = 1
    size.value = 10
    total.value = 0
    pages.value = 0
    filterParams.value = {}
    isDetailOpen.value = false
    selectedOrder.value = null
    productSearchQuery.value = ''
    productSearchResults.value = []
    productSearchLoading.value = false
    selectedProductForShelf.value = null
    shelfLocations.value = []
    shelfLocationsLoading.value = false
    customerName.value = ''
    customerEmail.value = ''
    customerPhone.value = ''
    customerDocument.value = ''
    customerAddress.value = ''
    notes.value = ''
    boardFilter.value = ''
    boardDate.value = new Date().toISOString().slice(0, 10)
    for (const s of BOARD_STATUSES) {
      boardColumns.value[s] = { items: [], page: 1, hasMore: true, loading: false }
    }
    if (searchTimer) {
      clearTimeout(searchTimer)
      searchTimer = null
    }
  }

  return {
    orders,
    formItems,
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
    isDetailOpen,
    selectedOrder,
    productSearchQuery,
    productSearchResults,
    productSearchLoading,
    selectedProductForShelf,
    shelfLocations,
    shelfLocationsLoading,
    customerName,
    customerEmail,
    customerPhone,
    customerDocument,
    customerAddress,
    notes,
    orderTotal,
    orderTaxTotal,
    canTransition,
    boardColumns,
    boardFilter,
    boardDate,
    setBoardDate,
    fetchOrders,
    setFilter,
    goToPage,
    setSize,
    openCreateForm,
    closeForm,
    onProductSearch,
    selectProductForShelf,
    addItemToOrder,
    removeFormItem,
    updateFormItemQuantity,
    createOrder,
    fetchOrderDetail,
    closeDetail,
    prepareOrder,
    readyOrder,
    deliverOrder,
    setBoardFilter,
    resetBoardColumns,
    fetchBoardColumn,
    reset,
  }
})
