import { api } from '../boot/axios'

export interface CarBrand { name: string; slug: string; logoUrl: string }

export const brandService = {
  async list(): Promise<CarBrand[]> {
    const { data } = await api.get<CarBrand[]>('/api/marcas')
    return data
  },
}
