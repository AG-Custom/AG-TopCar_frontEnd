import { computed, ref, watch } from 'vue'
import { vehicleService } from '../services/vehicle.service'
import type { PublicVehicle, VehicleFilters } from '../types/entidades/vehicle'
import { getApiErrorMessage } from '../utils/apiError'

export function useCatalogo() {
  const vehicles = ref<PublicVehicle[]>([])
  const filters = ref<VehicleFilters | null>(null)
  const total = ref(0)
  const pending = ref(false)
  const error = ref('')
  const page = ref(1)
  const search = ref('')
  const brand = ref<string | null>(null)
  const model = ref<string | null>(null)
  const minYear = ref<number | null>(null)
  const maxYear = ref<number | null>(null)
  const minPrice = ref<number | null>(null)
  const maxPrice = ref<number | null>(null)
  const sort = ref('recent')
  const models = computed(() => [...new Set((filters.value?.combinations ?? [])
    .filter(item => !brand.value || item.brand === brand.value).map(item => item.model))].sort())
  const years = computed(() => [...new Set((filters.value?.combinations ?? [])
    .filter(item => (!brand.value || item.brand === brand.value) && (!model.value || item.model === model.value))
    .map(item => item.year))].sort((a, b) => b - a))

  watch(brand, () => { model.value = null; minYear.value = null; maxYear.value = null })
  watch(model, () => { minYear.value = null; maxYear.value = null })

  async function load() {
    pending.value = true
    error.value = ''
    try {
      const result = await vehicleService.list({
        search: search.value || undefined,
        brand: brand.value || undefined,
        model: model.value || undefined,
        minYear: minYear.value || undefined,
        maxYear: maxYear.value || undefined,
        minPrice: minPrice.value ?? undefined,
        maxPrice: maxPrice.value ?? undefined,
        page: page.value,
        pageSize: 12,
        sort: sort.value === 'recent' ? undefined : sort.value,
      })
      vehicles.value = result.items
      total.value = result.total
    } catch (cause) {
      error.value = getApiErrorMessage(cause)
      vehicles.value = []
      total.value = 0
    } finally {
      pending.value = false
    }
  }

  async function loadFilters() {
    try { filters.value = await vehicleService.filters() }
    catch { filters.value = null }
  }

  return { vehicles, filters, total, pending, error, page, search, brand, model,
    minYear, maxYear, minPrice, maxPrice, sort, models, years, load, loadFilters }
}
