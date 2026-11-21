import { useQuasar } from 'quasar'

export function useNotificacao() {
  const quasar = useQuasar()

  return {
    sucesso(message: string) { quasar.notify({ type: 'positive', message }) },
    erro(message: string) { quasar.notify({ type: 'negative', message }) },
  }
}
