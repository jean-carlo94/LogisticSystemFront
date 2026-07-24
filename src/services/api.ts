import axios from 'axios'
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error: AxiosError) => {
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Error de conexion'

    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, message)

    return Promise.reject(new Error(message))
  },
)

export default api
