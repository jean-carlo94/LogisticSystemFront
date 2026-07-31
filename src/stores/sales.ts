import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/types/product'
import type { Sale, CartItem, ProductLocation } from '@/types/sale'
import { salesService } from '@/services/sales'
import { productsService } from '@/services/products'
import { useAutoClearError } from '@/composables/useAutoClearError'

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { clearErrorTimer } = useAutoClearError(error)

  const page = ref(1)
  const size = ref(20)
  const total = ref(0)
  const pages = ref(0)

  const cart = ref<CartItem[]>([])
  const searchedProducts = ref<Product[]>([])
  const searchLoading = ref(false)
  const searchError = ref<string | null>(null)

  const { clearErrorTimer: clearSearchErrorTimer } = useAutoClearError(searchError)

  const selectedProduct = ref<Product | null>(null)
  const locations = ref<ProductLocation[]>([])
  const locationsLoading = ref(false)
  const isShelfPickerOpen = ref(false)

  const isDetailOpen = ref(false)
  const selectedSale = ref<Sale | null>(null)

  const saving = ref(false)
  const customerName = ref('')
  const customerEmail = ref('')
  const customerPhone = ref('')
  const customerDocument = ref('')
  const customerAddress = ref('')
  const notes = ref('')

  const cartTotal = computed(() => {
    return cart.value.reduce((sum, item) => {
      return sum + item.unit_price * item.quantity
    }, 0)
  })

  const cartTaxTotal = computed(() => {
    return cart.value.reduce((sum, item) => {
      const subtotal = item.unit_price * item.quantity
      const taxRate = (item.taxes ?? []).reduce((r, t) => r + t.rate, 0)
      return sum + (subtotal * taxRate) / 100
    }, 0)
  })

  async function fetchSales() {
    loading.value = true
    error.value = null

    try {
      const res = await salesService.getAll(page.value, size.value)
      sales.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar ventas'
    } finally {
      loading.value = false
    }
  }

  function goToPage(p: number) {
    page.value = p
    fetchSales()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchSales()
  }

  async function fetchSaleDetail(id: number) {
    error.value = null
    try {
      selectedSale.value = await salesService.getOne(id)
      isDetailOpen.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar detalle de venta'
    }
  }

  function closeDetail() {
    isDetailOpen.value = false
    selectedSale.value = null
    error.value = null
  }

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  async function fetchInitialProducts() {
    searchLoading.value = true
    searchError.value = null
    try {
      const res = await productsService.getAll(1, 50)
      searchedProducts.value = res.items
    } catch (e) {
      searchError.value = e instanceof Error ? e.message : 'Error al cargar productos'
    } finally {
      searchLoading.value = false
    }
  }

  async function searchProducts(query: string) {
    if (searchTimer) clearTimeout(searchTimer)

    if (!query.trim()) {
      searchedProducts.value = []
      searchError.value = null
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
        const res = await productsService.getAll(1, 50, filters)
        searchedProducts.value = res.items
      } catch (e) {
        searchError.value = e instanceof Error ? e.message : 'Error al buscar productos'
      } finally {
        searchLoading.value = false
      }
    }, 400)
  }

  function openShelfPicker(product: Product) {
    selectedProduct.value = product
    isShelfPickerOpen.value = true
    fetchLocations(product.id)
  }

  async function fetchLocations(productId: number) {
    locationsLoading.value = true
    try {
      locations.value = await productsService.getLocations(productId)
    } catch (e) {
      locations.value = []
    } finally {
      locationsLoading.value = false
    }
  }

  function closeShelfPicker() {
    isShelfPickerOpen.value = false
    selectedProduct.value = null
    locations.value = []
    error.value = null
  }

  function addToCart(shelfId: number, shelfCode: string, quantity: number) {
    if (!selectedProduct.value) return

    const existingIndex = cart.value.findIndex(
      (item) => item.product_id === selectedProduct.value!.id && item.shelf_id === shelfId
    )

    if (existingIndex !== -1) {
      cart.value[existingIndex].quantity += quantity
    } else {
      cart.value.push({
        product_id: selectedProduct.value.id,
        product_name: selectedProduct.value.name,
        shelf_id: shelfId,
        shelf_code: shelfCode,
        quantity,
        unit_price: selectedProduct.value.price,
        stock: selectedProduct.value.stock,
        taxes: selectedProduct.value.taxes ?? [],
      })
    }

    closeShelfPicker()
  }

  function addToCartDirect(product: Product) {
    if (product.stock <= 0) return

    const existingIndex = cart.value.findIndex(
      (item) => item.product_id === product.id && item.shelf_id === null
    )

    if (existingIndex !== -1) {
      cart.value[existingIndex].quantity += 1
    } else {
      cart.value.push({
        product_id: product.id,
        product_name: product.name,
        shelf_id: null,
        shelf_code: null,
        quantity: 1,
        unit_price: product.price,
        stock: product.stock,
        taxes: product.taxes ?? [],
      })
    }
  }

  function addToCartWithoutShelf(quantity: number) {
    if (!selectedProduct.value) return

    const existingIndex = cart.value.findIndex(
      (item) => item.product_id === selectedProduct.value!.id && item.shelf_id === null
    )

    if (existingIndex !== -1) {
      cart.value[existingIndex].quantity += quantity
    } else {
      cart.value.push({
        product_id: selectedProduct.value.id,
        product_name: selectedProduct.value.name,
        shelf_id: null,
        shelf_code: null,
        quantity,
        unit_price: selectedProduct.value.price,
        stock: selectedProduct.value.stock,
        taxes: selectedProduct.value.taxes ?? [],
      })
    }

    closeShelfPicker()
  }

  function removeFromCart(index: number) {
    cart.value.splice(index, 1)
  }

  function updateCartQuantity(index: number, quantity: number) {
    if (quantity <= 0) {
      cart.value.splice(index, 1)
    } else {
      cart.value[index].quantity = quantity
    }
  }

  function updateCartPrice(index: number, price: number) {
    if (price > 0) {
      cart.value[index].unit_price = price
    }
  }

  function clearCart() {
    cart.value = []
    customerName.value = ''
    customerEmail.value = ''
    customerPhone.value = ''
    customerDocument.value = ''
    customerAddress.value = ''
    notes.value = ''
  }

  async function submitSale() {
    if (cart.value.length === 0) return

    saving.value = true
    error.value = null

    try {
      await salesService.create({
        customer_name: customerName.value.trim() || 'Consumidor final',
        customer_email: customerEmail.value.trim() || undefined,
        customer_phone: customerPhone.value.trim() || undefined,
        customer_document: customerDocument.value.trim() || undefined,
        customer_address: customerAddress.value.trim() || undefined,
        notes: notes.value.trim() || undefined,
        items: cart.value.map((item) => ({
          product_id: item.product_id,
          shelf_id: item.shelf_id ?? undefined,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      })
      for (const item of cart.value) {
        const p = searchedProducts.value.find((pr) => pr.id === item.product_id)
        if (p) p.stock -= item.quantity
      }
      clearCart()
      fetchSales()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al registrar venta'
    } finally {
      saving.value = false
    }
  }

  function reset() {
    clearErrorTimer()
    clearSearchErrorTimer()
    sales.value = []
    loading.value = false
    error.value = null
    page.value = 1
    size.value = 20
    total.value = 0
    pages.value = 0
    cart.value = []
    searchedProducts.value = []
    searchLoading.value = false
    searchError.value = null
    selectedProduct.value = null
    locations.value = []
    locationsLoading.value = false
    isShelfPickerOpen.value = false
    isDetailOpen.value = false
    selectedSale.value = null
    saving.value = false
    customerName.value = ''
    customerEmail.value = ''
    customerPhone.value = ''
    customerDocument.value = ''
    customerAddress.value = ''
    notes.value = ''
    if (searchTimer) {
      clearTimeout(searchTimer)
      searchTimer = null
    }
  }

  return {
    sales,
    loading,
    error,
    page,
    size,
    total,
    pages,
    cart,
    searchedProducts,
    searchLoading,
    searchError,
    selectedProduct,
    locations,
    locationsLoading,
    isShelfPickerOpen,
    isDetailOpen,
    selectedSale,
    saving,
    customerName,
    customerEmail,
    customerPhone,
    customerDocument,
    customerAddress,
    notes,
    cartTotal,
    cartTaxTotal,
    fetchSales,
    goToPage,
    setSize,
    fetchSaleDetail,
    closeDetail,
    fetchInitialProducts,
    searchProducts,
    openShelfPicker,
    fetchLocations,
    closeShelfPicker,
    addToCart,
    addToCartDirect,
    addToCartWithoutShelf,
    removeFromCart,
    updateCartQuantity,
    updateCartPrice,
    clearCart,
    submitSale,
    reset,
  }
})
