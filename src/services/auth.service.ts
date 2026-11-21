import { api } from '../boot/axios'
import type { ApiResponse, LoginInput, LoginResponse, User } from '../types/entidades/user'

export const authService = {
  async login(input: LoginInput): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>('/api/autenticacao/entrar', input)
    return data.data
  },
  async me(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/api/autenticacao/perfil')
    return data.data
  },
  async logout(): Promise<void> {
    await api.post('/api/autenticacao/sair')
  },
}
