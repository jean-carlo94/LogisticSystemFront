import api from './api'
import type { Shelf, ShelfDetail, ShelfForm, ShelfItem } from '@/types/shelf'
import type { PaginatedResponse } from '@/types/pagination'

export const shelvesService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<Shelf>> {
    const params: Record<string, string | number> = { page, size }
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v) params[k] = v
      }
    }
    return api.get('/shelves', { params }) as Promise<PaginatedResponse<Shelf>>
  },

  async getOne(id: number): Promise<ShelfDetail> {
    return api.get(`/shelves/${id}`) as Promise<ShelfDetail>
  },

  async create(data: ShelfForm): Promise<Shelf> {
    return api.post('/shelves', data) as Promise<Shelf>
  },

  async update(id: number, data: Partial<ShelfForm>): Promise<Shelf> {
    return api.put(`/shelves/${id}`, data) as Promise<Shelf>
  },

  async remove(id: number): Promise<void> {
    return api.delete(`/shelves/${id}`) as Promise<void>
  },

  async addItem(shelfId: number, data: { product_id: number; quantity: number }): Promise<ShelfItem> {
    return api.post(`/shelves/${shelfId}/items`, data) as Promise<ShelfItem>
  },

  async updateItem(shelfId: number, itemId: number, data: { quantity: number }): Promise<ShelfItem> {
    return api.put(`/shelves/${shelfId}/items/${itemId}`, data) as Promise<ShelfItem>
  },

  async removeItem(shelfId: number, itemId: number): Promise<void> {
    return api.delete(`/shelves/${shelfId}/items/${itemId}`) as Promise<void>
  },
}
