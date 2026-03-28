import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ButtonRadius = 'square' | 'rounded' | 'pill'

export interface BrandConfig {
  accentColor: string
  buttonRadius: ButtonRadius
}

interface BrandStore {
  config: BrandConfig
  setAccentColor: (color: string) => void
  setButtonRadius: (radius: ButtonRadius) => void
  reset: () => void
}

const DEFAULT_CONFIG: BrandConfig = {
  accentColor: '#E8A830',
  buttonRadius: 'rounded',
}

export const PRESET_COLORS = [
  { label: 'Âmbar',    value: '#E8A830' },
  { label: 'Índigo',   value: '#6366F1' },
  { label: 'Esmeralda', value: '#10B981' },
  { label: 'Rosa',     value: '#EC4899' },
  { label: 'Céu',      value: '#0EA5E9' },
  { label: 'Coral',    value: '#F97316' },
  { label: 'Violeta',  value: '#8B5CF6' },
  { label: 'Lima',     value: '#84CC16' },
]

export const RADIUS_OPTIONS: { label: string; value: ButtonRadius; px: string }[] = [
  { label: 'Quadrado', value: 'square',  px: '2px' },
  { label: 'Arredondado', value: 'rounded', px: '6px' },
  { label: 'Pill',     value: 'pill',    px: '999px' },
]

export const useBrandStore = create<BrandStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      setAccentColor: (color) =>
        set((s) => ({ config: { ...s.config, accentColor: color } })),
      setButtonRadius: (radius) =>
        set((s) => ({ config: { ...s.config, buttonRadius: radius } })),
      reset: () => set({ config: DEFAULT_CONFIG }),
    }),
    { name: 'admin-brand' }
  )
)

// ─── HELPERS ──────────────────────────────────────────────────────
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

export function applyBrand(config: BrandConfig) {
  const root = document.documentElement
  root.style.setProperty('--accent', config.accentColor)
  const [r, g, b] = hexToRgb(config.accentColor)
  root.style.setProperty('--accent-dim', `rgba(${r}, ${g}, ${b}, 0.12)`)
  const radii: Record<ButtonRadius, string> = { square: '2px', rounded: '6px', pill: '999px' }
  root.style.setProperty('--btn-radius', radii[config.buttonRadius])
}
