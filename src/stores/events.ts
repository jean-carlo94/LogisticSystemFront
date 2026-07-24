import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Event } from '@/types/event'
import { eventsService } from '@/services/events'

export const useEventsStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const page = ref(1)
  const size = ref(10)
  const total = ref(0)
  const pages = ref(0)
  const productFilterId = ref<number | null>(null)
  const filterParams = ref<Record<string, string>>({})

  async function fetchEvents() {
    loading.value = true
    error.value = null

    try {
      if (productFilterId.value !== null) {
        const res = await eventsService.getByProduct(productFilterId.value, page.value, size.value)
        events.value = res.items
        total.value = res.total
        pages.value = res.pages
      } else {
        const res = await eventsService.getAll(page.value, size.value, filterParams.value)
        events.value = res.items
        total.value = res.total
        pages.value = res.pages
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al cargar eventos'
    } finally {
      loading.value = false
    }
  }

  function setProductFilter(productId: number | null) {
    productFilterId.value = productId
    page.value = 1
  }

  function setFilter(filters: Record<string, string>) {
    filterParams.value = filters
    productFilterId.value = null
    page.value = 1
    fetchEvents()
  }

  function goToPage(p: number) {
    page.value = p
    fetchEvents()
  }

  function setSize(s: number) {
    size.value = s
    page.value = 1
    fetchEvents()
  }

  function reset() {
    events.value = []
    loading.value = false
    error.value = null
    page.value = 1
    total.value = 0
    pages.value = 0
    productFilterId.value = null
    filterParams.value = {}
  }

  return {
    events,
    loading,
    error,
    page,
    size,
    total,
    pages,
    filterParams,
    setProductFilter,
    setFilter,
    fetchEvents,
    goToPage,
    setSize,
    reset,
  }
})
