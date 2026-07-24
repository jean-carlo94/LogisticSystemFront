export interface Permission {
  id: number
  code: string
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

export interface AssignRolePayload {
  user_id: number
  role_id: number
}

export interface AssignPermissionsPayload {
  permission_ids: number[]
}
