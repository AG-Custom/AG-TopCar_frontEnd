import { api } from '../boot/axios'
import type { PagedResult } from '../types/api/api'

export interface StockVehicle {
  id: string
  internalCode: string
  brand: string
  model: string
  version: string
  modelYear: number
  situacaoEstoque: number
  statusPublicacao: number
}

export interface BatchExitInput {
  vehicleIds: string[]
  reason: string
  exitStatus: 1 | 2 | 3
  note: string | null
}

export interface StockOption { value: number; label: string }
export interface StockOptions { statuses: StockOption[]; exitStatuses: StockOption[] }
export interface AdminFilters { brands: string[]; years: number[] }
export interface StockQuery { search?: string; brand?: string | null; year?: number | null; stockStatus?: number | null }

export const stockService = {
  async list(page: number, filters: StockQuery = {}): Promise<PagedResult<StockVehicle>> {
    const { data } = await api.get<PagedResult<StockVehicle>>('/api/administracao/veiculos', {
      params: { page, pageSize: 20, search: filters.search || undefined, brand: filters.brand || undefined,
        year: filters.year ?? undefined, stockStatus: filters.stockStatus ?? undefined, includeArchived: true },
    })
    return data
  },
  async options(): Promise<StockOptions> { const { data } = await api.get<StockOptions>('/api/administracao/veiculos/opcoes-estoque'); return data },
  async filters(includeArchived = true): Promise<AdminFilters> {
    const { data } = await api.get<AdminFilters>('/api/administracao/veiculos/filtros-administrativos', { params: { includeArchived } })
    return data
  },
  async exitMany(input: BatchExitInput): Promise<void> {
    await api.post('/api/administracao/veiculos/movimentacoes/lote', input)
  },
}
