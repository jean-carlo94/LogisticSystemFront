import api from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type { UserAdmin, UserAdminForm, UserRoleSimple } from '@/types/user'

export const usersService = {
  async getAll(page = 1, size = 20): Promise<PaginatedResponse<UserAdmin>> {
    return api.get('/users/', { params: { page, size } }) as Promise<PaginatedResponse<UserAdmin>>
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
}
