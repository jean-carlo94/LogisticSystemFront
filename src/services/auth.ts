import api, { unwrap } from './api'
import type { LoginPayload, RegisterPayload, AuthResponse, User, ProfileUpdate, ForgotPasswordPayload, ResetPasswordPayload, MessageResponse } from '@/types/auth'

export const authService = {
  async register(payload: RegisterPayload): Promise<void> {
    return unwrap(api.post<void>('/auth/register', payload))
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return unwrap(api.post<AuthResponse>('/auth/login', payload))
  },

  async getMe(): Promise<User> {
    return unwrap(api.get<User>('/auth/me'))
  },

  async updateMe(data: ProfileUpdate): Promise<User> {
    return unwrap(api.put<User>('/auth/me', data))
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(api.post<User>('/auth/me/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }))
  },

  async deleteAvatar(): Promise<void> {
    return unwrap(api.delete<void>('/auth/me/image'))
  },

  async activate(token: string): Promise<MessageResponse> {
    return unwrap(api.get<MessageResponse>('/auth/activate', { params: { token } }))
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<MessageResponse> {
    return unwrap(api.post<MessageResponse>('/auth/forgot-password', payload))
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
    return unwrap(api.post<MessageResponse>('/auth/reset-password', payload))
  },

  async pinLogin(email: string, pin: string): Promise<AuthResponse> {
    return unwrap(api.post<AuthResponse>('/auth/pin-login', { email, pin }))
  },
}
