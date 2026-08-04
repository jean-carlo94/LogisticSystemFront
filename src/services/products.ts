import api, { unwrap, buildParams } from './api'
import type { Product, ProductForm } from '@/types/product'
import type { ProductLocation } from '@/types/sale'
import type { PaginatedResponse } from '@/types/pagination'

export const productsService = {
  async getAll(page = 1, size = 10, filters?: Record<string, string>): Promise<PaginatedResponse<Product>> {
    return unwrap(api.get<PaginatedResponse<Product>>('/products', { params: buildParams(page, size, filters) }))
  },

  async create(data: ProductForm): Promise<Product> {
    return unwrap(api.post<Product>('/products', data))
  },

  async update(id: number, data: Partial<ProductForm>): Promise<Product> {
    return unwrap(api.put<Product>(`/products/${id}`, data))
  },

  async remove(id: number): Promise<void> {
    return unwrap(api.delete<void>(`/products/${id}`))
  },

  async getOne(id: number): Promise<Product> {
    return unwrap(api.get<Product>(`/products/${id}`))
  },

  async uploadImage(id: number, file: File): Promise<Product> {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(api.post<Product>(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }))
  },

  async deleteImage(id: number): Promise<void> {
    return unwrap(api.delete<void>(`/products/${id}/image`))
  },

  async getLocations(id: number): Promise<ProductLocation[]> {
    return unwrap(api.get<ProductLocation[]>(`/products/${id}/locations`))
  },

  async getByBarcode(barcode: string): Promise<Product> {
    return unwrap(api.get<Product>(`/products/by-barcode/${encodeURIComponent(barcode)}`))
  },

  async getQr(id: number): Promise<{
    product_id: number
    name: string
    barcode: string | null
    shelf: { code: string; aisle: string; row: number; level: number } | null
  }> {
    return unwrap(api.get(`/products/${id}/qr`))
  },
}
