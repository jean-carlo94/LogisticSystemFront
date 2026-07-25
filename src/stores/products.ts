import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, ProductForm } from '@/types/product'
import { createEmptyProduct } from '@/types/product'
import { productsService } from '@/services/products'
import { useAutoClearError } from '@/composables/useAutoClearError'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const form = ref<ProductForm>(createEmptyProduct())
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

  const isEditing = computed(() => editingId.value !== null)

  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      const res = await productsService.getAll(page.value, size.value, filterParams.value)
      products.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar productos'
    } finally {
      loading.value = false
    }
  }

  function setFilter(filters: Record<string, string>) {
    filterParams.value = filters
    page.value = 1
    fetchProducts()
  }

  function goToPage(p: number) {
    page.value = p
    fetchProducts()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchProducts()
  }

  function openCreateForm() {
    form.value = createEmptyProduct()
    editingId.value = null
    isFormOpen.value = true
  }

  function openEditForm(product: Product) {
    form.value = {
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      stock: product.stock,
      state: product.state,
      barcode: product.barcode ?? '',
      weight_kg: product.weight_kg,
      width_cm: product.width_cm,
      height_cm: product.height_cm,
      depth_cm: product.depth_cm,
    }
    editingId.value = product.id
    isFormOpen.value = true
  }

  async function editById(id: number) {
    error.value = null
    try {
      const product = await productsService.getOne(id)
      openEditForm(product)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar producto'
    }
  }

  function closeForm() {
    isFormOpen.value = false
    error.value = null
  }

  async function saveProduct(image?: File | null) {
    if (!form.value.name.trim()) return

    saving.value = true
    error.value = null

    try {
      let productId: number

      if (editingId.value !== null) {
        const updated = await productsService.update(editingId.value, form.value)
        const index = products.value.findIndex((p) => p.id === editingId.value)
        if (index !== -1) {
          products.value[index] = updated
        }
        productId = editingId.value
        closeForm()
      } else {
        const created = await productsService.create(form.value)
        editingId.value = created.id
        productId = created.id
      }

      if (image) {
        const updated = await productsService.uploadImage(productId, image)
        const index = products.value.findIndex((p) => p.id === productId)
        if (index !== -1) {
          products.value[index] = updated
        }
      }

      fetchProducts()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar producto'
    } finally {
      saving.value = false
    }
  }

  async function uploadProductImage(id: number, file: File) {
    saving.value = true
    error.value = null
    try {
      const updated = await productsService.uploadImage(id, file)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = updated
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al subir imagen'
    } finally {
      saving.value = false
    }
  }

  async function deleteProductImage(id: number) {
    saving.value = true
    error.value = null
    try {
      await productsService.deleteImage(id)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = { ...products.value[index], image_path: null, image_url: null }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar imagen'
    } finally {
      saving.value = false
    }
  }

  async function deleteProduct(id: number) {
    loading.value = true
    error.value = null

    try {
      await productsService.remove(id)
      if (editingId.value === id) closeForm()

      if (products.value.length === 1 && page.value > 1) {
        page.value--
      }
      fetchProducts()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar producto'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    clearErrorTimer()
    products.value = []
    form.value = createEmptyProduct()
    editingId.value = null
    isFormOpen.value = false
    loading.value = false
    error.value = null
    saving.value = false
    page.value = 1
    total.value = 0
    pages.value = 0
    filterParams.value = {}
  }

  return {
    products,
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
    fetchProducts,
    setFilter,
    goToPage,
    setSize,
    openCreateForm,
    openEditForm,
    editById,
    closeForm,
    saveProduct,
    deleteProduct,
    uploadProductImage,
    deleteProductImage,
    reset,
  }
})
