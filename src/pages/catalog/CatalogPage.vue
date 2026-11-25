<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VehicleCard from '../../components/VehicleCard.vue'
import { useCatalogo } from '../../composables/useCatalogo'

const route = useRoute()
const router = useRouter()
const catalog = useCatalogo()
const { vehicles, filters, total, pending, error, page, search, brand, model,
  minYear, maxYear, minPrice, maxPrice, sort, models, years, load, loadFilters } = catalog
const showFilters = ref(false)
const filterError = ref('')
const pages = computed(() => Math.max(1, Math.ceil(total.value / 12)))
const sortOptions = [
  { label: 'Mais recentes', value: 'recent' },
  { label: 'Menor preço', value: 'price_asc' },
  { label: 'Maior preço', value: 'price_desc' },
  { label: 'Mais novos', value: 'year_desc' },
  { label: 'Menor quilometragem', value: 'mileage_asc' },
]
const activeCount = computed(() => [search.value, brand.value, model.value, minYear.value,
  maxYear.value, minPrice.value, maxPrice.value].filter(value => value !== null && value !== '').length)

function queryText(key: string): string {
  const value = route.query[key]
  return typeof value === 'string' ? value : ''
}
function queryNumber(key: string): number | null {
  const value = Number(queryText(key))
  return queryText(key) && Number.isFinite(value) ? value : null
}

onMounted(async () => {
  await loadFilters()
  search.value = queryText('search')
  const requestedBrand = queryText('brand')
  if (filters.value?.brands.includes(requestedBrand)) brand.value = requestedBrand
  await nextTick()
  const requestedModel = queryText('model')
  if (models.value.includes(requestedModel)) model.value = requestedModel
  await nextTick()
  const fromYear = queryNumber('minYear')
  const toYear = queryNumber('maxYear')
  if (fromYear && years.value.includes(fromYear)) minYear.value = fromYear
  if (toYear && years.value.includes(toYear)) maxYear.value = toYear
  minPrice.value = queryNumber('minPrice')
  maxPrice.value = queryNumber('maxPrice')
  const requestedSort = queryText('sort')
  if (sortOptions.some(option => option.value === requestedSort)) sort.value = requestedSort
  page.value = Math.max(1, queryNumber('page') ?? 1)
  await load()
})

async function applyFilters() {
  if (minYear.value && maxYear.value && minYear.value > maxYear.value) {
    filterError.value = 'O ano inicial precisa ser menor ou igual ao ano final.'
    return
  }
  if (minPrice.value !== null && maxPrice.value !== null && minPrice.value > maxPrice.value) {
    filterError.value = 'O valor mínimo precisa ser menor ou igual ao máximo.'
    return
  }
  filterError.value = ''
  page.value = 1
  showFilters.value = false
  await syncQuery()
  await load()
}

async function syncQuery() {
  await router.replace({ path: '/estoque', query: {
    search: search.value.trim() || undefined,
    brand: brand.value || undefined,
    model: model.value || undefined,
    minYear: minYear.value || undefined,
    maxYear: maxYear.value || undefined,
    minPrice: minPrice.value ?? undefined,
    maxPrice: maxPrice.value ?? undefined,
    sort: sort.value === 'recent' ? undefined : sort.value,
    page: page.value === 1 ? undefined : page.value,
  } })
}

async function clearFilters() {
  search.value = ''; brand.value = null; model.value = null
  minYear.value = null; maxYear.value = null; minPrice.value = null; maxPrice.value = null
  sort.value = 'recent'; page.value = 1; filterError.value = ''
  await syncQuery()
  await load()
}

async function changePage() {
  await syncQuery()
  await load()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <section class="inventory-page">
    <div class="inventory-intro container">
      <div><span class="section-label">TopCar Automóveis</span><h1>Encontre seu próximo carro</h1><p>Conheça os veículos disponíveis e fale com a nossa equipe pelo WhatsApp.</p></div>
      <div class="inventory-intro-icon"><q-icon name="directions_car" /></div>
    </div>
    <div class="container inventory-layout">
      <button class="mobile-filter-toggle" type="button" @click="showFilters = !showFilters"><q-icon name="tune" /> Filtros <span v-if="activeCount">{{ activeCount }}</span></button>
      <aside class="filter-panel" :class="{ 'filter-panel-open': showFilters }" aria-label="Filtros do estoque">
        <div class="filter-top"><div><span class="section-label">Refine sua busca</span><h2>Filtros</h2></div><button type="button" class="clear-link" @click="clearFilters">Limpar tudo</button></div>
        <form @submit.prevent="applyFilters">
          <label class="field-label" for="inventory-search">Buscar</label>
          <q-input id="inventory-search" v-model="search" placeholder="Digite sua busca..." outlined dense clearable><template #prepend><q-icon name="search" /></template></q-input>
          <div class="filter-divider"></div>
          <label class="field-label" for="inventory-brand">Marca</label>
          <q-select id="inventory-brand" v-model="brand" :options="filters?.brands ?? []" placeholder="Todas as marcas" outlined dense clearable :disable="!filters?.brands.length" />
          <label class="field-label" for="inventory-model">Modelo</label>
          <q-select id="inventory-model" v-model="model" :options="models" placeholder="Todos os modelos" outlined dense clearable :disable="!models.length" />
          <div class="filter-divider"></div>
          <span class="field-label">Ano do modelo</span>
          <div class="field-pair"><q-select v-model="minYear" :options="years" label="De" outlined dense clearable :disable="!years.length" /><q-select v-model="maxYear" :options="years" label="Até" outlined dense clearable :disable="!years.length" /></div>
          <div class="filter-divider"></div>
          <span class="field-label">Preço</span>
          <div class="field-pair"><q-input v-model.number="minPrice" type="number" min="0" step="1000" label="Mínimo (R$)" outlined dense clearable /><q-input v-model.number="maxPrice" type="number" min="0" step="1000" label="Máximo (R$)" outlined dense clearable /></div>
          <p v-if="filterError" class="form-error" role="alert">{{ filterError }}</p>
          <button type="submit" class="btn btn-red filter-submit">Aplicar filtros <q-icon name="arrow_forward" /></button>
        </form>
        <p class="filter-note">Marcas, modelos e anos refletem apenas veículos disponíveis no catálogo.</p>
      </aside>

      <div class="inventory-results">
        <div class="results-toolbar"><div><h2>{{ total }} {{ total === 1 ? 'veículo encontrado' : 'veículos encontrados' }}</h2><span>Explore o estoque atual da TopCar</span></div><q-select v-model="sort" :options="sortOptions" label="Ordenar por" emit-value map-options outlined dense @update:model-value="applyFilters" /></div>
        <div v-if="pending" class="state-panel"><q-spinner size="32px" color="primary" /><p>Carregando veículos…</p></div>
        <div v-else-if="error" class="state-panel" role="alert"><q-icon name="error_outline" /><h3>Não foi possível carregar o estoque</h3><p>{{ error }}</p><button class="btn btn-dark" type="button" @click="load">Tentar novamente</button></div>
        <div v-else-if="!vehicles.length" class="state-panel"><q-icon name="search_off" /><h3>Nenhum veículo encontrado</h3><p>Tente ajustar os filtros para ver mais opções.</p><button class="btn btn-dark" type="button" @click="clearFilters">Limpar filtros</button></div>
        <template v-else>
          <div class="vehicle-grid"><VehicleCard v-for="vehicle in vehicles" :key="vehicle.id" :vehicle="vehicle" /></div>
          <q-pagination v-if="pages > 1" v-model="page" :max="pages" :max-pages="7" direction-links color="primary" class="catalog-pagination" @update:model-value="changePage" />
        </template>
      </div>
    </div>
  </section>
</template>
