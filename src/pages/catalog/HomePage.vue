<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import VehicleCard from '../../components/VehicleCard.vue'
import { vehicleService } from '../../services/vehicle.service'
import { brandService } from '../../services/brand.service'
import type { CarBrand } from '../../types/entidades/brand'
import type { PublicVehicle, VehicleFilters } from '../../types/entidades/vehicle'

const router = useRouter()
const filters = ref<VehicleFilters | null>(null)
const allBrands = ref<CarBrand[]>([])
const normalizeBrand = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR')
const brandIndex = computed(() => new Map(allBrands.value.map(item => [normalizeBrand(item.name), item])))
const logoForBrand = (name: string) => brandIndex.value.get(normalizeBrand(name))
const failedLogos = ref(new Set<string>())
function onLogoError(name: string) {
  failedLogos.value = new Set([...failedLogos.value, normalizeBrand(name)])
}
const featured = ref<PublicVehicle[]>([])
const offers = computed(() => [...featured.value].sort((a, b) => Number(Boolean(b.promotionalPrice)) - Number(Boolean(a.promotionalPrice))).slice(0, 3))
const demoCatalog = computed(() => featured.value.length > 0 && featured.value.every(vehicle => vehicle.isDemo))
const brand = ref<string | null>(null)
const model = ref<string | null>(null)
const year = ref<number | null>(null)
const search = ref('')
const models = computed(() => [...new Set((filters.value?.combinations ?? [])
  .filter(item => !brand.value || item.brand === brand.value).map(item => item.model))].sort())
const years = computed(() => [...new Set((filters.value?.combinations ?? [])
  .filter(item => (!brand.value || item.brand === brand.value) && (!model.value || item.model === model.value))
  .map(item => item.year))].sort((a, b) => b - a))

watch(brand, () => { model.value = null; year.value = null })
watch(model, () => { year.value = null })

function submitSearch() {
  void router.push({ path: '/estoque', query: {
    search: search.value.trim() || undefined,
    brand: brand.value || undefined,
    model: model.value || undefined,
    minYear: year.value || undefined,
    maxYear: year.value || undefined,
  } })
}

onMounted(async () => {
  const [filterResult, vehicleResult, brandResult] = await Promise.allSettled([
    vehicleService.filters(), vehicleService.list({ page: 1, pageSize: 9 }), brandService.list(),
  ])
  if (filterResult.status === 'fulfilled') filters.value = filterResult.value
  if (vehicleResult.status === 'fulfilled') featured.value = vehicleResult.value.items
  if (brandResult.status === 'fulfilled') allBrands.value = brandResult.value
})
</script>

<template>
  <div class="home-page">
    <section class="hero">
      <div class="container hero-content">
        <div class="hero-copy">
          <h1>O próximo capítulo começa no <em>carro certo.</em></h1>
          <p>Encontre seu próximo veículo com informação clara, boas oportunidades e atendimento de verdade.</p>
          <RouterLink to="/estoque" class="btn btn-red">Explorar estoque <q-icon name="arrow_forward" /></RouterLink>
        </div>
      </div>
      <div class="hero-photo" aria-hidden="true"></div>
    </section>

    <div class="container hero-search-wrap">
      <form class="hero-search" @submit.prevent="submitSearch">
        <div class="hero-search-heading"><q-icon name="search" /><div><strong>Encontre o seu próximo carro</strong><span>Busque entre os veículos disponíveis</span></div></div>
        <div class="hero-search-fields">
          <q-input v-model="search" placeholder="Digite sua busca" outlined dense clearable />
          <q-select v-model="brand" :options="filters?.brands ?? []" label="Marca" outlined dense clearable :disable="!filters?.brands.length" />
          <q-select v-model="model" :options="models" label="Modelo" outlined dense clearable :disable="!models.length" />
          <q-select v-model="year" :options="years" label="Ano" outlined dense clearable :disable="!years.length" />
          <button type="submit" class="btn btn-dark">Buscar <q-icon name="arrow_forward" /></button>
        </div>
      </form>
    </div>

    <section v-if="filters?.brands.length" class="section container brand-section">
      <div class="section-heading"><div><span class="section-label">Explore por marca</span><h2>Qual marca combina com você?</h2></div><RouterLink to="/estoque" class="text-link">Ver todo o estoque <q-icon name="arrow_forward" /></RouterLink></div>
      <div class="brand-list"><RouterLink v-for="item in filters.brands" :key="item" :to="{ path: '/estoque', query: { brand: item } }" class="brand-pill"><img v-if="logoForBrand(item)?.logoUrl && !failedLogos.has(normalizeBrand(item))" :src="logoForBrand(item)?.logoUrl ?? undefined" :alt="`Logo ${item}`" @error="onLogoError(item)" /><strong>{{ item }}</strong><q-icon name="arrow_outward" /></RouterLink></div>
    </section>

    <section v-if="offers.length" class="section offers-section">
      <div class="container"><div class="section-heading"><div><span class="section-label">{{ demoCatalog ? 'Prévia do catálogo' : 'Destaques do estoque' }}</span><h2>{{ demoCatalog ? 'Veja como ficará o estoque' : 'Encontre seu próximo carro' }}</h2><p>{{ demoCatalog ? 'Veículos ilustrativos para demonstrar a experiência do site.' : 'Conheça alguns veículos disponíveis no catálogo.' }}</p></div><RouterLink to="/estoque" class="text-link">Ver mais <q-icon name="arrow_forward" /></RouterLink></div>
        <div class="vehicle-grid"><VehicleCard v-for="vehicle in offers" :key="vehicle.id" :vehicle="vehicle" /></div>
      </div>
    </section>

  </div>
</template>
