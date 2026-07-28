import type { UserRole } from './auth'

export interface UserAdmin {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  city: string | null
  country: string | null
  is_active: boolean
  is_super_admin: boolean
  image_path: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

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

export { type UserRole }
