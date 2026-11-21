<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import AdminActionMenu from '../../components/admin/AdminActionMenu.vue'
import { adminVehicleService, type AdminVehicle } from '../../services/admin-vehicle.service'
import { stockService } from '../../services/stock.service'
import { useAuth } from '../../composables/useAuth'
import { getApiErrorMessage } from '../../utils/apiError'
import { useNotificacao } from '../../composables/useNotificacao'

type Action = { label: string; icon: string; tone?: 'danger' | 'warning'; disabled?: boolean; action: () => void }
const router = useRouter()
const { user } = useAuth()
const canCreate = computed(() => user.value?.permissions.includes('veiculos.criar') ?? false)
const canPublish = computed(() => user.value?.permissions.includes('veiculos.publicar') ?? false)
const canMove = computed(() => user.value?.permissions.includes('estoque.movimentar') ?? false)
const notify = useNotificacao()
const vehicles = ref<AdminVehicle[]>([])
const search = ref('')
const brand = ref<string | null>(null)
const status = ref<number | null>(null)
const applied = ref<{ search: string; brand: string | null; status: number | null }>({ search: '', brand: null, status: null })
const allBrands = ref<string[]>([])
const brandOptions = ref<string[]>([])
const allStatuses = ref<Array<{ value: number; label: string }>>([])
const statusOptions = ref<Array<{ value: number; label: string }>>([])
const page = ref(1)
const total = ref(0)
const loading = ref(false)
const pending = ref('')
const error = ref('')
const statusLabel = (value: number | null) => allStatuses.value.find(item => item.value === value)?.label ?? 'Arquivado'
function filterBrands(value: string, update: (callback: () => void) => void) {
  update(() => { brandOptions.value = allBrands.value.filter(item => item.toLocaleLowerCase('pt-BR').includes(value.toLocaleLowerCase('pt-BR'))) })
}
function filterStatuses(value: string, update: (callback: () => void) => void) {
  update(() => { statusOptions.value = allStatuses.value.filter(item => item.label.toLocaleLowerCase('pt-BR').includes(value.toLocaleLowerCase('pt-BR'))) })
}
function applyFilters() { page.value = 1; applied.value = { search: search.value.trim(), brand: brand.value, status: status.value }; void load() }
function clearFilters() { search.value = ''; brand.value = null; status.value = null; applyFilters() }

async function load() {
  loading.value = true; error.value = ''
  try { const result = await adminVehicleService.list(page.value, applied.value); vehicles.value = result.items; total.value = result.total }
  catch (cause) { error.value = getApiErrorMessage(cause) }
  finally { loading.value = false }
}
async function changePublication(vehicle: AdminVehicle) {
  pending.value = vehicle.id
  try {
    if (vehicle.statusPublicacao === 1) await adminVehicleService.hide(vehicle.id)
    else await adminVehicleService.publish(vehicle.id)
    notify.sucesso('Publicação atualizada.'); await load()
  } catch (cause) { notify.erro(getApiErrorMessage(cause)) }
  finally { pending.value = '' }
}
function actions(vehicle: AdminVehicle): Action[] {
  const items: Action[] = [
    { label: 'Visualizar', icon: 'visibility', disabled: vehicle.statusPublicacao !== 1 || vehicle.situacaoEstoque !== 0,
      action: () => { window.open(`/vehicles/${vehicle.slug}`, '_blank', 'noopener,noreferrer') } },
    { label: 'Editar', icon: 'edit', action: () => { void router.push(`/administracao/veiculos/${vehicle.id}`) } },
  ]
  if (canPublish.value) items.push({ label: vehicle.statusPublicacao === 1 ? 'Desativar' : 'Ativar', icon: vehicle.statusPublicacao === 1 ? 'cancel' : 'check_circle', tone: 'warning',
    disabled: pending.value === vehicle.id || (vehicle.situacaoEstoque !== 0 && vehicle.statusPublicacao !== 1), action: () => { void changePublication(vehicle) } })
  if (canMove.value) items.push({ label: 'Baixa em estoque', icon: 'inventory_2', tone: 'danger', disabled: vehicle.situacaoEstoque !== 0,
    action: () => { void router.push({ path: '/administracao/estoque/saida', query: { veiculoId: vehicle.id, situacao: '2' } }) } })
  return items
}
onMounted(() => {
  void load()
  void Promise.all([stockService.filters(false), adminVehicleService.statuses()]).then(([filters, statuses]) => {
    allBrands.value = filters.brands; brandOptions.value = filters.brands
    allStatuses.value = statuses; statusOptions.value = statuses
  }).catch(cause => { error.value = getApiErrorMessage(cause) })
})
</script>

<template>
  <section class="admin-page">
    <AdminPageHeader title="Veículos" subtitle="Cadastre, edite e publique os veículos do catálogo.">
      <template #actions><RouterLink v-if="canCreate" class="btn btn-primary" to="/administracao/veiculos/novo"><q-icon name="add" /> Adicionar veículo</RouterLink></template>
    </AdminPageHeader>
    <q-expansion-item class="admin-filter-panel" default-opened icon="filter_list" label="Filtrar veículos" expand-icon="keyboard_arrow_down">
      <form @submit.prevent="applyFilters"><div class="admin-filter-fields admin-vehicle-filters">
        <q-input v-model="search" outlined label="Nome ou código" clearable />
        <q-select v-model="brand" :options="brandOptions" use-input fill-input hide-selected input-debounce="0" outlined clearable label="Marca" @filter="filterBrands" />
        <q-select v-model="status" :options="statusOptions" emit-value map-options use-input fill-input hide-selected input-debounce="0" outlined clearable label="Status" @filter="filterStatuses" />
      </div><div class="admin-filter-actions"><q-btn flat no-caps label="Limpar filtros" icon="close" @click="clearFilters" /><q-btn type="submit" outline color="primary" rounded no-caps icon="search" label="Pesquisar" :loading="loading" /></div></form>
    </q-expansion-item>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <div class="admin-list-card"><div class="admin-list-heading"><strong>Veículos cadastrados</strong><small>{{ total }} {{ total === 1 ? 'veículo encontrado' : 'veículos encontrados' }}</small></div>
      <div class="stock-table-wrap"><table class="stock-table"><thead><tr><th>Código</th><th>Marca</th><th>Modelo</th><th>Ano</th><th>Valor</th><th>Status</th><th>Publicação</th><th>Ações</th></tr></thead><tbody>
        <tr v-for="vehicle in vehicles" :key="vehicle.id"><td>{{ vehicle.internalCode }}</td><td><strong>{{ vehicle.brand }}</strong></td><td><strong>{{ vehicle.model }}</strong><br /><small>{{ vehicle.version }}</small></td><td>{{ vehicle.modelYear }}</td><td>{{ vehicle.regularPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}</td><td>{{ statusLabel(vehicle.status) }}</td><td>{{ vehicle.statusPublicacao === 1 ? 'Publicado' : vehicle.statusPublicacao === 2 ? 'Oculto' : 'Rascunho' }}</td><td><AdminActionMenu :items="actions(vehicle)" /></td></tr>
        <tr v-if="!loading && !vehicles.length"><td colspan="8">Nenhum veículo encontrado.</td></tr>
      </tbody></table></div>
    </div>
    <q-pagination v-if="total > 20" v-model="page" :max="Math.ceil(total / 20)" class="catalog-pagination" @update:model-value="load" />
  </section>
</template>
