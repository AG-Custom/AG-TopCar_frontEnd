export type UserRole = 'Administrador' | 'Vendedor'
export type Permission = 'veiculos.ler' | 'veiculos.editar' | 'veiculos.criar' | 'veiculos.publicar' | 'estoque.movimentar' | 'usuarios.gerenciar'

export interface User {
  id: string
  name: string
  email: string
  whatsApp: string | null
  role: UserRole
  isActive: boolean
  permissions: Permission[]
}

export interface LoginInput {
  email: string
  senha: string
}

export interface ApiResponse<T> { data: T; success: boolean; message: string | null }
export interface LoginResponse { token: string; usuario: User }
