import api from './api'
import type { Sale, CreateSalePayload } from '@/types/sale'
import type { PaginatedResponse } from '@/types/pagination'

export const salesService = {
  async getAll(page = 1, size = 20): Promise<PaginatedResponse<Sale>> {
    return api.get('/sales', { params: { page, size } }) as Promise<PaginatedResponse<Sale>>
  },

  async getOne(id: number): Promise<Sale> {
    return api.get(`/sales/${id}`) as Promise<Sale>
  },

  async create(data: CreateSalePayload): Promise<Sale> {
    return api.post('/sales', data) as Promise<Sale>
  },
}
