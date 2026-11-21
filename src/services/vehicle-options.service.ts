import { api } from '../boot/axios'

export interface VehicleOption { value: string; label: string }
export interface VehicleOptions {
  categories: VehicleOption[]
  fuels: VehicleOption[]
  transmissions: VehicleOption[]
}

export const vehicleOptionsService = {
  async list(): Promise<VehicleOptions> {
    const { data } = await api.get<VehicleOptions>('/api/veiculos/opcoes')
    return data
  },
}
