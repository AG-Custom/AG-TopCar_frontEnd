<script setup lang="ts">
import { useAuth } from '../../composables/useAuth'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'

const { user } = useAuth()
</script>

<template>
  <section>
    <AdminPageHeader :title="`Olá, ${user?.name ?? ''}`" subtitle="Acompanhe o catálogo, o estoque e os acessos da equipe." />
    <div class="dashboard-links"><RouterLink to="/administracao/veiculos"><strong>Veículos</strong><span>Cadastros, fotos e publicação</span></RouterLink><RouterLink to="/administracao/estoque"><strong>Estoque</strong><span>Consulta e situação dos veículos</span></RouterLink><RouterLink v-if="user?.permissions.includes('usuarios.gerenciar')" to="/administracao/usuarios"><strong>Usuários</strong><span>Perfis e permissões</span></RouterLink></div>
  </section>
</template>
