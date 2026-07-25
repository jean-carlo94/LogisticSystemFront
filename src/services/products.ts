import api from './api'
import type { Product, ProductForm } from '@/types/product'
import type { ProductLocation } from '@/types/sale'
import type { PaginatedResponse } from '@/types/pagination'

export const productsService = {
  async getAll(page = 1, size = 10, filters?: Record<string, string>): Promise<PaginatedResponse<Product>> {
    const params: Record<string, string | number> = { page, size }
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v) params[k] = v
      }
    }
    return api.get('/products', { params }) as Promise<PaginatedResponse<Product>>
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

  async getOne(id: number): Promise<Product> {
    return api.get(`/products/${id}`) as Promise<Product>
  },

  async uploadImage(id: number, file: File): Promise<Product> {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as Promise<Product>
  },

  async deleteImage(id: number): Promise<void> {
    return api.delete(`/products/${id}/image`) as Promise<void>
  },

  async getLocations(id: number): Promise<ProductLocation[]> {
    return api.get(`/products/${id}/locations`) as Promise<ProductLocation[]>
  },
}
