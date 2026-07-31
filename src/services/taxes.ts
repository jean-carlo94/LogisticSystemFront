import api, { unwrap, buildParams } from './api'
import type { Tax, TaxForm } from '@/types/tax'
import type { PaginatedResponse } from '@/types/pagination'

export const taxesService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<Tax>> {
    return unwrap(api.get<PaginatedResponse<Tax>>('/taxes', { params: buildParams(page, size, filters) }))
  },
  async create(data: TaxForm): Promise<Tax> { return unwrap(api.post<Tax>('/taxes', data)) },
  async update(id: number, data: Partial<TaxForm> & { is_active?: boolean }): Promise<Tax> { return unwrap(api.put<Tax>(`/taxes/${id}`, data)) },
  async remove(id: number): Promise<void> { return unwrap(api.delete<void>(`/taxes/${id}`)) },
}
