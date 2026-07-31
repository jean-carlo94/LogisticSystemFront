import api, { unwrap, buildParams } from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type { Tenant, TenantForm, TenantUpdateForm } from '@/types/tenant'

export const tenantsService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<Tenant>> {
    return unwrap(api.get<PaginatedResponse<Tenant>>('/tenants/', { params: buildParams(page, size, filters) }))
  },

  async getOne(id: number): Promise<Tenant> {
    return unwrap(api.get<Tenant>(`/tenants/${id}`))
  },

  async create(data: TenantForm): Promise<Tenant> {
    return unwrap(api.post<Tenant>('/tenants/', data))
  },

  async update(id: number, data: TenantUpdateForm): Promise<Tenant> {
    return unwrap(api.put<Tenant>(`/tenants/${id}`, data))
  },

  async remove(id: number): Promise<void> {
    return unwrap(api.delete<void>(`/tenants/${id}`))
  },
}
