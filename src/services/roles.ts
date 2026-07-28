import api, { unwrap } from './api'
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
    return unwrap(api.get<PaginatedResponse<Role>>('/roles/', { params }))
  },

  async create(data: RoleForm): Promise<Role> {
    return unwrap(api.post<Role>('/roles/', data))
  },

  async update(id: number, data: Partial<RoleForm>): Promise<Role> {
    return unwrap(api.put<Role>(`/roles/${id}`, data))
  },

  async remove(id: number): Promise<void> {
    return unwrap(api.delete<void>(`/roles/${id}`))
  },

  async getPermissions(): Promise<Permission[]> {
    return unwrap(api.get<Permission[]>('/roles/permissions/'))
  },

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    return unwrap(api.get<Permission[]>(`/roles/${roleId}/permissions`))
  },

  async setRolePermissions(roleId: number, data: AssignPermissionsPayload): Promise<void> {
    return unwrap(api.post<void>(`/roles/${roleId}/permissions`, data))
  },
}
