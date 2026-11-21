import axios from 'axios'
import type { ValidationProblemDetails } from '../types/api/api'

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ValidationProblemDetails>(error)) {
    return error.response?.data?.title || 'Não foi possível concluir a operação.'
  }
  return 'Não foi possível concluir a operação.'
}
