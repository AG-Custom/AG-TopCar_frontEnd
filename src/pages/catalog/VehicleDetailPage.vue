<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { vehicleService } from '../../services/vehicle.service'
import type { PublicVehicle } from '../../types/entidades/vehicle'
import { getApiErrorMessage } from '../../utils/apiError'
import { formatMileage, formatPrice } from '../../utils/formatters'
import { translateVehicleFeature } from '../../config/vehicleFeatures'
import { createWhatsAppUrl } from '../../config/company'

const route = useRoute()
const vehicle = ref<PublicVehicle | null>(null)
const pending = ref(true)
const error = ref('')
const activeImage = ref(0)
const images = computed(() => [...(vehicle.value?.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder))
const title = computed(() => vehicle.value ? `${vehicle.value.brand} ${vehicle.value.model}` : '')
const contactUrl = computed(() => {
  const current = vehicle.value
  if (!current) return ''
  if (!current.isDemo && current.whatsAppUrl) return current.whatsAppUrl
  const name = `${current.brand} ${current.model} ${current.version}`.trim()
  const year = `${current.manufactureYear}/${current.modelYear}`
  const message = current.isDemo
    ? `Olá! Vim pelo site da TopCar e gostaria de mais informações sobre o ${name}, ano ${year}. Vi esse exemplo no catálogo e gostaria de saber se há uma opção disponível ou semelhante.`
    : `Olá! Vim pelo site da TopCar e gostaria de mais informações sobre o ${name}, ano ${year}.`
  return createWhatsAppUrl(message)
})

function changeImage(direction: number) {
  if (images.value.length < 2) return
  activeImage.value = (activeImage.value + direction + images.value.length) % images.value.length
}

async function load() {
  pending.value = true
  error.value = ''
  activeImage.value = 0
  try { vehicle.value = await vehicleService.detail(String(route.params.slug)) }
  catch (cause) { vehicle.value = null; error.value = getApiErrorMessage(cause) }
  finally { pending.value = false }
}

onMounted(load)
watch(() => route.params.slug, load)
</script>

<template>
  <section class="detail-page container">
    <nav class="breadcrumbs" aria-label="Caminho"><RouterLink to="/">Início</RouterLink><q-icon name="chevron_right" /><RouterLink to="/estoque">Estoque</RouterLink><q-icon name="chevron_right" /><span>{{ title || 'Veículo' }}</span></nav>
    <div v-if="pending" class="state-panel"><q-spinner size="32px" color="primary" /><p>Carregando veículo…</p></div>
    <div v-else-if="error" class="state-panel" role="alert"><q-icon name="error_outline" /><h2>Não foi possível abrir este veículo</h2><p>{{ error }}</p><RouterLink to="/estoque" class="btn btn-dark">Voltar ao estoque</RouterLink></div>
    <template v-else-if="vehicle">
      <div class="detail-heading"><div><span class="section-label">{{ vehicle.isDemo ? 'Veículo de demonstração' : 'Disponível no estoque' }}</span><h1>{{ title }}</h1><p>{{ vehicle.version }} · {{ vehicle.manufactureYear }}/{{ vehicle.modelYear }}</p></div><span v-if="vehicle.promotionalPrice && !vehicle.isDemo" class="detail-offer">Preço especial</span></div>
      <div class="detail-grid">
        <div>
          <div class="detail-main-image">
            <img v-if="images[activeImage]" :src="images[activeImage]?.url" :alt="`${title}, foto ${activeImage + 1} de ${images.length}`" />
            <div v-else class="vehicle-no-image">TopCar</div>
            <template v-if="images.length > 1">
              <button type="button" class="gallery-arrow gallery-arrow-prev" aria-label="Foto anterior" @click="changeImage(-1)"><q-icon name="chevron_left" /></button>
              <button type="button" class="gallery-arrow gallery-arrow-next" aria-label="Próxima foto" @click="changeImage(1)"><q-icon name="chevron_right" /></button>
              <span class="gallery-counter" aria-live="polite">{{ activeImage + 1 }} / {{ images.length }}</span>
            </template>
          </div>
          <div v-if="images.length > 1" class="detail-thumbs"><button v-for="(image, index) in images" :key="image.id" type="button" :class="{ active: index === activeImage }" :aria-label="`Ver foto ${index + 1}`" @click="activeImage = index"><img :src="image.url" :alt="`${title}, miniatura ${index + 1}`" /></button></div>
          <div class="detail-section"><h2>Ficha técnica</h2><div class="spec-grid"><div><span>Marca</span><strong>{{ vehicle.brand }}</strong></div><div><span>Modelo</span><strong>{{ vehicle.model }}</strong></div><div><span>Ano</span><strong>{{ vehicle.manufactureYear }}/{{ vehicle.modelYear }}</strong></div><div><span>Quilometragem</span><strong>{{ formatMileage(vehicle.mileage) }}</strong></div><div><span>Combustível</span><strong>{{ vehicle.fuel }}</strong></div><div><span>Câmbio</span><strong>{{ vehicle.transmission }}</strong></div><div><span>Cor</span><strong>{{ vehicle.color }}</strong></div><div><span>Portas</span><strong>{{ vehicle.doors }}</strong></div></div></div>
          <div v-if="vehicle.description || vehicle.features.length" class="detail-section"><h2>Detalhes do carro</h2><p v-if="vehicle.description" class="vehicle-description">{{ vehicle.description }}</p><div v-if="vehicle.features.length" class="feature-list"><span v-for="feature in vehicle.features" :key="feature"><q-icon name="check_circle" /> {{ translateVehicleFeature(feature) }}</span></div></div>
        </div>
        <aside class="detail-contact-card"><span class="section-label">{{ vehicle.isDemo ? 'Exemplo de catálogo' : 'Seu próximo carro' }}</span><del v-if="vehicle.promotionalPrice">{{ formatPrice(vehicle.regularPrice) }}</del><strong class="detail-price">{{ formatPrice(vehicle.publicPrice) }}</strong><p v-if="vehicle.isDemo">Este cadastro é ilustrativo. Foto, dados e preço não representam uma oferta real.</p><p v-else>Gostou deste veículo? Converse com a TopCar e tire suas dúvidas sem compromisso.</p><a :href="contactUrl" target="_blank" rel="noopener noreferrer" class="btn btn-red"><q-icon name="chat" /> Entrar em contato</a><span class="detail-contact-note">{{ vehicle.isDemo ? 'Confirme com a equipe se há esse modelo ou opções semelhantes disponíveis.' : 'O atendimento continua pelo WhatsApp. Não há compra pelo site.' }}</span></aside>
      </div>
    </template>
  </section>
</template>
