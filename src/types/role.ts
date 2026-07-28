export type PermissionCode =
  | 'products_create'
  | 'products_read'
  | 'products_update'
  | 'products_delete'
  | 'events_read'
  | 'roles_manage'
  | 'users_manage'

export interface Permission {
  id: number
  code: PermissionCode
  description: string
}

export interface Role {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface RoleForm {
  name: string
  description: string
}

export interface AssignPermissionsPayload {
  permission_ids: number[]
}
