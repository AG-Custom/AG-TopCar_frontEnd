<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useNotificacao } from '../composables/useNotificacao'

const router = useRouter()
const { user, logout } = useAuth()
const notificacao = useNotificacao()

async function signOut() {
  try { await logout() }
  catch { notificacao.erro('Sessão local encerrada. Não foi possível confirmar o logout no servidor.') }
  finally { await router.push('/administracao/entrar') }
}
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <RouterLink to="/" class="brand" aria-label="TopCar, início"><span class="brand-logo-frame"><img src="/logo/Logo.jpeg" alt="TopCar Automóveis" /></span></RouterLink>
      <nav aria-label="Painel administrativo">
        <RouterLink to="/administracao">Painel</RouterLink>
        <RouterLink to="/administracao/estoque">Estoque</RouterLink>
        <RouterLink to="/administracao/veiculos">Veículos</RouterLink>
        <RouterLink v-if="user?.permissions.includes('usuarios.gerenciar')" to="/administracao/usuarios">Usuários</RouterLink>
        <RouterLink to="/">Ver catálogo</RouterLink>
      </nav>
      <div class="admin-account">
        <span>{{ user?.name }}</span>
        <small>{{ user?.role === 'Administrador' ? 'Administrador' : 'Vendedor' }}</small>
        <RouterLink to="/administracao/minha-senha">Alterar minha senha</RouterLink>
        <q-btn type="button" color="secondary" label="Sair" @click="signOut" />
      </div>
    </aside>
    <main class="admin-content"><RouterView /></main>
  </div>
</template>
