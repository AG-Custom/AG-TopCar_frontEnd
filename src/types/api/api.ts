export interface ValidationProblemDetails {
  type?: string
  title: string
  status: number
  code?: string
  traceId?: string
  errors?: Record<string, string[]>
}

export interface PagedResult<T> {
  items: T[]
  total: number
  pageNumber: number
  pageSize: number
}
