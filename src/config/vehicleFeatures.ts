// Nomes exibidos no catálogo e sugestões do cadastro. Não são códigos da Webmotors.
export const vehicleFeatureGroups = [
  { label: 'Conforto', items: ['Ar-condicionado', 'Ar-condicionado digital', 'Ar-condicionado de duas zonas', 'Direção elétrica', 'Direção hidráulica', 'Vidros elétricos', 'Travas elétricas', 'Retrovisores elétricos', 'Bancos de couro', 'Ajuste elétrico dos bancos', 'Bancos aquecidos', 'Teto solar', 'Piloto automático', 'Chave presencial', 'Partida por botão', 'Porta-malas elétrico'] },
  { label: 'Segurança', items: ['Freios ABS', 'Airbags frontais', 'Airbags laterais', 'Airbags de cortina', 'Controle de estabilidade', 'Controle de tração', 'Assistente de partida em rampa', 'Frenagem automática de emergência', 'Alerta de colisão', 'Alerta de ponto cego', 'Alerta de saída de faixa', 'Assistente de permanência em faixa', 'Sensor de estacionamento traseiro', 'Sensor de estacionamento dianteiro', 'Câmera de ré', 'Câmera 360°', 'Isofix', 'Monitoramento da pressão dos pneus'] },
  { label: 'Tecnologia', items: ['Central multimídia', 'Android Auto', 'Apple CarPlay', 'Bluetooth', 'Carregador por indução', 'GPS integrado', 'Painel digital', 'Computador de bordo', 'Sistema de som premium', 'Comandos no volante', 'Entrada USB'] },
  { label: 'Exterior', items: ['Faróis de LED', 'Luzes diurnas de LED', 'Faróis de neblina', 'Rodas de liga leve', 'Sensor de chuva', 'Sensor crepuscular', 'Rack de teto', 'Capota marítima', 'Engate para reboque', 'Retrovisores rebatíveis'] },
  { label: 'Histórico e conservação', items: ['Único dono', 'Manual do proprietário', 'Chave reserva', 'Laudo cautelar aprovado', 'Revisões em dia', 'Garantia de fábrica', 'Licenciado', 'IPVA pago'] },
] as const

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const aliases: Record<string, string> = {
  'air conditioning': 'Ar-condicionado', 'air conditioner': 'Ar-condicionado', 'automatic climate control': 'Ar-condicionado digital',
  'dual zone climate control': 'Ar-condicionado de duas zonas', 'power steering': 'Direção hidráulica', 'electric power steering': 'Direção elétrica',
  'power windows': 'Vidros elétricos', 'power locks': 'Travas elétricas', 'power mirrors': 'Retrovisores elétricos',
  'leather seats': 'Bancos de couro', 'bancos em couro': 'Bancos de couro', 'sunroof': 'Teto solar',
  'cruise control': 'Piloto automático', 'adaptive cruise control': 'Piloto automático', 'keyless entry': 'Chave presencial',
  'push button start': 'Partida por botão', 'abs': 'Freios ABS', 'abs brakes': 'Freios ABS',
  'front airbags': 'Airbags frontais', 'side airbags': 'Airbags laterais', 'curtain airbags': 'Airbags de cortina',
  'electronic stability control': 'Controle de estabilidade', 'traction control': 'Controle de tração',
  'hill start assist': 'Assistente de partida em rampa', 'automatic emergency braking': 'Frenagem automática de emergência',
  'blind spot monitor': 'Alerta de ponto cego', 'lane departure warning': 'Alerta de saída de faixa',
  'parking sensors': 'Sensor de estacionamento traseiro', 'rear parking sensors': 'Sensor de estacionamento traseiro',
  'rear camera': 'Câmera de ré', 'reversing camera': 'Câmera de ré', 'backup camera': 'Câmera de ré',
  'multimedia center': 'Central multimídia', 'infotainment': 'Central multimídia', 'wireless charging': 'Carregador por indução',
  'navigation': 'GPS integrado', 'digital cluster': 'Painel digital', 'onboard computer': 'Computador de bordo',
  'led headlights': 'Faróis de LED', 'alloy wheels': 'Rodas de liga leve', 'rain sensor': 'Sensor de chuva',
  'roof rack': 'Rack de teto', 'one owner': 'Único dono', 'service history': 'Revisões em dia',
}

const canonical = new Map(vehicleFeatureGroups.flatMap(group => group.items.map(item => [normalize(item), item] as const)))

export function translateVehicleFeature(value: string): string {
  const key = normalize(value)
  return canonical.get(key) ?? aliases[key] ?? value.trim()
}
