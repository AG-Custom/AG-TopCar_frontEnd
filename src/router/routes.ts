import type { RouteRecordRaw } from 'vue-router'
import PublicLayout from '../layouts/PublicLayout.vue'
import HomePage from '../pages/catalog/HomePage.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import MainLayout from '../layouts/MainLayout.vue'
import CatalogPage from '../pages/catalog/CatalogPage.vue'
import VehicleDetailPage from '../pages/catalog/VehicleDetailPage.vue'
import ContactPage from '../pages/catalog/ContactPage.vue'
import LoginPage from '../pages/auth/LoginPage.vue'
import DashboardPage from '../pages/dashboard/DashboardPage.vue'
import StockPage from '../pages/dashboard/StockPage.vue'
import StockExitPage from '../pages/dashboard/StockExitPage.vue'
import VehiclesPage from '../pages/dashboard/VehiclesPage.vue'
import VehicleFormPage from '../pages/dashboard/VehicleFormPage.vue'
import UsersPage from '../pages/dashboard/UsersPage.vue'
import ChangePasswordPage from '../pages/dashboard/ChangePasswordPage.vue'
import ErrorNotFound from '../pages/ErrorNotFound.vue'

function traduzirRotaAntiga(caminho: string): string {
  const url = new URL(caminho, 'http://localhost')
  if (!/^\/admin(?:\/|$)/.test(url.pathname)) return caminho
  const nomes: Record<string, string> = { login: 'entrar', stock: 'estoque', exit: 'saida', vehicles: 'veiculos', new: 'novo', users: 'usuarios' }
  const partes = url.pathname.split('/').filter(Boolean).slice(1)
  const traduzido = partes.map(parte => nomes[parte] ?? parte).join('/')
  return `/administracao${traduzido ? `/${traduzido}` : ''}${url.search}${url.hash}`
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', component: HomePage },
      { path: 'estoque', component: CatalogPage },
      { path: 'contato', component: ContactPage },
      { path: 'vehicles/:slug', component: VehicleDetailPage },
    ],
  },
  {
    path: '/administracao/entrar',
    component: AuthLayout,
    children: [{ path: '', component: LoginPage }],
  },
  {
    path: '/administracao',
    component: MainLayout,
    meta: { permissao: 'veiculos.ler' },
    children: [
      { path: '', component: DashboardPage },
      { path: 'estoque', component: StockPage },
      { path: 'estoque/saida', component: StockExitPage, meta: { permissao: 'estoque.movimentar' } },
      { path: 'veiculos', component: VehiclesPage },
      { path: 'veiculos/novo', component: VehicleFormPage, meta: { permissao: 'veiculos.criar' } },
      { path: 'veiculos/:id', component: VehicleFormPage },
      { path: 'usuarios', component: UsersPage, meta: { permissao: 'usuarios.gerenciar' } },
      { path: 'minha-senha', component: ChangePasswordPage },
    ],
  },
  {
    path: '/admin/:antigo(.*)*',
    redirect: (to) => {
      const query = { ...to.query }
      if (typeof query.redirect === 'string') {
        query.redirecionar = traduzirRotaAntiga(query.redirect)
        delete query.redirect
      }
      if (typeof query.redirecionar === 'string') query.redirecionar = traduzirRotaAntiga(query.redirecionar)
      return { path: traduzirRotaAntiga(to.path), query, hash: to.hash }
    },
  },
  { path: '/:pathMatch(.*)*', component: ErrorNotFound },
]
