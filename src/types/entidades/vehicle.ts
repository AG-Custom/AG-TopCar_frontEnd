export interface VehicleImage {
  id: string
  url: string
  sortOrder: number
  isPrimary: boolean
}

export interface PublicVehicle {
  id: string
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
  publicPrice: number
  discountPercent: number | null
  features: string[]
  images: VehicleImage[]
  whatsAppUrl: string
  isDemo: boolean
}

export interface VehicleFilters {
  categories: string[]
  brands: string[]
  models: string[]
  fuels: string[]
  transmissions: string[]
  colors: string[]
  features: string[]
  combinations: { brand: string; model: string; year: number }[]
}
