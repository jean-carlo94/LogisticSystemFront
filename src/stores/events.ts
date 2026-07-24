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

  async function fetchEvents() {
    loading.value = true
    error.value = null

    try {
      const res =
        productFilterId.value !== null
          ? await eventsService.getByProduct(productFilterId.value, page.value, size.value)
          : await eventsService.getAll(page.value, size.value)

      events.value = res.items
      total.value = res.total
      pages.value = res.pages
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
  }

  return {
    events,
    loading,
    error,
    page,
    size,
    total,
    pages,
    setProductFilter,
    fetchEvents,
    goToPage,
    setSize,
    reset,
  }
})
