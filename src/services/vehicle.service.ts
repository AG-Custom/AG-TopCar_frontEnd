import { api } from '../boot/axios'
import type { PagedResult } from '../types/api/api'
import type { PublicVehicle, VehicleFilters } from '../types/entidades/vehicle'

export interface VehicleSearch {
  search?: string
  brand?: string
  model?: string
  minYear?: number
  maxYear?: number
  minPrice?: number
  maxPrice?: number
  page: number
  pageSize: number
  sort?: string
}

function withImageUrls(vehicle: PublicVehicle): PublicVehicle {
  return {
    ...vehicle,
    images: vehicle.images.map(image => ({
      ...image,
      url: new URL(image.url, api.defaults.baseURL).toString(),
    })),
  }
}

export const vehicleService = {
  async list(params: VehicleSearch): Promise<PagedResult<PublicVehicle>> {
    const { data } = await api.get<PagedResult<PublicVehicle>>('/api/veiculos', { params })
    return { ...data, items: data.items.map(withImageUrls) }
  },
  async filters(): Promise<VehicleFilters> {
    const { data } = await api.get<VehicleFilters>('/api/veiculos/filtros')
    return data
  },
  async detail(slug: string): Promise<PublicVehicle> {
    const { data } = await api.get<PublicVehicle>(`/api/veiculos/${encodeURIComponent(slug)}`)
    return withImageUrls(data)
  },
  async contact(): Promise<{ whatsAppUrl: string }> {
    const { data } = await api.get<{ whatsAppUrl: string }>('/api/contato')
    return data
  },
}
