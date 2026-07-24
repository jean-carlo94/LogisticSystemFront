import api from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type { UserAdmin, UserAdminForm, UserRoleSimple } from '@/types/user'

export const usersService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<UserAdmin>> {
    const params: Record<string, string | number> = { page, size }
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v) params[k] = v
      }
    }
    return api.get('/users/', { params }) as Promise<PaginatedResponse<UserAdmin>>
  },

  async update(id: number, data: UserAdminForm): Promise<UserAdmin> {
    return api.put(`/users/${id}`, data) as Promise<UserAdmin>
  },

  async remove(id: number): Promise<void> {
    return api.delete(`/users/${id}`) as Promise<void>
  },

  async getUserRoles(userId: number): Promise<UserRoleSimple[]> {
    return api.get(`/users/${userId}/roles`) as Promise<UserRoleSimple[]>
  },

  async assignUserRole(userId: number, roleId: number): Promise<void> {
    return api.post(`/users/${userId}/roles`, { role_id: roleId }) as Promise<void>
  },

  async uploadImage(id: number, file: File): Promise<UserAdmin> {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/users/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as Promise<UserAdmin>
  },

  async deleteImage(id: number): Promise<void> {
    return api.delete(`/users/${id}/image`) as Promise<void>
  },
}
