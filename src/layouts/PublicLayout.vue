<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { company } from '../config/company'

const menuOpen = ref(false)
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="container header-content">
        <RouterLink to="/" class="brand" aria-label="TopCar Automóveis, início" @click="menuOpen = false">
          <span class="brand-logo-frame"><img src="/logo/Logo.jpeg" alt="TopCar Automóveis" /></span>
        </RouterLink>
        <button class="menu-toggle" type="button" :aria-expanded="menuOpen" aria-label="Abrir navegação" @click="menuOpen = !menuOpen"><q-icon :name="menuOpen ? 'close' : 'menu'" /></button>
        <nav :class="{ open: menuOpen }" aria-label="Navegação principal">
          <RouterLink to="/" @click="menuOpen = false">Início</RouterLink>
          <RouterLink to="/estoque" @click="menuOpen = false">Estoque</RouterLink>
          <RouterLink to="/contato" @click="menuOpen = false">Contato</RouterLink>
        </nav>
        <a class="header-contact" :href="company.whatsAppUrl" target="_blank" rel="noopener noreferrer"><q-icon name="chat" /> Fale com a TopCar</a>
      </div>
    </header>
    <main><RouterView /></main>
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <RouterLink to="/" class="brand brand-footer"><span class="brand-logo-frame"><img src="/logo/LogoBlack.jpeg" alt="TopCar Automóveis" /></span></RouterLink>
          <p>Seu próximo carro está mais perto do que você imagina.</p>
        </div>
        <div><h4>Navegação</h4><RouterLink to="/">Início</RouterLink><RouterLink to="/estoque">Estoque</RouterLink><RouterLink to="/contato">Contato</RouterLink></div>
        <div><h4>Fale conosco</h4><a :href="company.phoneHref">{{ company.phoneDisplay }}</a><span class="footer-hours">{{ company.hours }}</span><a :href="company.mapsUrl" target="_blank" rel="noopener noreferrer">{{ company.address }}</a><a :href="company.instagramUrl" target="_blank" rel="noopener noreferrer">Instagram</a></div>
      </div>
      <div class="container footer-bottom">© {{ new Date().getFullYear() }} TopCar Automóveis. Todos os direitos reservados.</div>
    </footer>
    <a class="floating-whatsapp" :href="company.whatsAppUrl" target="_blank" rel="noopener noreferrer" aria-label="Conversar com a TopCar pelo WhatsApp"><q-icon name="chat" /></a>
  </div>
</template>
