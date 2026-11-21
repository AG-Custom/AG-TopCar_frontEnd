<script setup lang="ts">
import { company } from '../../config/company'
</script>

<template>
  <div class="contact-page">
    <section class="contact-hero"><div class="container"><span class="section-label">Fale com a gente</span><h1>Estamos prontos para conversar.</h1><p>Encontrou um veículo interessante ou quer conhecer a TopCar? Nossa equipe está a uma mensagem de distância.</p></div></section>
    <section class="container contact-layout">
      <div class="contact-primary">
        <span class="section-label">Atendimento direto</span>
        <h2>Seu próximo carro começa com uma conversa.</h2>
        <p>Entre em contato pelo WhatsApp para tirar dúvidas sobre os veículos publicados ou agendar uma visita.</p>
        <a :href="company.whatsAppUrl" target="_blank" rel="noopener noreferrer" class="btn btn-red"><q-icon name="chat" /> Conversar no WhatsApp</a>
      </div>
      <div class="contact-cards">
        <div class="contact-info-card"><span class="info-icon"><q-icon name="location_on" /></span><div><h3>Onde estamos</h3><p>{{ company.address }}</p><a :href="company.mapsUrl" target="_blank" rel="noopener noreferrer">Ver no mapa <q-icon name="arrow_outward" /></a></div></div>
        <div class="contact-info-card"><span class="info-icon"><q-icon name="call" /></span><div><h3>Telefone</h3><p>{{ company.phoneDisplay }}</p><a :href="company.phoneHref">Ligar agora <q-icon name="arrow_outward" /></a></div></div>
        <div class="contact-info-card"><span class="info-icon"><q-icon name="schedule" /></span><div><h3>Horário de atendimento</h3><p>{{ company.hours }}</p></div></div>
        <div class="contact-info-card"><span class="info-icon"><q-icon name="share" /></span><div><h3>Acompanhe a TopCar</h3><p>Novidades e oportunidades nas redes sociais.</p><a :href="company.instagramUrl" target="_blank" rel="noopener noreferrer">Instagram <q-icon name="arrow_outward" /></a><a :href="company.facebookUrl" target="_blank" rel="noopener noreferrer">Facebook <q-icon name="arrow_outward" /></a></div></div>
      </div>
    </section>
  </div>
</template>
