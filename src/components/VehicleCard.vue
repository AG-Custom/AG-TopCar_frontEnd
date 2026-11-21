<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { PublicVehicle } from '../types/entidades/vehicle'
import { formatMileage, formatPrice } from '../utils/formatters'

const props = defineProps<{ vehicle: PublicVehicle }>()
const cover = computed(() => props.vehicle.images.find(image => image.isPrimary)?.url ?? props.vehicle.images[0]?.url)
</script>

<template>
  <RouterLink :to="`/vehicles/${vehicle.slug}`" class="vehicle-card">
    <div class="vehicle-card-media">
      <img v-if="cover" :src="cover" :alt="`${vehicle.brand} ${vehicle.model}`" loading="lazy" />
      <div v-else class="vehicle-no-image"><span>TopCar</span></div>
      <span v-if="vehicle.isDemo" class="card-tag card-tag-demo">Demonstração</span>
      <span v-else-if="vehicle.promotionalPrice" class="card-tag">Oferta</span>
    </div>
    <div class="vehicle-card-body">
      <span class="card-kicker">{{ vehicle.brand }}</span>
      <h3>{{ vehicle.model }} <span>{{ vehicle.version }}</span></h3>
      <div class="card-price">
        <del v-if="vehicle.promotionalPrice">{{ formatPrice(vehicle.regularPrice) }}</del>
        <strong>{{ formatPrice(vehicle.publicPrice) }}</strong>
      </div>
      <div class="card-specs">
        <span><q-icon name="event" /> {{ vehicle.manufactureYear }}/{{ vehicle.modelYear }}</span>
        <span><q-icon name="speed" /> {{ formatMileage(vehicle.mileage) }}</span>
      </div>
      <span class="card-link">Ver detalhes <q-icon name="arrow_forward" /></span>
    </div>
  </RouterLink>
</template>
