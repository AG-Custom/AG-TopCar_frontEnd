<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{ title: string; subtitle: string; parent?: { label: string; to: string } }>()
</script>

<template>
  <header class="admin-page-header">
    <nav class="admin-breadcrumb" aria-label="Trilha de navegação">
      <RouterLink to="/administracao"><q-icon name="home" /> Início</RouterLink>
      <span aria-hidden="true">›</span>
      <template v-if="parent"><RouterLink :to="parent.to">{{ parent.label }}</RouterLink><span aria-hidden="true">›</span></template>
      <strong aria-current="page">{{ title }}</strong>
    </nav>
    <div class="admin-page-header-row">
      <div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>
      <div v-if="$slots.actions" class="admin-header-actions"><slot name="actions" /></div>
    </div>
  </header>
</template>
