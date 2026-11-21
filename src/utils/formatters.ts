const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const integer = new Intl.NumberFormat('pt-BR')

export const formatPrice = (value: number) => currency.format(value)
export const formatMileage = (value: number) => `${integer.format(value)} km`
