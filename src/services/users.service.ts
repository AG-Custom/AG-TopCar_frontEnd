import { api } from '../boot/axios'
import type { User } from '../types/entidades/user'

export interface UserInput {
  name: string
  email: string
  whatsApp: string | null
  role: 'Administrador' | 'Vendedor'
  isActive: boolean
  password: string | null
}

export const usersService = {
  async roles(): Promise<Array<{ value: 'Administrador' | 'Vendedor'; label: string }>> {
    const { data } = await api.get<Array<{ value: 'Administrador' | 'Vendedor'; label: string }>>('/api/administracao/usuarios/perfis')
    return data
  },
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>('/api/administracao/usuarios')
    return data
  },
  async create(input: UserInput): Promise<User> {
    const { data } = await api.post<User>('/api/administracao/usuarios', input)
    return data
  },
  async update(id: string, input: UserInput): Promise<User> {
    const { data } = await api.put<User>(`/api/administracao/usuarios/${id}`, input)
    return data
  },
  async setActive(id: string, active: boolean): Promise<void> {
    await api.post(`/api/administracao/usuarios/${id}/${active ? 'ativar' : 'desativar'}`)
  },
}
