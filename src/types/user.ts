import type { UserBase, UserRole } from './auth'

export interface UserAdmin extends UserBase {}

export interface UserAdminForm {
  email?: string
  password?: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
  country?: string
  is_active?: boolean
}

export type { UserRole }
