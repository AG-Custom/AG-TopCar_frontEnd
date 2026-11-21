import 'vue-router'
import type { Permission } from '../types/entidades/user'

declare module 'vue-router' {
  interface RouteMeta {
    permissao?: Permission
  }
}
