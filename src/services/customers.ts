import api, { unwrap, buildParams } from './api'
import type { Customer, CustomerForm } from '@/types/customer'
import type { PaginatedResponse } from '@/types/pagination'

export const customersService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<Customer>> {
    return unwrap(api.get<PaginatedResponse<Customer>>('/customers', { params: buildParams(page, size, filters) }))
  },

  async getOne(id: number): Promise<Customer> {
    return unwrap(api.get<Customer>(`/customers/${id}`))
  },

  async create(data: CustomerForm): Promise<Customer> {
    return unwrap(api.post<Customer>('/customers', data))
  },

  async update(id: number, data: Partial<CustomerForm>): Promise<Customer> {
    return unwrap(api.put<Customer>(`/customers/${id}`, data))
  },
}
