import api from './api'
import type { Category, CategoryForm } from '@/types/category'
import type { PaginatedResponse } from '@/types/pagination'

export const categoriesService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<Category>> {
    const params: Record<string, string | number> = { page, size }
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v) params[k] = v
      }
    }
    return api.get('/categories', { params }) as Promise<PaginatedResponse<Category>>
  },

  async create(data: CategoryForm): Promise<Category> {
    return api.post('/categories', data) as Promise<Category>
  },

  async update(id: number, data: CategoryForm): Promise<Category> {
    return api.put(`/categories/${id}`, data) as Promise<Category>
  },

  async remove(id: number): Promise<void> {
    return api.delete(`/categories/${id}`) as Promise<void>
  },
}
