import api from './api'
import type { Event } from '@/types/event'
import type { PaginatedResponse } from '@/types/pagination'

export const eventsService = {
  async getAll(page = 1, size = 10, filters?: Record<string, string>): Promise<PaginatedResponse<Event>> {
    const params: Record<string, string | number> = { page, size }
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v) params[k] = v
      }
    }
    return api.get('/events/', { params }) as Promise<PaginatedResponse<Event>>
  },

  async getByProduct(productId: number, page = 1, size = 10): Promise<PaginatedResponse<Event>> {
    return api.get(`/products/${productId}/events/`, { params: { page, size } }) as Promise<PaginatedResponse<Event>>
  },
}
