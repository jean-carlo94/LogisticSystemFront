import api from './api'
import type { Product, ProductForm } from '@/types/product'
import type { PaginatedResponse } from '@/types/pagination'

export const productsService = {
  async getAll(page = 1, size = 10): Promise<PaginatedResponse<Product>> {
    return api.get('/products', { params: { page, size } }) as Promise<PaginatedResponse<Product>>
  },

  async getById(id: number): Promise<Product> {
    return api.get(`/products/${id}`) as Promise<Product>
  },

  async create(data: ProductForm): Promise<Product> {
    return api.post('/products', data) as Promise<Product>
  },

  async update(id: number, data: ProductForm): Promise<Product> {
    return api.put(`/products/${id}`, data) as Promise<Product>
  },

  async remove(id: number): Promise<void> {
    return api.delete(`/products/${id}`) as Promise<void>
  },
}
