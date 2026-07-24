import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

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
  (response: AxiosResponse) => {
    return response.data
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/auth'
      return Promise.reject(new Error('Sesion expirada'))
    }

    const data = error.response?.data as Record<string, string> | undefined
    const message =
      data?.message || data?.detail ||
      error.message ||
      'Error de conexion'

    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message)

    return Promise.reject(new Error(message))
  },
)

export default api
