<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <RouterLink to="/" class="brand">TopCar</RouterLink>
      <nav aria-label="Navegação principal">
        <RouterLink to="/">Carros</RouterLink>
      </nav>
    </header>
    <main><RouterView /></main>
  </div>
</template>
