import api, { unwrap } from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type { UserAdmin, UserAdminForm, UserRole } from '@/types/user'

export const usersService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<UserAdmin>> {
    const params: Record<string, string | number> = { page, size }
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v) params[k] = v
      }
    }
    return unwrap(api.get<PaginatedResponse<UserAdmin>>('/users/', { params }))
  },

  async update(id: number, data: UserAdminForm): Promise<UserAdmin> {
    return unwrap(api.put<UserAdmin>(`/users/${id}`, data))
  },

  async remove(id: number): Promise<void> {
    return unwrap(api.delete<void>(`/users/${id}`))
  },

  async getUserRoles(userId: number): Promise<UserRole[]> {
    return unwrap(api.get<UserRole[]>(`/users/${userId}/roles`))
  },

  async assignUserRole(userId: number, roleId: number): Promise<void> {
    return unwrap(api.post<void>(`/users/${userId}/roles`, { role_id: roleId }))
  },

  async uploadImage(id: number, file: File): Promise<UserAdmin> {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(api.post<UserAdmin>(`/users/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }))
  },

  async deleteImage(id: number): Promise<void> {
    return unwrap(api.delete<void>(`/users/${id}/image`))
  },
}
