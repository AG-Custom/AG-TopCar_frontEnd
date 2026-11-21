import axios from 'axios'
import { authStorage } from '../utils/auth-storage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5231',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = authStorage.token()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 &&
      !error.config?.url?.startsWith('/api/autenticacao/')) {
    authStorage.clear()
    if (window.location.pathname.startsWith('/administracao') && window.location.pathname !== '/administracao/entrar') {
      window.location.assign(`/administracao/entrar?redirecionar=${encodeURIComponent(window.location.pathname + window.location.search)}`)
    }
  }
  return Promise.reject(error)
})
