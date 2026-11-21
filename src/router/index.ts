import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { routes } from './routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (!to.matched.some((route) => route.meta.permissao)) return true
  const auth = useAuthStore()
  await auth.hydrate(true)
  if (!auth.user) return { path: '/administracao/entrar', query: { redirecionar: to.fullPath } }
  const required = to.meta.permissao
  if (required && !auth.user.permissions.includes(required)) return { path: '/' }
  return true
})
