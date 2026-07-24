import api from './api'
import type { PaginatedResponse } from '@/types/pagination'
import type { Role, RoleForm, Permission, AssignPermissionsPayload } from '@/types/role'

export const rolesService = {
  async getAll(page = 1, size = 20, filters?: Record<string, string>): Promise<PaginatedResponse<Role>> {
    const params: Record<string, string | number> = { page, size }
    if (filters) {
      for (const [k, v] of Object.entries(filters)) {
        if (v) params[k] = v
      }
    }
    return api.get('/roles/', { params }) as Promise<PaginatedResponse<Role>>
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
