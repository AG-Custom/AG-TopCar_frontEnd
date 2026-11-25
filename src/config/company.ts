const address = 'Av. Paulo Pereira Gomes, 835 - Morada de Laranjeiras'
const whatsAppMessage = 'Olá! Vim pelo site da TopCar e gostaria de saber mais sobre os carros disponíveis.'
const whatsAppNumber = '5527997196600'

export function createWhatsAppUrl(message: string): string {
  return `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`
}

export const company = {
  name: 'TopCar Automóveis',
  phoneDisplay: '(27) 99719-6600',
  phoneHref: 'tel:+5527997196600',
  whatsAppUrl: createWhatsAppUrl(whatsAppMessage),
  address,
  mapsUrl: 'https://www.google.com/maps/place/TopCar+Automoveis/@-20.1966383,-40.2373105,231m/data=!3m1!1e3!4m15!1m8!3m7!1s0xb81e9757f33527:0x845d25866e9a8c18!2sAv.+Paulo+Pereira+Gomes,+835+-+Morada+de+Laranjeiras,+Serra+-+ES,+29166-828!3b1!8m2!3d-20.1964154!4d-40.2374274!16s%2Fg%2F11kb56vy0x!3m5!1s0xb81f6d1c608e8b:0x252ec578a8a4f270!8m2!3d-20.1966088!4d-40.2373036!16s%2Fg%2F11h0xz45h4?entry=ttu&g_ep=EgoyMDI2MTEyMi4wIKXMDSoASAFQAw%3D%3D',
  instagramUrl: 'https://www.instagram.com/topcarautomoveis_es/',
  facebookUrl: 'https://www.facebook.com/topcar.automoveis2019/',
  hours: 'Segunda a sexta, 08h às 18h · Sábado, 08h às 14h',
}
