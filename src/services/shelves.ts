import api, { unwrap, buildParams } from './api'
import type { Shelf, ShelfDetail, ShelfForm, ShelfItem } from '@/types/shelf'
import type { PaginatedResponse } from '@/types/pagination'

export const shelvesService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<Shelf>> {
    return unwrap(api.get<PaginatedResponse<Shelf>>('/shelves', { params: buildParams(page, size, filters) }))
  },

  async getOne(id: number): Promise<ShelfDetail> {
    return unwrap(api.get<ShelfDetail>(`/shelves/${id}`))
  },

  async create(data: ShelfForm): Promise<Shelf> {
    return unwrap(api.post<Shelf>('/shelves', data))
  },

  async update(id: number, data: Partial<ShelfForm>): Promise<Shelf> {
    return unwrap(api.put<Shelf>(`/shelves/${id}`, data))
  },

  async remove(id: number): Promise<void> {
    return unwrap(api.delete<void>(`/shelves/${id}`))
  },

  async addItem(shelfId: number, data: { product_id: number; quantity: number }): Promise<ShelfItem> {
    return unwrap(api.post<ShelfItem>(`/shelves/${shelfId}/items`, data))
  },

  async updateItem(shelfId: number, itemId: number, data: { quantity: number }): Promise<ShelfItem> {
    return unwrap(api.put<ShelfItem>(`/shelves/${shelfId}/items/${itemId}`, data))
  },

  async removeItem(shelfId: number, itemId: number): Promise<void> {
    return unwrap(api.delete<void>(`/shelves/${shelfId}/items/${itemId}`))
  },
}
