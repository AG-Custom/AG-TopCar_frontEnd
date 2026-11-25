import type { UserInput } from '../services/users.service'

export interface UserFormErrors {
  name?: string
  email?: string
  whatsApp?: string
  role?: string
  password?: string
}

export function validateUserInput(input: UserInput, isNew: boolean): UserFormErrors {
  const errors: UserFormErrors = {}
  const name = input.name.trim()
  const email = input.email.trim()
  const phone = input.whatsApp?.trim() ?? ''

  if (!name) errors.name = 'Informe o nome.'
  else if (name.length > 150) errors.name = 'O nome deve ter no máximo 150 caracteres.'

  if (!email || !/^[^\s@]+@[^\s@]+$/.test(email)) errors.email = 'Informe um e-mail válido.'
  if (phone && (phone.length > 30 || !/^\d{10,15}$/.test(phone.replace(/\D/g, '')))) {
    errors.whatsApp = 'Informe um WhatsApp com 10 a 15 dígitos, incluindo o DDD.'
  }
  if (input.role !== 'Administrador' && input.role !== 'Vendedor') errors.role = 'Selecione um perfil válido.'

  if (isNew) {
    const password = input.password ?? ''
    const missing: string[] = []
    if (password.length < 12) missing.push('12 caracteres')
    if (!/\p{Lu}/u.test(password)) missing.push('uma letra maiúscula')
    if (!/\p{Ll}/u.test(password)) missing.push('uma letra minúscula')
    if (!/\p{Nd}/u.test(password)) missing.push('um número')
    if (!/[^\p{L}\p{N}]/u.test(password)) missing.push('um símbolo')
    if (missing.length) errors.password = `A senha precisa ter pelo menos ${missing.join(', ')}.`
  }

  return errors
}
