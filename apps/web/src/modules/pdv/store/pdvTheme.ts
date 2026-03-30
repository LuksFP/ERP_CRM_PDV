import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SegmentType } from '@/shared/types'

export type CardStyle = 'default' | 'glass' | 'solid'
export type ButtonShape = 'rounded' | 'sharp' | 'pill'

export interface PDVTheme {
  backgroundPreset: SegmentType | 'none' | 'custom'
  backgroundImageUrl: string
  backgroundOverlay: number   // 0–90
  cardStyle: CardStyle
  buttonShape: ButtonShape
  accentOverride: string       // '' = usa acento do tenant
  compactMode: boolean
}

export const SEGMENT_GRADIENTS: Record<SegmentType, { gradient: string; label: string; emoji: string }> = {
  pharmacy:    { gradient: 'linear-gradient(140deg,#061830 0%,#0a3d20 55%,#071520 100%)', label: 'Farmácia',     emoji: '💊' },
  supermarket: { gradient: 'linear-gradient(140deg,#051a08 0%,#0d4020 50%,#08280e 100%)', label: 'Supermercado', emoji: '🛒' },
  bakery:      { gradient: 'linear-gradient(140deg,#2a0e00 0%,#6b3010 55%,#3d1a00 100%)', label: 'Padaria',      emoji: '🥐' },
  butcher:     { gradient: 'linear-gradient(140deg,#1a0404 0%,#500c0c 55%,#2a0606 100%)', label: 'Açougue',      emoji: '🥩' },
  restaurant:  { gradient: 'linear-gradient(140deg,#120404 0%,#3a0808 50%,#1c0404 100%)', label: 'Restaurante',  emoji: '🍽️' },
  clothing:    { gradient: 'linear-gradient(140deg,#0e0520 0%,#2e104a 55%,#180530 100%)', label: 'Vestuário',    emoji: '👗' },
  electronics: { gradient: 'linear-gradient(140deg,#010510 0%,#081535 55%,#030a1a 100%)', label: 'Eletrônicos',  emoji: '💻' },
  other:       { gradient: 'linear-gradient(140deg,#080808 0%,#161625 55%,#0a0a12 100%)', label: 'Geral',        emoji: '🏪' },
}

export const DEFAULT_THEME: PDVTheme = {
  backgroundPreset: 'none',
  backgroundImageUrl: '',
  backgroundOverlay: 55,
  cardStyle: 'default',
  buttonShape: 'rounded',
  accentOverride: '',
  compactMode: false,
}

interface PDVThemeStore {
  theme: PDVTheme
  setTheme: (partial: Partial<PDVTheme>) => void
  resetTheme: () => void
}

export const usePDVThemeStore = create<PDVThemeStore>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      setTheme: (partial) => set((s) => ({ theme: { ...s.theme, ...partial } })),
      resetTheme: () => set({ theme: DEFAULT_THEME }),
    }),
    { name: 'pdv-theme-v1' },
  ),
)
