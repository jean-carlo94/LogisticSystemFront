import api from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type { Role, RoleForm, Permission, AssignPermissionsPayload } from '@/types/role'

export const rolesService = {
  async getAll(page = 1, size = 20): Promise<PaginatedResponse<Role>> {
    return api.get('/roles/', { params: { page, size } }) as Promise<PaginatedResponse<Role>>
  },

  async create(data: RoleForm): Promise<Role> {
    return api.post('/roles/', data) as Promise<Role>
  },

  async update(id: number, data: RoleForm): Promise<Role> {
    return api.put(`/roles/${id}`, data) as Promise<Role>
  },

  async remove(id: number): Promise<void> {
    return api.delete(`/roles/${id}`) as Promise<void>
  },

  async getPermissions(): Promise<Permission[]> {
    return api.get('/roles/permissions/') as Promise<Permission[]>
  },

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return api.get(`/roles/${roleId}/permissions`) as Promise<Permission[]>
  },

  async setRolePermissions(roleId: number, data: AssignPermissionsPayload): Promise<void> {
    return api.post(`/roles/${roleId}/permissions`, data) as Promise<void>
  },
}
