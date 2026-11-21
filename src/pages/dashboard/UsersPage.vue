<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { usersService, type UserInput } from '../../services/users.service'
import type { User } from '../../types/entidades/user'
import { getApiErrorMessage } from '../../utils/apiError'
import { useNotificacao } from '../../composables/useNotificacao'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import AdminActionMenu from '../../components/admin/AdminActionMenu.vue'

const notify = useNotificacao()
const users = ref<User[]>([])
const editing = ref<string | null>(null)
const busy = ref(false)
const error = ref('')
const roleOptions = ref<Array<{ value: 'Administrador' | 'Vendedor'; label: string }>>([])
const input = reactive<UserInput>({ name: '', email: '', whatsApp: null, role: 'Vendedor', isActive: true, password: null })
async function load() { try { users.value = await usersService.list() } catch (cause) { error.value = getApiErrorMessage(cause) } }
function edit(user?: User) {
  editing.value = user?.id ?? 'new'
  Object.assign(input, { name: user?.name ?? '', email: user?.email ?? '', whatsApp: user?.whatsApp ?? null, role: user?.role ?? 'Vendedor', isActive: user?.isActive ?? true, password: null })
  error.value = ''
}
async function save() {
  if (!editing.value) return
  error.value = ''
  if (!input.name.trim() || !input.email.trim() || (editing.value === 'new' && !input.password)) { error.value = 'Preencha nome, e-mail e senha para novos usuários.'; return }
  busy.value = true
  try {
    const payload = { ...input, name: input.name.trim(), email: input.email.trim(), whatsApp: input.whatsApp?.trim() || null, password: input.password || null }
    if (editing.value === 'new') await usersService.create(payload)
    else await usersService.update(editing.value, payload)
    notify.sucesso('Usuário salvo.'); editing.value = null; await load()
  } catch (cause) { error.value = getApiErrorMessage(cause) }
  finally { busy.value = false }
}
async function setActive(user: User) {
  busy.value = true
  try { await usersService.setActive(user.id, !user.isActive); notify.sucesso('Acesso atualizado.'); await load() }
  catch (cause) { notify.erro(getApiErrorMessage(cause)) }
  finally { busy.value = false }
}
onMounted(() => { void load(); void usersService.roles().then(items => { roleOptions.value = items }).catch(cause => { error.value = getApiErrorMessage(cause) }) })
</script>

<template>
  <section class="admin-page"><AdminPageHeader title="Usuários" subtitle="Gerencie o acesso ao painel."><template #actions><q-btn color="primary" icon="add" label="Novo usuário" @click="edit()" /></template></AdminPageHeader>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <div class="admin-list-card"><div class="admin-list-heading"><strong>Usuários cadastrados</strong><small>{{ users.length }} {{ users.length === 1 ? 'usuário encontrado' : 'usuários encontrados' }}</small></div><div class="stock-table-wrap"><table class="stock-table"><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th>Ações</th></tr></thead><tbody><tr v-for="user in users" :key="user.id"><td>{{ user.name }}</td><td>{{ user.email }}</td><td>{{ user.role === 'Administrador' ? 'Administrador' : 'Vendedor' }}</td><td>{{ user.isActive ? 'Ativo' : 'Inativo' }}</td><td><AdminActionMenu :items="[{ label: 'Editar', icon: 'edit', action: () => edit(user) }, { label: user.isActive ? 'Desativar' : 'Ativar', icon: user.isActive ? 'cancel' : 'check_circle', tone: 'warning', disabled: busy, action: () => { void setActive(user) } }]" /></td></tr><tr v-if="!users.length"><td colspan="5">Nenhum usuário encontrado.</td></tr></tbody></table></div></div>
    <form v-if="editing" class="editor-section user-editor" @submit.prevent="save"><h2>{{ editing === 'new' ? 'Novo usuário' : 'Editar usuário' }}</h2><div class="editor-grid"><q-input v-model="input.name" outlined label="Nome *" maxlength="150" /><q-input v-model="input.email" outlined type="email" label="E-mail *" /><q-input v-model="input.whatsApp" outlined label="WhatsApp" /><q-select v-model="input.role" outlined emit-value map-options :options="roleOptions" label="Perfil" /><q-input v-if="editing === 'new'" v-model="input.password" outlined type="password" label="Senha *" /></div><div class="editor-actions"><q-btn type="submit" color="primary" label="Salvar" :loading="busy" /><q-btn flat label="Cancelar" @click="editing = null" /></div></form>
  </section>
</template>
