import api, { unwrap, buildParams } from './api'
import type { Order, CreateOrderPayload } from '@/types/order'
import type { PaginatedResponse } from '@/types/pagination'

export const ordersService = {
  async getAll(page = 1, size = 10, filters?: Record<string, string>): Promise<PaginatedResponse<Order>> {
    return unwrap(api.get<PaginatedResponse<Order>>('/orders', { params: buildParams(page, size, filters) }))
  },

  async getOne(id: number): Promise<Order> {
    return unwrap(api.get<Order>(`/orders/${id}`))
  },

  async create(data: CreateOrderPayload): Promise<Order> {
    return unwrap(api.post<Order>('/orders', data))
  },

  async prepare(id: number): Promise<Order> {
    return unwrap(api.post<Order>(`/orders/${id}/prepare`))
  },

  async ready(id: number): Promise<Order> {
    return unwrap(api.post<Order>(`/orders/${id}/ready`))
  },

  async deliver(id: number): Promise<Order> {
    return unwrap(api.post<Order>(`/orders/${id}/deliver`))
  },
}
