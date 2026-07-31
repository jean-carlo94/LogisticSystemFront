import api, { unwrap, buildParams } from './api'
import type { Customer } from '@/types/customer'
import type { PaginatedResponse } from '@/types/pagination'

export const customersService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<Customer>> {
    return unwrap(api.get<PaginatedResponse<Customer>>('/customers', { params: buildParams(page, size, filters) }))
  },
}
