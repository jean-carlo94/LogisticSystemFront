import api, { unwrap } from './api'
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
    return unwrap(api.get<PaginatedResponse<Category>>('/categories', { params }))
  },

  async create(data: CategoryForm): Promise<Category> {
    return unwrap(api.post<Category>('/categories', data))
  },

  async update(id: number, data: Partial<CategoryForm>): Promise<Category> {
    return unwrap(api.put<Category>(`/categories/${id}`, data))
  },

  async remove(id: number): Promise<void> {
    return unwrap(api.delete<void>(`/categories/${id}`))
  },
}
