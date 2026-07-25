import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Shelf, ShelfDetail, ShelfForm } from '@/types/shelf'
import { createEmptyShelf } from '@/types/shelf'
import type { Product } from '@/types/product'
import { shelvesService } from '@/services/shelves'
import { productsService } from '@/services/products'

export const useShelvesStore = defineStore('shelves', () => {
  const shelves = ref<Shelf[]>([])
  const details = ref<Map<number, ShelfDetail>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  const page = ref(1)
  const size = ref(20)
  const total = ref(0)
  const pages = ref(0)
  const filterParams = ref<Record<string, string>>({})
  const filterProduct = ref('')

  const filteredShelves = computed(() => {
    const q = filterProduct.value.toLowerCase().trim()
    if (!q) return shelves.value
    return shelves.value.filter((shelf) => {
      const detail = details.value.get(shelf.id)
      if (!detail) return false
      return detail.items.some((item) => item.product_name.toLowerCase().includes(q))
    })
  })

  const form = ref<ShelfForm>(createEmptyShelf())
  const editingId = ref<number | null>(null)
  const isFormOpen = ref(false)

  const selectedShelf = ref<ShelfDetail | null>(null)
  const isDetailOpen = ref(false)

  const isPaletteOpen = ref(false)
  const paletteProducts = ref<Product[]>([])
  const paletteLoading = ref(false)
  const paletteError = ref<string | null>(null)

  const dropFeedback = ref<string | null>(null)

  const isEditing = computed(() => editingId.value !== null)

  async function fetchShelves() {
    loading.value = true
    error.value = null

    try {
      const res = await shelvesService.getAll(page.value, size.value, filterParams.value)
      shelves.value = res.items
      total.value = res.total
      pages.value = res.pages

      details.value = new Map()
      if (res.items.length > 0) {
        const results = await Promise.allSettled(
          res.items.map((s) => shelvesService.getOne(s.id)),
        )
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            details.value.set(res.items[i].id, r.value)
          }
        })
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar estanterías'
    } finally {
      loading.value = false
    }
  }

  function goToPage(p: number) {
    page.value = p
    fetchShelves()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchShelves()
  }

  function setFilter(filters: Record<string, string>) {
    filterParams.value = filters
    page.value = 1
    fetchShelves()
  }

  function setProductFilter(q: string) {
    filterProduct.value = q
  }

  function openCreateForm() {
    form.value = createEmptyShelf()
    editingId.value = null
    isFormOpen.value = true
  }

  function openEditForm(shelf: Shelf) {
    form.value = {
      name: shelf.name,
      code: shelf.code,
      aisle: shelf.aisle,
      row: shelf.row,
      level: shelf.level,
      max_weight_kg: shelf.max_weight_kg,
      width_cm: shelf.width_cm,
      height_cm: shelf.height_cm,
      depth_cm: shelf.depth_cm,
    }
    editingId.value = shelf.id
    isFormOpen.value = true
  }

  function closeForm() {
    isFormOpen.value = false
    error.value = null
  }

  async function saveShelf() {
    if (!form.value.name.trim() || !form.value.code.trim()) return

    saving.value = true
    error.value = null

    try {
      if (editingId.value !== null) {
        const updated = await shelvesService.update(editingId.value, form.value)
        const index = shelves.value.findIndex((s) => s.id === editingId.value)
        if (index !== -1) {
          shelves.value[index] = { ...shelves.value[index], ...updated }
        }
      } else {
        await shelvesService.create(form.value)
      }
      closeForm()
      fetchShelves()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar estantería'
    } finally {
      saving.value = false
    }
  }

  async function deleteShelf(id: number) {
    loading.value = true
    error.value = null

    try {
      await shelvesService.remove(id)
      if (editingId.value === id) closeForm()
      if (shelves.value.length === 1 && page.value > 1) page.value--
      fetchShelves()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar estantería'
    } finally {
      loading.value = false
    }
  }

  function openDetail(shelfId: number) {
    const detail = details.value.get(shelfId)
    if (detail) {
      selectedShelf.value = detail
      isDetailOpen.value = true
    }
  }

  function closeDetail() {
    isDetailOpen.value = false
    selectedShelf.value = null
    error.value = null
  }

  async function refreshDetail(shelfId: number) {
    try {
      const detail = await shelvesService.getOne(shelfId)
      details.value.set(shelfId, detail)
      if (selectedShelf.value?.id === shelfId) {
        selectedShelf.value = detail
      }
    } catch {
      /* fail silently */
    }
  }

  async function addItemToShelf(shelfId: number, productId: number, productName: string, quantity = 1) {
    dropFeedback.value = null

    try {
      await shelvesService.addItem(shelfId, { product_id: productId, quantity })
      dropFeedback.value = `${productName} ×${quantity} asignado`
      await refreshDetail(shelfId)
      setTimeout(() => {
        if (dropFeedback.value === `${productName} ×${quantity} asignado`) {
          dropFeedback.value = null
        }
      }, 2500)
    } catch (e) {
      dropFeedback.value = e instanceof Error ? e.message : 'Error al asignar producto'
    }
  }

  async function updateItemQuantity(shelfId: number, itemId: number, quantity: number) {
    error.value = null

    try {
      if (quantity <= 0) {
        await shelvesService.removeItem(shelfId, itemId)
      } else {
        await shelvesService.updateItem(shelfId, itemId, { quantity })
      }
      await refreshDetail(shelfId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al actualizar cantidad'
    }
  }

  async function removeItem(shelfId: number, itemId: number) {
    error.value = null

    try {
      await shelvesService.removeItem(shelfId, itemId)
      await refreshDetail(shelfId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al remover producto'
    }
  }

  async function fetchPaletteProducts() {
    paletteLoading.value = true
    paletteError.value = null

    try {
      const res = await productsService.getAll(1, 100)
      paletteProducts.value = res.items
    } catch (e) {
      paletteError.value = e instanceof Error ? e.message : 'Error al cargar productos'
    } finally {
      paletteLoading.value = false
    }
  }

  function togglePalette() {
    isPaletteOpen.value = !isPaletteOpen.value
    if (isPaletteOpen.value && paletteProducts.value.length === 0) {
      fetchPaletteProducts()
    }
  }

  function getProductShelves(productId: number) {
    const result: { shelfId: number; code: string; name: string; quantity: number }[] = []
    for (const detail of details.value.values()) {
      for (const item of detail.items) {
        if (item.product_id === productId) {
          result.push({
            shelfId: detail.id,
            code: detail.code,
            name: detail.name,
            quantity: item.quantity,
          })
        }
      }
    }
    return result
  }

  function reset() {
    shelves.value = []
    details.value = new Map()
    loading.value = false
    error.value = null
    saving.value = false
    page.value = 1
    total.value = 0
    pages.value = 0
    filterParams.value = {}
    filterProduct.value = ''
    form.value = createEmptyShelf()
    editingId.value = null
    isFormOpen.value = false
    selectedShelf.value = null
    isDetailOpen.value = false
    isPaletteOpen.value = false
    paletteProducts.value = []
    paletteLoading.value = false
    paletteError.value = null
    dropFeedback.value = null
  }

  return {
    shelves,
    details,
    loading,
    error,
    saving,
    page,
    size,
    total,
    pages,
    filterParams,
    filterProduct,
    filteredShelves,
    form,
    editingId,
    isFormOpen,
    selectedShelf,
    isDetailOpen,
    isPaletteOpen,
    paletteProducts,
    paletteLoading,
    paletteError,
    dropFeedback,
    isEditing,
    fetchShelves,
    setFilter,
    setProductFilter,
    goToPage,
    setSize,
    openCreateForm,
    openEditForm,
    closeForm,
    saveShelf,
    deleteShelf,
    openDetail,
    closeDetail,
    addItemToShelf,
    updateItemQuantity,
    removeItem,
    fetchPaletteProducts,
    togglePalette,
    getProductShelves,
    reset,
  }
})
