import api from './api'
import type { Event } from '@/types/event'
import type { PaginatedResponse } from '@/types/pagination'

export const eventsService = {
  async getAll(page = 1, size = 10): Promise<PaginatedResponse<Event>> {
    return api.get('/events/', { params: { page, size } }) as Promise<PaginatedResponse<Event>>
  },

  async getById(id: number): Promise<Event> {
    return api.get(`/events/${id}`) as Promise<Event>
  },

  async getByProduct(productId: number, page = 1, size = 10): Promise<PaginatedResponse<Event>> {
    return api.get(`/products/${productId}/events/`, { params: { page, size } }) as Promise<PaginatedResponse<Event>>
  },
}
