import type { Permission } from '../types/entidades/user'
import { useAuthStore } from '../stores/auth.store'

export function usePermissao() {
  const auth = useAuthStore()
  function canAccess(required: Permission): boolean {
    return auth.user?.permissions.includes(required) ?? false
  }
  return { canAccess }
}
