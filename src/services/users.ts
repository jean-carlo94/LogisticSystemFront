import api, { unwrap, buildParams } from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type { UserAdmin, UserAdminForm, UserRole } from '@/types/user'

export const usersService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<UserAdmin>> {
    return unwrap(api.get<PaginatedResponse<UserAdmin>>('/users/', { params: buildParams(page, size, filters) }))
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
