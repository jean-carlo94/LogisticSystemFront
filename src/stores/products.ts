import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, ProductForm } from '@/types/product'
import { createEmptyProduct } from '@/types/product'
import { productsService } from '@/services/products'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const form = ref<ProductForm>(createEmptyProduct())
  const editingId = ref<number | null>(null)
  const isFormOpen = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const saving = ref(false)

  const page = ref(1)
  const size = ref(10)
  const total = ref(0)
  const pages = ref(0)

  const isEditing = computed(() => editingId.value !== null)
  const productCount = computed(() => total.value)

  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      const res = await productsService.getAll(page.value, size.value)
      products.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar productos'
    } finally {
      loading.value = false
    }
  }

  function goToPage(p: number) {
    page.value = p
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
    }
    editingId.value = product.id
    isFormOpen.value = true
  }

  function closeForm() {
    isFormOpen.value = false
  }

  async function saveProduct() {
    if (!form.value.name.trim()) return

    saving.value = true
    error.value = null

    try {
      if (editingId.value !== null) {
        const updated = await productsService.update(editingId.value, form.value)
        const index = products.value.findIndex((p) => p.id === editingId.value)
        if (index !== -1) {
          products.value[index] = updated
        }
      } else {
        await productsService.create(form.value)
      }

      closeForm()
      fetchProducts()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar producto'
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
    isEditing,
    productCount,
    fetchProducts,
    goToPage,
    openCreateForm,
    openEditForm,
    closeForm,
    saveProduct,
    deleteProduct,
  }
})
