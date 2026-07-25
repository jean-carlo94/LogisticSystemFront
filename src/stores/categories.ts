import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Category, CategoryForm } from '@/types/category'
import { createEmptyCategory } from '@/types/category'
import { categoriesService } from '@/services/categories'
import { useAutoClearError } from '@/composables/useAutoClearError'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const form = ref<CategoryForm>(createEmptyCategory())
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

  async function fetchCategories() {
    loading.value = true
    error.value = null

    try {
      const res = await categoriesService.getAll(page.value, size.value, filterParams.value)
      categories.value = res.items
      total.value = res.total
      pages.value = res.pages
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar categorías'
    } finally {
      loading.value = false
    }
  }

  function setFilter(filters: Record<string, string>) {
    filterParams.value = filters
    page.value = 1
    fetchCategories()
  }

  function goToPage(p: number) {
    page.value = p
    fetchCategories()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchCategories()
  }

  function openCreateForm() {
    form.value = createEmptyCategory()
    editingId.value = null
    isFormOpen.value = true
  }

  function openEditForm(category: Category) {
    form.value = {
      name: category.name,
      description: category.description ?? '',
    }
    editingId.value = category.id
    isFormOpen.value = true
  }

  function closeForm() {
    isFormOpen.value = false
    error.value = null
  }

  async function saveCategory() {
    if (!form.value.name.trim()) return

    saving.value = true
    error.value = null

    try {
      if (editingId.value !== null) {
        await categoriesService.update(editingId.value, form.value)
      } else {
        await categoriesService.create(form.value)
      }
      closeForm()
      fetchCategories()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al guardar categoría'
    } finally {
      saving.value = false
    }
  }

  async function deleteCategory(id: number) {
    loading.value = true
    error.value = null

    try {
      await categoriesService.remove(id)
      if (editingId.value === id) closeForm()

      if (categories.value.length === 1 && page.value > 1) {
        page.value--
      }
      fetchCategories()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar categoría'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    clearErrorTimer()
    categories.value = []
    form.value = createEmptyCategory()
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
    categories,
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
    fetchCategories,
    setFilter,
    goToPage,
    setSize,
    openCreateForm,
    openEditForm,
    closeForm,
    saveCategory,
    deleteCategory,
    reset,
  }
})
