import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authService } from '../services/auth.service'
import type { LoginInput, User } from '../types/entidades/user'
import { authStorage } from '../utils/auth-storage'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(authStorage.user())
  const loaded = ref(false)

  async function hydrate(force = false): Promise<void> {
    if (loaded.value && !force) return
    if (!authStorage.token()) { user.value = null; loaded.value = true; return }
    try {
      user.value = await authService.me()
      authStorage.save(authStorage.token()!, user.value)
    } catch {
      user.value = null
      authStorage.clear()
    } finally {
      loaded.value = true
    }
  }

  async function login(input: LoginInput): Promise<void> {
    const response = await authService.login(input)
    authStorage.save(response.token, response.usuario)
    try { user.value = await authService.me() }
    catch { authStorage.clear(); user.value = null; throw new Error('Falha ao validar sessão.') }
    authStorage.save(response.token, user.value)
    loaded.value = true
  }

  async function logout(): Promise<void> {
    try {
      if (authStorage.token()) await authService.logout()
    } finally {
      authStorage.clear()
      user.value = null
      loaded.value = true
    }
  }

  function clearSession(): void {
    authStorage.clear()
    user.value = null
    loaded.value = true
  }

  return { user, loaded, hydrate, login, logout, clearSession }
})
