<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="auth-shell">
    <aside class="auth-showcase" aria-label="Apresentação da TopCar">
      <div class="auth-showcase-content">
        <div class="auth-showcase-copy">
          <span class="auth-showcase-eyebrow"><span></span> Painel da equipe</span>
          <h1>Seu estoque em<br /><em>boas mãos.</em></h1>
          <p>Gerencie os veículos e mantenha o catálogo da TopCar sempre atualizado.</p>

          <ul class="auth-benefits">
            <li><span class="auth-benefit-icon"><q-icon name="directions_car" /></span><span><strong>Veículos organizados</strong><small>Informações do estoque em um só lugar</small></span></li>
            <li><span class="auth-benefit-icon"><q-icon name="inventory_2" /></span><span><strong>Estoque sob controle</strong><small>Acompanhe a situação de cada veículo</small></span></li>
            <li><span class="auth-benefit-icon"><q-icon name="storefront" /></span><span><strong>Catálogo atualizado</strong><small>Apresente seus veículos com clareza</small></span></li>
          </ul>
        </div>

        <span class="auth-showcase-footer">TopCar Automóveis · Serra, ES</span>
      </div>
    </aside>

    <main class="auth-main"><RouterView /></main>
  </div>
</template>

<style scoped>
.auth-shell { min-height: 100vh; min-height: 100svh; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); background: #f8f7f5; }
.auth-showcase { position: relative; overflow: hidden; color: #fff; background: radial-gradient(circle at 86% 12%, #54202a 0, transparent 37%), linear-gradient(145deg, #24272c 0%, #14171c 64%, #0e1014 100%); }
.auth-showcase::before { content: ''; position: absolute; inset: 42% -30% -70% -50%; border: 1px solid rgba(255,255,255,.08); border-radius: 50%; box-shadow: 0 0 0 95px rgba(255,255,255,.025), 0 0 0 195px rgba(255,255,255,.02), 0 0 0 310px rgba(255,255,255,.015); transform: rotate(-16deg); pointer-events: none; }
.auth-showcase::after { content: ''; position: absolute; width: 460px; height: 460px; right: -230px; top: -230px; border-radius: 50%; background: #c2182b; opacity: .12; filter: blur(50px); pointer-events: none; }
.auth-showcase-content { position: relative; z-index: 1; width: min(100%, 680px); min-height: 100%; margin-inline: auto; padding: clamp(36px, 5vw, 78px); display: flex; flex-direction: column; justify-content: center; }
.auth-showcase-copy { max-width: 520px; }
.auth-showcase-eyebrow { display: inline-flex; align-items: center; gap: 10px; color: #e2b8be; font-size: 12px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
.auth-showcase-eyebrow span { width: 27px; height: 3px; background: #e33548; border-radius: 2px; }
.auth-showcase h1 { margin: 22px 0 18px; font-size: clamp(40px, 4vw, 64px); line-height: 1.08; letter-spacing: -.045em; font-weight: 800; }
.auth-showcase h1 em { color: #f0485a; font-style: normal; }
.auth-showcase-copy > p { max-width: 435px; margin: 0; color: #c9cbd0; font-size: clamp(16px, 1.35vw, 19px); line-height: 1.65; }
.auth-benefits { list-style: none; display: grid; gap: 23px; margin: 52px 0 0; padding: 0; }
.auth-benefits li { display: flex; align-items: center; gap: 16px; }
.auth-benefit-icon { display: grid; place-items: center; width: 46px; height: 46px; flex: none; border: 1px solid rgba(255,255,255,.13); border-radius: 12px; background: rgba(255,255,255,.07); color: #ff6b78; font-size: 22px; }
.auth-benefits strong, .auth-benefits small { display: block; }
.auth-benefits strong { font-size: 15px; font-weight: 700; }
.auth-benefits small { margin-top: 3px; color: #aeb1b9; font-size: 13px; }
.auth-showcase-footer { position: absolute; bottom: clamp(36px, 5vw, 78px); left: clamp(36px, 5vw, 78px); color: #92959f; font-size: 12px; }
.auth-main { display: grid; place-items: center; min-width: 0; padding: 48px clamp(24px, 5vw, 80px); background: radial-gradient(circle at 100% 0%, #fff 0, transparent 45%), linear-gradient(150deg, #f9f7f6, #f2f1ef); }
@media (max-width: 900px) { .auth-showcase-content { padding: 36px; } .auth-main { padding: 36px; } }
@media (max-width: 760px) { .auth-shell { grid-template-columns: 1fr; } .auth-showcase { display: none; } .auth-main { min-height: 100svh; padding: 30px 20px 44px; } }
</style>
