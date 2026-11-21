<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import { adminVehicleService } from '../../services/admin-vehicle.service'
import { stockService, type StockVehicle, type StockOptions } from '../../services/stock.service'
import { useNotificacao } from '../../composables/useNotificacao'
import { getApiErrorMessage } from '../../utils/apiError'

const route = useRoute()
const router = useRouter()
const notify = useNotificacao()
const vehicles = ref<StockVehicle[]>([])
const selected = ref<string[]>([])
const selectedNames = ref<Record<string, string>>({})
const options = ref<StockOptions>({ statuses: [], exitStatuses: [] })
const page = ref(1)
const total = ref(0)
const search = ref('')
const appliedSearch = ref('')
const reason = ref('')
const note = ref('')
const exitStatus = ref<1 | 2 | 3>(1)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const submitted = ref(false)
let latestRequest = 0
const pages = computed(() => Math.max(1, Math.ceil(total.value / 20)))
const available = computed(() => vehicles.value.filter(vehicle => vehicle.situacaoEstoque === 0))
const allOnPageSelected = computed(() => available.value.length > 0 && available.value.every(vehicle => selected.value.includes(vehicle.id)))

async function load() {
  const request = ++latestRequest
  loading.value = true; error.value = ''
  try {
    const result = await stockService.list(page.value, { search: appliedSearch.value, stockStatus: 0 })
    if (request === latestRequest) {
      vehicles.value = result.items; total.value = result.total
      for (const vehicle of result.items) selectedNames.value[vehicle.id] = `${vehicle.brand} ${vehicle.model} · ${vehicle.internalCode}`
    }
  } catch (cause) { if (request === latestRequest) error.value = getApiErrorMessage(cause) }
  finally { if (request === latestRequest) loading.value = false }
}
function applySearch() { page.value = 1; appliedSearch.value = search.value.trim(); void load() }
function clearSearch() {
  if (!search.value && !appliedSearch.value && page.value === 1) return
  search.value = ''; appliedSearch.value = ''; page.value = 1; void load()
}
watch(search, value => { if (!value && appliedSearch.value) clearSearch() })
function toggle(vehicle: StockVehicle) {
  selected.value = selected.value.includes(vehicle.id) ? selected.value.filter(id => id !== vehicle.id) : [...selected.value, vehicle.id]
}
function togglePage() {
  const ids = available.value.map(vehicle => vehicle.id)
  selected.value = allOnPageSelected.value ? selected.value.filter(id => !ids.includes(id)) : [...new Set([...selected.value, ...ids])]
}
async function exitSelected() {
  submitted.value = true
  if (submitting.value || !selected.value.length || selected.value.length > 100 || !reason.value.trim()) return
  submitting.value = true; error.value = ''
  try {
    await stockService.exitMany({ vehicleIds: selected.value, reason: reason.value.trim(), exitStatus: exitStatus.value, note: note.value.trim() || null })
    notify.sucesso(`${selected.value.length} ${selected.value.length === 1 ? 'veículo retirado' : 'veículos retirados'} do estoque.`)
    await router.push('/administracao/estoque')
  } catch (cause) { error.value = getApiErrorMessage(cause) }
  finally { submitting.value = false }
}
onMounted(() => {
  const recebido = route.query.veiculoId ?? route.query.vehicleId
  const id = typeof recebido === 'string' ? recebido : ''
  if (id) {
    void adminVehicleService.get(id).then(vehicle => {
      if (vehicle.situacaoEstoque === 0) { selected.value = [id]; selectedNames.value[id] = `${vehicle.brand} ${vehicle.model} · ${vehicle.internalCode}` }
      else error.value = 'Este veículo já saiu do estoque.'
    }).catch(cause => { error.value = getApiErrorMessage(cause) })
  }
  if ((route.query.situacao ?? route.query.status) === '2') exitStatus.value = 2
  void stockService.options().then(data => { options.value = data }).catch(cause => { error.value = getApiErrorMessage(cause) })
  void load()
})
</script>

<template>
  <section class="admin-page stock-page">
    <AdminPageHeader title="Registrar saída" subtitle="Selecione um ou mais veículos e registre a situação da saída." :parent="{ label: 'Estoque', to: '/administracao/estoque' }" />
    <form class="stock-search" @submit.prevent="applySearch"><q-input v-model="search" outlined dense clearable label="Buscar nome ou código" @clear="clearSearch" /><q-btn type="submit" color="primary" label="Buscar" :loading="loading" /></form>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <div class="admin-list-card">
      <div class="admin-list-heading"><strong>Veículos disponíveis</strong><small>{{ total }} {{ total === 1 ? 'veículo encontrado' : 'veículos encontrados' }}</small></div>
      <div class="stock-table-wrap"><table class="stock-table"><thead><tr><th><input type="checkbox" aria-label="Selecionar disponíveis nesta página" :checked="allOnPageSelected" :disabled="!available.length" @change="togglePage" /></th><th>Código</th><th>Marca</th><th>Veículo</th><th>Ano</th></tr></thead><tbody>
        <tr v-for="vehicle in vehicles" :key="vehicle.id"><td><input type="checkbox" :aria-label="`Selecionar ${vehicle.brand} ${vehicle.model}`" :checked="selected.includes(vehicle.id)" @change="toggle(vehicle)" /></td><td>{{ vehicle.internalCode }}</td><td>{{ vehicle.brand }}</td><td>{{ vehicle.model }} {{ vehicle.version }}</td><td>{{ vehicle.modelYear }}</td></tr>
        <tr v-if="!loading && !vehicles.length"><td colspan="5">Nenhum veículo disponível.</td></tr>
      </tbody></table></div>
    </div>
    <q-pagination v-if="pages > 1" v-model="page" :max="pages" class="catalog-pagination" @update:model-value="load" />
    <div class="stock-count-card"><strong>Veículos selecionados</strong><small>{{ selected.length }} {{ selected.length === 1 ? 'veículo selecionado' : 'veículos selecionados' }}</small></div>
    <div v-if="selected.length" class="selected-features"><span v-for="id in selected" :key="id">{{ selectedNames[id] ?? id }} <button type="button" :aria-label="`Remover ${selectedNames[id] ?? id}`" @click="selected = selected.filter(value => value !== id)">×</button></span></div>
    <form class="stock-exit-form" @submit.prevent="exitSelected">
      <q-select v-model="exitStatus" :options="options.exitStatuses" emit-value map-options outlined label="Situação" />
      <q-input v-model="reason" outlined label="Motivo *" maxlength="200" :error="submitted && !reason.trim()" error-message="Informe o motivo da saída." />
      <q-input v-model="note" outlined type="textarea" label="Observação (opcional)" maxlength="2000" />
      <p v-if="submitted && !selected.length" class="form-error">Selecione pelo menos um veículo.</p>
      <p v-if="selected.length > 100" class="form-error">Selecione no máximo 100 veículos por operação.</p>
      <q-btn type="submit" color="primary" label="Retirar selecionados do estoque" :loading="submitting" :disable="selected.length > 100" />
    </form>
  </section>
</template>
