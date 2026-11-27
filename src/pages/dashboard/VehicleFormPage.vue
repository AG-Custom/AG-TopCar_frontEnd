<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminVehicleService, type AdminVehicle, type VehicleInput } from '../../services/admin-vehicle.service'
import { getApiErrorMessage } from '../../utils/apiError'
import { useNotificacao } from '../../composables/useNotificacao'
import { brandService } from '../../services/brand.service'
import type { CarBrand } from '../../types/entidades/brand'
import { vehicleFeatureGroups, translateVehicleFeature } from '../../config/vehicleFeatures'
import { vehicleOptionsService, type VehicleOptions } from '../../services/vehicle-options.service'
import AdminPageHeader from '../../components/admin/AdminPageHeader.vue'
import { useAuth } from '../../composables/useAuth'

const route = useRoute()
const router = useRouter()
const notify = useNotificacao()
const { user } = useAuth()
const canPublish = computed(() => user.value?.permissions.includes('veiculos.publicar') ?? false)
const canMove = computed(() => user.value?.permissions.includes('estoque.movimentar') ?? false)
const id = computed(() => typeof route.params.id === 'string' ? route.params.id : null)
const current = ref<AdminVehicle | null>(null)
const loading = ref(false)
const saving = ref(false)
const imageBusy = ref(false)
const pendingImages = ref<Array<{ file: File; previewUrl: string }>>([])
const imageError = ref('')
const error = ref('')
const submitted = ref(false)
const options = ref<VehicleOptions>({ categories: [], fuels: [], transmissions: [] })
const allBrands = ref<CarBrand[]>([])
const brandOptions = ref<string[]>([])
function filterBrandOptions(value: string, update: (callback: () => void) => void) {
  update(() => { brandOptions.value = allBrands.value.map(item => item.name).filter(name => name.toLocaleLowerCase('pt-BR').includes(value.toLocaleLowerCase('pt-BR'))) })
}
const selectedFeatures = ref<string[]>([])
const featureSearch = ref('')
const customFeature = ref('')
const visibleFeatureGroups = computed(() => vehicleFeatureGroups.map(group => ({
  label: group.label, items: group.items.filter(item => item.toLocaleLowerCase('pt-BR').includes(featureSearch.value.trim().toLocaleLowerCase('pt-BR'))),
})).filter(group => group.items.length))
function toggleFeature(feature: string) {
  selectedFeatures.value = selectedFeatures.value.includes(feature)
    ? selectedFeatures.value.filter(item => item !== feature)
    : [...selectedFeatures.value, feature]
}
function addCustomFeature() {
  const value = translateVehicleFeature(customFeature.value)
  if (value && !selectedFeatures.value.some(item => item.toLocaleLowerCase('pt-BR') === value.toLocaleLowerCase('pt-BR'))) selectedFeatures.value.push(value)
  customFeature.value = ''
}
const movementReason = ref('')
const form = reactive<VehicleInput>({ internalCode: '', category: 'Carro', brand: '', model: '', version: '', manufactureYear: new Date().getFullYear(), modelYear: new Date().getFullYear(), mileage: 0, fuel: '', transmission: '', color: '', doors: 4, description: '', regularPrice: 0, promotionalPrice: null, features: [] })
const requiredText = (value: string) => submitted.value && !value.trim()
const requiredNumber = (value: number, min: number) => submitted.value &&
  (value === null || value === undefined || String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) < min)
const invalidPromotion = computed(() => submitted.value && form.promotionalPrice != null &&
  (Number(form.promotionalPrice) <= 0 || Number(form.promotionalPrice) >= Number(form.regularPrice)))
async function load() {
  if (!id.value) return
  loading.value = true
  try {
    current.value = await adminVehicleService.get(id.value)
    const vehicle = current.value
    for (const key of Object.keys(form) as (keyof VehicleInput)[]) (form as unknown as Record<string, unknown>)[key] = vehicle[key]
    selectedFeatures.value = [...new Set(vehicle.features.map(translateVehicleFeature))]
  } catch (cause) { error.value = getApiErrorMessage(cause) }
  finally { loading.value = false }
}
async function save() {
  error.value = ''
  submitted.value = true
  const input: VehicleInput = { ...form, internalCode: form.internalCode.trim(), brand: form.brand.trim(), model: form.model.trim(), features: selectedFeatures.value, promotionalPrice: form.promotionalPrice || null }
  if (!input.internalCode || !input.category || !input.brand || !input.model ||
      requiredNumber(input.manufactureYear, 1886) || requiredNumber(input.modelYear, 1886) || input.modelYear < input.manufactureYear || requiredNumber(input.mileage, 0) ||
      !input.fuel || !input.transmission || !input.color.trim() || requiredNumber(input.doors, 0) ||
      requiredNumber(input.regularPrice, 0.01) || invalidPromotion.value) {
    error.value = 'Revise os campos destacados em vermelho.'
    return
  }
  const publishOnSave = canPublish.value && (!id.value || (current.value?.statusPublicacao === 0 && current.value.situacaoEstoque === 0))
  if (publishOnSave && (current.value?.images.length ?? 0) + pendingImages.value.length === 0) {
    error.value = 'Selecione ao menos uma foto para publicar o veículo no catálogo.'
    return
  }
  saving.value = true
  try {
    const creating = !id.value
    const selectedCount = pendingImages.value.length
    const result = id.value ? await adminVehicleService.update(id.value, input) : await adminVehicleService.create(input)
    let uploadFailure: unknown = null
    for (const item of [...pendingImages.value]) {
      try {
        await adminVehicleService.uploadImage(result.id, item.file)
        URL.revokeObjectURL(item.previewUrl)
        pendingImages.value = pendingImages.value.filter(pending => pending !== item)
      } catch (cause) { uploadFailure = cause; break }
    }
    if (uploadFailure) {
      const message = `Veículo salvo, mas uma foto não foi enviada. ${getApiErrorMessage(uploadFailure)} ${creating ? 'Selecione novamente as fotos restantes.' : 'As fotos restantes continuam selecionadas para tentar novamente.'}`
      if (creating) {
        await router.replace(`/administracao/veiculos/${result.id}`)
        notify.erro(message)
      } else {
        error.value = message
        await load()
      }
      return
    }
    const shouldPublish = canPublish.value && result.situacaoEstoque === 0 && (creating || result.statusPublicacao === 0)
    if (shouldPublish) {
      try { await adminVehicleService.publish(result.id) }
      catch (cause) {
        const message = `Veículo e fotos salvos, mas não foi possível publicar no catálogo. ${getApiErrorMessage(cause)}`
        if (creating) {
          await router.replace(`/administracao/veiculos/${result.id}`)
          notify.erro(message)
        } else error.value = message
        return
      }
    }
    notify.sucesso(shouldPublish ? 'Veículo salvo e publicado no catálogo.' : selectedCount ? 'Veículo e fotos salvos.' : 'Veículo salvo.')
    await router.push('/administracao/veiculos')
  } catch (cause) { error.value = getApiErrorMessage(cause) }
  finally { saving.value = false }
}
function selectImages(event: Event) {
  const target = event.target as HTMLInputElement
  imageError.value = ''
  const types: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  for (const file of Array.from(target.files ?? [])) {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (types[extension] !== file.type || file.size === 0 || file.size > 10_000_000) {
      imageError.value = 'Use fotos JPG, PNG ou WebP com até 10 MB cada.'
      continue
    }
    if (pendingImages.value.some(item => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) continue
    pendingImages.value.push({ file, previewUrl: URL.createObjectURL(file) })
  }
  target.value = ''
}
function removePendingImage(index: number) {
  const [item] = pendingImages.value.splice(index, 1)
  if (item) URL.revokeObjectURL(item.previewUrl)
}
onBeforeUnmount(() => pendingImages.value.forEach(item => URL.revokeObjectURL(item.previewUrl)))
async function setPrimary(imageId: string) {
  if (!id.value || !current.value) return
  imageBusy.value = true
  try { await adminVehicleService.orderImages(id.value, current.value.images.map(image => ({ ...image, isPrimary: image.id === imageId }))); await load() }
  catch (cause) { notify.erro(getApiErrorMessage(cause)) }
  finally { imageBusy.value = false }
}
async function moveImage(index: number, direction: number) {
  if (!id.value || !current.value) return
  const images = [...current.value.images]
  const other = index + direction
  if (other < 0 || other >= images.length) return
  ;[images[index], images[other]] = [images[other]!, images[index]!]
  imageBusy.value = true
  try { await adminVehicleService.orderImages(id.value, images); await load() }
  catch (cause) { notify.erro(getApiErrorMessage(cause)) }
  finally { imageBusy.value = false }
}
async function removeImage(imageId: string) {
  if (!id.value) return
  imageBusy.value = true
  try { await adminVehicleService.removeImage(id.value, imageId); await load() }
  catch (cause) { notify.erro(getApiErrorMessage(cause)) }
  finally { imageBusy.value = false }
}
async function changePublication() {
  if (!id.value || !current.value) return
  saving.value = true
  try { if (current.value.statusPublicacao === 1) await adminVehicleService.hide(id.value); else await adminVehicleService.publish(id.value); await load(); notify.sucesso('Publicação atualizada.') }
  catch (cause) { notify.erro(getApiErrorMessage(cause)) }
  finally { saving.value = false }
}
async function returnToStock() {
  if (!id.value || !movementReason.value.trim()) return
  saving.value = true
  try { await adminVehicleService.movement(id.value, { type: 0, reason: movementReason.value.trim(), exitStatus: null, note: null }); movementReason.value = ''; await load(); notify.sucesso('Veículo retornou ao estoque.') }
  catch (cause) { notify.erro(getApiErrorMessage(cause)) }
  finally { saving.value = false }
}
onMounted(() => {
  void load()
  void brandService.list().then(items => { allBrands.value = items; brandOptions.value = items.map(item => item.name) }).catch(() => { error.value = 'Não foi possível carregar as marcas.' })
  void vehicleOptionsService.list().then(items => { options.value = items }).catch(() => { error.value = 'Não foi possível carregar as opções do veículo.' })
})
</script>

<template>
  <section class="admin-page vehicle-editor"><AdminPageHeader :title="id ? 'Editar veículo' : 'Novo veículo'" subtitle="Preencha as informações do veículo e salve o cadastro." :parent="{ label: 'Veículos', to: '/administracao/veiculos' }" /><p v-if="loading">Carregando…</p><p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <form class="editor-form" @submit.prevent="save">
      <h2>Identificação</h2>
      <div class="editor-grid">
        <q-input v-model="form.internalCode" outlined label="Código interno *" maxlength="40" :error="requiredText(form.internalCode)" error-message="Informe o código interno." />
        <q-select v-model="form.category" :options="options.categories" emit-value map-options outlined label="Categoria *" :error="submitted && !form.category" error-message="Selecione uma categoria." />
        <q-select v-model="form.brand" :options="brandOptions" use-input fill-input hide-selected input-debounce="0" behavior="menu" outlined label="Marca *" :error="requiredText(form.brand)" error-message="Selecione uma marca." @filter="filterBrandOptions" />
        <q-input v-model="form.model" outlined label="Modelo *" maxlength="80" :error="requiredText(form.model)" error-message="Informe o modelo." />
        <q-input v-model="form.version" outlined label="Versão" maxlength="120" />
      </div>
      <h2>Características</h2>
      <div class="editor-grid">
        <q-input v-model.number="form.manufactureYear" outlined type="number" label="Ano de fabricação *" :error="requiredNumber(form.manufactureYear, 1886)" error-message="Informe um ano válido." />
        <q-input v-model.number="form.modelYear" outlined type="number" label="Ano do modelo *" :error="submitted && (requiredNumber(form.modelYear, 1886) || form.modelYear < form.manufactureYear)" error-message="Informe um ano válido, igual ou posterior ao de fabricação." />
        <q-input v-model.number="form.mileage" outlined type="number" label="Quilometragem *" :error="requiredNumber(form.mileage, 0)" error-message="Informe a quilometragem." />
        <q-select v-model="form.fuel" :options="options.fuels" emit-value map-options outlined label="Combustível *" :error="submitted && !form.fuel" error-message="Selecione o combustível." />
        <q-select v-model="form.transmission" :options="options.transmissions" emit-value map-options outlined label="Câmbio *" :error="submitted && !form.transmission" error-message="Selecione o câmbio." />
        <q-input v-model="form.color" outlined label="Cor *" :error="requiredText(form.color)" error-message="Informe a cor." />
        <q-input v-model.number="form.doors" outlined type="number" label="Portas *" :error="requiredNumber(form.doors, 0)" error-message="Informe o número de portas." />
      </div>
      <h2>Detalhes do carro</h2>
      <q-input v-model="form.description" outlined type="textarea" label="Descrição (opcional)" maxlength="4000" />
      <p>Selecione as características presentes neste veículo.</p>
      <q-input v-model="featureSearch" outlined dense clearable label="Buscar característica" />
      <div class="feature-groups">
        <q-expansion-item v-for="group in visibleFeatureGroups" :key="group.label" :label="group.label" header-class="feature-group-header" expand-icon="expand_more" bordered>
          <div class="feature-options"><label v-for="feature in group.items" :key="feature"><input type="checkbox" :checked="selectedFeatures.includes(feature)" @change="toggleFeature(feature)" />{{ feature }}</label></div>
        </q-expansion-item>
      </div>
      <div class="feature-custom"><q-input v-model="customFeature" outlined dense maxlength="100" label="Outra característica" @keyup.enter.prevent="addCustomFeature" /><q-btn type="button" outline color="primary" label="Adicionar" :disable="!customFeature.trim()" @click="addCustomFeature" /></div>
      <div v-if="selectedFeatures.length" class="selected-features"><span v-for="feature in selectedFeatures" :key="feature">{{ feature }}</span></div>
      <h2>Valores</h2>
      <div class="editor-grid">
        <q-input v-model.number="form.regularPrice" outlined type="number" step="0.01" min="0" label="Preço regular (R$) *" :error="requiredNumber(form.regularPrice, 0.01)" error-message="Informe um preço maior que zero." />
        <q-input v-model.number="form.promotionalPrice" outlined type="number" step="0.01" min="0" label="Preço promocional (R$)" :error="invalidPromotion" error-message="O promocional deve ser maior que zero e menor que o regular.">
          <template #append><q-icon name="info_outline" class="promo-info" tabindex="0" aria-label="Sobre o preço promocional"><q-tooltip>Opcional. Quando informado, deve ser menor que o preço regular e será o valor exibido no catálogo.</q-tooltip></q-icon></template>
        </q-input>
      </div>
      <h2>Fotos</h2>
      <p>Selecione uma ou mais fotos. Elas serão enviadas ao bucket quando você salvar o veículo. {{ current?.images.length ? 'A foto principal atual será mantida.' : 'A primeira foto será a principal.' }}</p>
      <input class="editor-file-input" type="file" accept=".jpg,.jpeg,.png,.webp" multiple :disabled="saving || imageBusy" aria-label="Selecionar fotos do veículo" @change="selectImages" />
      <p v-if="imageError" class="form-error" role="alert">{{ imageError }}</p>
      <div v-if="pendingImages.length" class="editor-images">
        <div v-for="(item, index) in pendingImages" :key="item.previewUrl" class="editor-image">
          <img :src="item.previewUrl" :alt="`Prévia de ${item.file.name}`" />
          <div><span>{{ item.file.name }} · aguardando envio</span><button type="button" :disabled="saving" @click="removePendingImage(index)">Remover</button></div>
        </div>
      </div>
      <div v-if="current?.images.length" class="editor-images">
        <div v-for="(image, index) in current.images" :key="image.id" class="editor-image"><img :src="image.url" alt="Foto do veículo" /><div><span>{{ image.isPrimary ? 'Principal' : `Foto ${index + 1}` }}</span><button v-if="!image.isPrimary" type="button" :disabled="imageBusy || saving" @click="setPrimary(image.id)">Tornar principal</button><button type="button" :disabled="imageBusy || saving || index === 0" @click="moveImage(index, -1)">←</button><button type="button" :disabled="imageBusy || saving || index === current.images.length - 1" @click="moveImage(index, 1)">→</button><button type="button" :disabled="imageBusy || saving || (current.statusPublicacao === 1 && image.isPrimary)" @click="removeImage(image.id)">Remover</button></div></div>
      </div>
      <div class="editor-actions"><q-btn type="submit" color="primary" label="Salvar veículo" :loading="saving" :disable="imageBusy" /><q-btn v-if="current && canPublish" type="button" outline color="primary" :label="current.statusPublicacao === 1 ? 'Ocultar do site' : 'Publicar no site'" :loading="saving" :disable="imageBusy" @click="changePublication" /></div>
    </form>
    <section v-if="current && current.situacaoEstoque !== 0 && canMove" class="editor-section"><h2>Retorno ao estoque</h2><p>Registre a entrada para disponibilizar o veículo novamente.</p><div class="stock-search"><q-input v-model="movementReason" outlined label="Motivo da entrada" maxlength="200" /><q-btn color="primary" label="Registrar entrada" :disable="!movementReason.trim()" :loading="saving" @click="returnToStock" /></div></section>
  </section>
</template>
