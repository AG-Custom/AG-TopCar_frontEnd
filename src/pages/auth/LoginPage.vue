<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { getApiErrorMessage } from '../../utils/apiError'
import { useNotificacao } from '../../composables/useNotificacao'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()
const { erro } = useNotificacao()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const pending = ref(false)

async function submit() {
  error.value = ''
  pending.value = true
  try {
    await login({ email: email.value, senha: password.value })
    const requested = route.query.redirecionar ?? route.query.redirect
    const destination = typeof requested === 'string' && requested.startsWith('/') && !requested.startsWith('//')
      ? requested : '/administracao'
    await router.replace(destination)
  } catch (cause) {
    error.value = getApiErrorMessage(cause)
    erro(error.value)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="login-panel" aria-labelledby="login-title">
    <div class="login-heading">
      <span class="login-lock"><q-icon name="lock_outline" /></span>
      <p class="login-eyebrow">Acesso da equipe</p>
      <h2 id="login-title">Bem-vindo de volta</h2>
      <p>Entre com sua conta para acessar o painel TopCar.</p>
    </div>

    <form class="login-form" @submit.prevent="submit">
      <label for="login-email">E-mail <span>*</span></label>
      <input id="login-email" v-model.trim="email" type="email" name="email" placeholder="seu@email.com" autocomplete="username" required />

      <label for="login-password">Senha <span>*</span></label>
      <div class="login-password-field">
        <input id="login-password" v-model="password" :type="showPassword ? 'text' : 'password'" name="password" placeholder="Digite sua senha" autocomplete="current-password" required />
        <button type="button" class="login-password-toggle" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><q-icon :name="showPassword ? 'visibility_off' : 'visibility'" /></button>
      </div>

      <p v-if="error" role="alert" class="login-error">{{ error }}</p>
      <button type="submit" class="login-submit" :disabled="pending"><span>{{ pending ? 'Entrando…' : 'Entrar no painel' }}</span><q-icon v-if="!pending" name="arrow_forward" /></button>
    </form>

    <p class="login-help">Acesso exclusivo para a equipe TopCar.</p>
  </section>
</template>

<style scoped>
.login-panel { width: min(100%, 500px); padding: clamp(32px, 4vw, 54px); border: 1px solid #e7e3e1; border-top: 4px solid #c2182b; border-radius: 18px; background: #fff; box-shadow: 0 24px 70px rgba(22,24,28,.10); }
.login-heading { margin-bottom: 34px; }
.login-lock { display: grid; place-items: center; width: 46px; height: 46px; margin-bottom: 24px; border-radius: 12px; background: #fae9ec; color: #c2182b; font-size: 24px; }
.login-eyebrow { margin: 0 0 7px; color: #be2335; font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
.login-heading h2 { margin: 0; color: #1c2025; font-size: clamp(28px, 2.8vw, 39px); line-height: 1.14; letter-spacing: -.04em; font-weight: 800; }
.login-heading > p:last-child { margin: 14px 0 0; color: #69717a; font-size: 15px; line-height: 1.5; }
.login-form { display: grid; }
.login-form label { margin: 0 0 9px; color: #31363c; font-size: 13px; font-weight: 700; }
.login-form label span { color: #c2182b; }
.login-form input { width: 100%; height: 55px; padding: 0 16px; outline: none; border: 1px solid #d8dce0; border-radius: 10px; background: #fff; color: #1c2025; font: inherit; font-size: 15px; transition: border-color .2s, box-shadow .2s; }
.login-form input::placeholder { color: #939aa3; }
.login-form input:focus { border-color: #c2182b; box-shadow: 0 0 0 4px rgba(194,24,43,.11); }
#login-email { margin-bottom: 22px; }
.login-password-field { position: relative; }
.login-password-field input { padding-right: 54px; }
.login-password-toggle { position: absolute; top: 5px; right: 5px; display: grid; place-items: center; width: 45px; height: 45px; border: 0; border-radius: 8px; background: transparent; color: #737b85; font-size: 21px; }
.login-password-toggle:hover, .login-password-toggle:focus-visible { color: #c2182b; background: #fae9ec; }
.login-error { margin: 16px 0 0; color: #a31627; font-size: 13px; line-height: 1.45; }
.login-submit { display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; min-height: 54px; margin-top: 30px; padding: 0 18px; border: 0; border-radius: 10px; background: #c2182b; color: #fff; font-size: 15px; font-weight: 800; box-shadow: 0 9px 20px rgba(194,24,43,.18); transition: background .2s, transform .2s; }
.login-submit:hover:not(:disabled) { background: #a81123; transform: translateY(-1px); }
.login-submit:disabled { opacity: .65; cursor: wait; }
.login-submit .q-icon { font-size: 19px; }
.login-help { margin: 25px 0 0; color: #9097a0; text-align: center; font-size: 12px; }
@media (max-width: 760px) { .login-panel { padding: 32px 26px; } .login-heading { margin-bottom: 26px; } }
@media (max-width: 380px) { .login-panel { padding: 28px 20px; } }
</style>
