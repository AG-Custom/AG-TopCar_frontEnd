import { api } from '../boot/axios'
import type { CarBrand } from '../types/entidades/brand'

export const brandService = {
  async list(): Promise<CarBrand[]> {
    const { data } = await api.get<CarBrand[]>('/api/marcas')
    return data
  },
}
