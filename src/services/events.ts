import api, { unwrap } from './api'
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
    return unwrap(api.get<PaginatedResponse<Event>>('/events/', { params }))
  },

  async getByProduct(productId: number, page = 1, size = 10): Promise<PaginatedResponse<Event>> {
    return unwrap(api.get<PaginatedResponse<Event>>(`/products/${productId}/events/`, { params: { page, size } }))
  },
}
