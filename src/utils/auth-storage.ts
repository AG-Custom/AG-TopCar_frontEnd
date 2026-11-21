import type { User } from '../types/entidades/user'

const tokenKey = 'auth.token'
const userKey = 'auth.usuario'

export const authStorage = {
  token(): string | null { return localStorage.getItem(tokenKey) },
  user(): User | null {
    try {
      const value = localStorage.getItem(userKey)
      return value ? JSON.parse(value) as User : null
    } catch { return null }
  },
  save(token: string, user: User): void {
    localStorage.setItem(tokenKey, token)
    localStorage.setItem(userKey, JSON.stringify(user))
  },
  clear(): void {
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userKey)
  },
}
