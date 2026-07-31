export interface Tenant {
  id: number
  name: string
  slug: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TenantForm {
  name: string
  slug: string
  admin_email?: string
  admin_password?: string
}

export interface TenantUpdateForm {
  name?: string
  is_active?: boolean
}
