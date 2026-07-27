import api from './api'
import type { LoginPayload, RegisterPayload, AuthResponse, User, ProfileUpdate, ForgotPasswordPayload, ResetPasswordPayload, MessageResponse } from '@/types/auth'

export const authService = {
  async register(payload: RegisterPayload): Promise<void> {
    return api.post('/auth/register', payload) as Promise<void>
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return api.post('/auth/login', payload) as Promise<AuthResponse>
  },

  async getMe(): Promise<User> {
    return api.get('/auth/me') as Promise<User>
  },

  async updateMe(data: ProfileUpdate): Promise<User> {
    return api.put('/auth/me', data) as Promise<User>
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/auth/me/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as Promise<User>
  },

  async deleteAvatar(): Promise<void> {
    return api.delete('/auth/me/image') as Promise<void>
  },

  async activate(token: string): Promise<MessageResponse> {
    return api.get('/auth/activate', { params: { token } }) as Promise<MessageResponse>
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<MessageResponse> {
    return api.post('/auth/forgot-password', payload) as Promise<MessageResponse>
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<MessageResponse> {
    return api.post('/auth/reset-password', payload) as Promise<MessageResponse>
  },
}
