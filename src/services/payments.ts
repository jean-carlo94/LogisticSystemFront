import api, { unwrap, buildParams } from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type { Payment, CreatePaymentPayload } from '@/types/payment'

export const paymentsService = {
  async getAll(page = 1, size = 20, filters: Record<string, string> = {}): Promise<PaginatedResponse<Payment>> {
    return unwrap(api.get<PaginatedResponse<Payment>>('/payments', { params: buildParams(page, size, filters) }))
  },

  async create(data: CreatePaymentPayload): Promise<Payment> {
    return unwrap(api.post<Payment>('/payments', data))
  },

  async getBySale(saleId: number): Promise<Payment[]> {
    return unwrap(api.get<Payment[]>(`/payments/by-sale/${saleId}`))
  },
}
