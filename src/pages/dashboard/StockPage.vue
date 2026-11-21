<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import { stockService, type StockVehicle, type StockOptions, type AdminFilters, type StockQuery } from '../../services/stock.service'
import { useAuth } from '../../composables/useAuth'
import { getApiErrorMessage } from '../../utils/apiError'

const { user } = useAuth()
const canMove = computed(() => user.value?.permissions.includes('estoque.movimentar') ?? false)
const vehicles = ref<StockVehicle[]>([])
const options = ref<StockOptions>({ statuses: [], exitStatuses: [] })
const filters = ref<AdminFilters>({ brands: [], years: [] })
const brands = ref<string[]>([])
const years = ref<number[]>([])
const statuses = ref<StockOptions['statuses']>([])
const draft = ref<StockQuery>({ search: '', brand: null, year: null, stockStatus: null })
const applied = ref<StockQuery>({})
const page = ref(1)
const total = ref(0)
const loading = ref(false)
const error = ref('')
const pages = computed(() => Math.max(1, Math.ceil(total.value / 20)))
const statusLabel = (value: number) => options.value.statuses.find(item => item.value === value)?.label ?? 'Desconhecido'

function filterBrands(value: string, update: (callback: () => void) => void) {
  update(() => { brands.value = filters.value.brands.filter(x => x.toLocaleLowerCase('pt-BR').includes(value.toLocaleLowerCase('pt-BR'))) })
}
function filterYears(value: string, update: (callback: () => void) => void) {
  update(() => { years.value = filters.value.years.filter(x => String(x).includes(value)) })
}
function filterStatuses(value: string, update: (callback: () => void) => void) {
  update(() => { statuses.value = options.value.statuses.filter(x => x.label.toLocaleLowerCase('pt-BR').includes(value.toLocaleLowerCase('pt-BR'))) })
}
async function load() {
  loading.value = true; error.value = ''
  try { const result = await stockService.list(page.value, applied.value); vehicles.value = result.items; total.value = result.total }
  catch (cause) { error.value = getApiErrorMessage(cause) }
  finally { loading.value = false }
}
function search() { page.value = 1; applied.value = { ...draft.value, search: draft.value.search?.trim() }; void load() }
function clear() { draft.value = { search: '', brand: null, year: null, stockStatus: null }; search() }
onMounted(() => {
  void load()
  void Promise.all([stockService.options(), stockService.filters()]).then(([stockOptions, adminFilters]) => {
    options.value = stockOptions; filters.value = adminFilters
    brands.value = adminFilters.brands; years.value = adminFilters.years; statuses.value = stockOptions.statuses
  }).catch(cause => { error.value = getApiErrorMessage(cause) })
})
</script>

<template>
  <section class="admin-page stock-page">
    <AdminPageHeader title="Estoque" subtitle="Consulte a situação dos veículos cadastrados.">
      <template #actions>
        <RouterLink v-if="canMove" class="btn btn-secondary" to="/administracao/estoque/saida"><q-icon name="logout" /> Registrar saída</RouterLink>
        <RouterLink v-if="user?.permissions.includes('veiculos.criar')" class="btn btn-primary" to="/administracao/veiculos/novo"><q-icon name="add" /> Adicionar veículo</RouterLink>
      </template>
    </AdminPageHeader>
    <q-expansion-item class="admin-filter-panel" default-opened icon="filter_list" label="Filtrar estoque" expand-icon="keyboard_arrow_down">
      <form @submit.prevent="search">
        <div class="admin-filter-fields">
          <q-input v-model="draft.search" outlined label="Buscar nome ou código" clearable />
          <q-select v-model="draft.year" :options="years" use-input fill-input hide-selected input-debounce="0" outlined clearable label="Ano" @filter="filterYears" />
          <q-select v-model="draft.stockStatus" :options="statuses" emit-value map-options use-input fill-input hide-selected input-debounce="0" outlined clearable label="Estoque" @filter="filterStatuses" />
          <q-select v-model="draft.brand" :options="brands" use-input fill-input hide-selected input-debounce="0" outlined clearable label="Marca" @filter="filterBrands" />
        </div>
        <div class="admin-filter-actions"><q-btn flat no-caps label="Limpar filtros" icon="close" @click="clear" /><q-btn type="submit" outline color="primary" rounded no-caps label="Pesquisar" icon="search" :loading="loading" /></div>
      </form>
    </q-expansion-item>
    <p v-if="error" role="alert" class="form-error">{{ error }}</p>
    <div class="admin-list-card">
      <div class="admin-list-heading"><strong>Veículos no estoque</strong><small>{{ total }} {{ total === 1 ? 'veículo encontrado' : 'veículos encontrados' }}</small></div>
      <div class="stock-table-wrap"><table class="stock-table"><thead><tr><th>Código</th><th>Marca</th><th>Veículo</th><th>Ano</th><th>Estoque</th></tr></thead><tbody>
        <tr v-for="vehicle in vehicles" :key="vehicle.id"><td>{{ vehicle.internalCode }}</td><td>{{ vehicle.brand }}</td><td>{{ vehicle.model }} {{ vehicle.version }}</td><td>{{ vehicle.modelYear }}</td><td>{{ statusLabel(vehicle.situacaoEstoque) }}</td></tr>
        <tr v-if="!loading && !vehicles.length"><td colspan="5">Nenhum veículo encontrado.</td></tr>
      </tbody></table></div>
    </div>
    <q-pagination v-if="pages > 1" v-model="page" :max="pages" class="catalog-pagination" @update:model-value="load" />
  </section>
</template>
