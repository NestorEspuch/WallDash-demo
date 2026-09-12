export const COLORS = [
  { id: 'morado', name: 'Morado', hex: '#9c6cb4' },
  { id: 'rojo', name: 'Rojo', hex: '#c47a7a' },
  { id: 'naranja', name: 'Naranja', hex: '#c49a7a' },
  { id: 'azul', name: 'Azul', hex: '#7a9ac4' },
  { id: 'verde', name: 'Verde', hex: '#7ac49a' },
  { id: 'mostaza', name: 'Mostaza', hex: '#b8a040' },
  { id: 'rosa', name: 'Rosa', hex: '#d47a9e' },
  { id: 'turquesa', name: 'Turquesa', hex: '#7ac4b8' },
]

export const DEFAULT_COLOR = 'morado'

export const MENSTRUATION_ID = '11111111-1111-1111-1111-111111111111'

const HEX_TO_ID = Object.fromEntries(COLORS.map(c => [c.hex, c.id]))

export function resolveColorId(raw) {
  return HEX_TO_ID[raw] || raw || DEFAULT_COLOR
}

export function colorVar(id) {
  return `var(--ev-${id || DEFAULT_COLOR})`
}
