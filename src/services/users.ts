import api from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type { UserAdmin, UserAdminForm } from '@/types/user'

export const usersService = {
  async getAll(page = 1, size = 20): Promise<PaginatedResponse<UserAdmin>> {
    return api.get('/users/', { params: { page, size } }) as Promise<PaginatedResponse<UserAdmin>>
  },

  async getById(id: number): Promise<UserAdmin> {
    return api.get(`/users/${id}`) as Promise<UserAdmin>
  },

  async update(id: number, data: UserAdminForm): Promise<UserAdmin> {
    return api.put(`/users/${id}`, data) as Promise<UserAdmin>
  },

  async remove(id: number): Promise<void> {
    return api.delete(`/users/${id}`) as Promise<void>
  },
}
