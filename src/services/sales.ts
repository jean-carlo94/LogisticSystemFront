import api, { unwrap } from './api'
import type { Sale, CreateSalePayload } from '@/types/sale'
import type { PaginatedResponse } from '@/types/pagination'
import type { SaleReceipt } from '@/types/payment'

export const salesService = {
  async getAll(page = 1, size = 20): Promise<PaginatedResponse<Sale>> {
    return unwrap(api.get<PaginatedResponse<Sale>>('/sales', { params: { page, size } }))
  },

  async getOne(id: number): Promise<Sale> {
    return unwrap(api.get<Sale>(`/sales/${id}`))
  },

  async create(data: CreateSalePayload): Promise<Sale> {
    return unwrap(api.post<Sale>('/sales', data))
  },

  async cancel(id: number): Promise<{ id: number; status: string; payment_status: string; message: string }> {
    return unwrap(api.post(`/sales/${id}/cancel`))
  },

  async receipt(id: number): Promise<SaleReceipt> {
    return unwrap(api.get<SaleReceipt>(`/sales/${id}/receipt`))
  },
}
