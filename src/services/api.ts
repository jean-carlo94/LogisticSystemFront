import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import router from '@/router'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      router.push('/auth')
      return Promise.reject(new Error('Sesion expirada'))
    }

    const data = error.response?.data as Record<string, string> | undefined
    const message =
      data?.detail || data?.message ||
      error.message ||
      'Error de conexion'

    if (import.meta.env.DEV) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message)
    }

    return Promise.reject(new Error(message))
  },
)

export function unwrap<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
  return promise.then((r) => r.data)
}

export function buildParams(page: number, size: number, filters?: Record<string, string>): Record<string, string | number> {
  const params: Record<string, string | number> = { page, size }
  if (filters) {
    for (const [k, v] of Object.entries(filters)) {
      if (v) params[k] = v
    }
  }
  return params
}

export default api
