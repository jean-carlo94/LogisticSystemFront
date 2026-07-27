export interface User {
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
  roles: UserRole[]
  permissions: string[]
}

export interface UserRole {
  id: number
  name: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
  country?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface ProfileUpdate {
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
  country?: string
  password?: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  new_password: string
}

export interface MessageResponse {
  message: string
}
