import api, { unwrap, buildParams } from './api'
import type { Event } from '@/types/event'
import type { PaginatedResponse } from '@/types/pagination'

export const eventsService = {
  async getAll(page = 1, size = 10, filters?: Record<string, string>): Promise<PaginatedResponse<Event>> {
    return unwrap(api.get<PaginatedResponse<Event>>('/events/', { params: buildParams(page, size, filters) }))
  },

  async getByProduct(productId: number, page = 1, size = 10): Promise<PaginatedResponse<Event>> {
    return unwrap(api.get<PaginatedResponse<Event>>(`/products/${productId}/events/`, { params: { page, size } }))
  },
}
