import { api } from '../boot/axios'
import type { PagedResult } from '../types/api/api'
import type { VehicleImage } from '../types/entidades/vehicle'

export interface AdminVehicle {
  id: string
  internalCode: string
  slug: string
  category: string
  brand: string
  model: string
  version: string
  manufactureYear: number
  modelYear: number
  mileage: number
  fuel: string
  transmission: string
  color: string
  doors: number
  description: string
  regularPrice: number
  promotionalPrice: number | null
  situacaoEstoque: number
  statusPublicacao: number
  status: 0 | 1 | 2 | null
  createdById: string
  createdAt: string
  updatedAt: string
  features: string[]
  images: VehicleImage[]
}

export interface VehicleInput {
  internalCode: string
  category: string
  brand: string
  model: string
  version: string
  manufactureYear: number
  modelYear: number
  mileage: number
  fuel: string
  transmission: string
  color: string
  doors: number
  description: string
  regularPrice: number
  promotionalPrice: number | null
  features: string[]
}

function imageUrl(url: string): string { return new URL(url, api.defaults.baseURL).toString() }
function normalize(vehicle: AdminVehicle): AdminVehicle {
  return { ...vehicle, images: vehicle.images.map(image => ({ ...image, url: imageUrl(image.url) })) }
}

export const adminVehicleService = {
  async list(page = 1, filters: { search?: string; brand?: string | null; status?: number | null } = {}): Promise<PagedResult<AdminVehicle>> {
    const { data } = await api.get<PagedResult<AdminVehicle>>('/api/administracao/veiculos', { params: {
      page, pageSize: 20, search: filters.search || undefined, brand: filters.brand || undefined, status: filters.status ?? undefined,
    } })
    return { ...data, items: data.items.map(normalize) }
  },
  async statuses(): Promise<Array<{ value: number; label: string }>> {
    const { data } = await api.get<Array<{ value: number; label: string }>>('/api/administracao/veiculos/status')
    return data
  },
  async get(id: string): Promise<AdminVehicle> {
    const { data } = await api.get<AdminVehicle>(`/api/administracao/veiculos/${id}`)
    return normalize(data)
  },
  async create(input: VehicleInput): Promise<AdminVehicle> {
    const { data } = await api.post<AdminVehicle>('/api/administracao/veiculos', input)
    return normalize(data)
  },
  async update(id: string, input: VehicleInput): Promise<AdminVehicle> {
    const { data } = await api.put<AdminVehicle>(`/api/administracao/veiculos/${id}`, input)
    return normalize(data)
  },
  async publish(id: string): Promise<void> { await api.post(`/api/administracao/veiculos/${id}/publicar`) },
  async hide(id: string): Promise<void> { await api.post(`/api/administracao/veiculos/${id}/ocultar`) },
  async uploadImage(id: string, file: File): Promise<void> {
    const form = new FormData()
    form.append('file', file)
    await api.post(`/api/administracao/veiculos/${id}/imagens`, form)
  },
  async orderImages(id: string, images: VehicleImage[]): Promise<void> {
    await api.put(`/api/administracao/veiculos/${id}/imagens/ordem`, images.map((image, sortOrder) => ({ id: image.id, sortOrder, isPrimary: image.isPrimary })))
  },
  async removeImage(id: string, imageId: string): Promise<void> { await api.delete(`/api/administracao/veiculos/${id}/imagens/${imageId}`) },
  async movement(id: string, input: { type: 0 | 1; reason: string; exitStatus: 1 | 2 | null; note: string | null }): Promise<void> {
    await api.post(`/api/administracao/veiculos/${id}/movimentacoes`, input)
  },
}
