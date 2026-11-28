<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import { authService } from '../../services/auth.service'
import { useAuth } from '../../composables/useAuth'
import { getApiErrorMessage } from '../../utils/apiError'
import { useNotificacao } from '../../composables/useNotificacao'

const router = useRouter()
const { clearSession } = useAuth()
const notify = useNotificacao()
const input = reactive({ currentPassword: '', newPassword: '', confirmation: '' })
const busy = ref(false)
const error = ref('')

async function save() {
  error.value = ''
  const password = input.newPassword
  if (password.length < 12 || !/\p{Lu}/u.test(password) || !/\p{Ll}/u.test(password) ||
      !/\p{Nd}/u.test(password) || !/[^\p{L}\p{N}]/u.test(password)) {
    error.value = 'A nova senha precisa de 12 caracteres, com maiúscula, minúscula, número e símbolo.'
    return
  }
  if (password !== input.confirmation) { error.value = 'A confirmação não corresponde à nova senha.'; return }
  if (password === input.currentPassword) { error.value = 'Escolha uma senha diferente da atual.'; return }
  busy.value = true
  try {
    await authService.changePassword(input.currentPassword, password)
    clearSession()
    notify.sucesso('Senha alterada. Entre novamente com a nova senha.')
    await router.replace('/administracao/entrar')
  } catch (cause) { error.value = getApiErrorMessage(cause) }
  finally { busy.value = false }
}
</script>

<template>
  <section class="admin-page">
    <AdminPageHeader title="Alterar minha senha" subtitle="A mudança encerra todas as sessões da sua conta, inclusive esta." />
    <form class="editor-section password-editor" @submit.prevent="save">
      <q-input v-model="input.currentPassword" outlined type="password" label="Senha atual *" autocomplete="current-password" required />
      <q-input v-model="input.newPassword" outlined type="password" label="Nova senha *" autocomplete="new-password" required />
      <q-input v-model="input.confirmation" outlined type="password" label="Confirme a nova senha *" autocomplete="new-password" required />
      <small>Use pelo menos 12 caracteres, com maiúscula, minúscula, número e símbolo.</small>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <q-btn type="submit" color="primary" label="Alterar senha" :loading="busy" />
    </form>
  </section>
</template>

<style scoped>
.password-editor { display: grid; gap: 16px; max-width: 560px; }
.password-editor small { color: #5d6875; }
.password-editor .q-btn { justify-self: start; }
</style>
