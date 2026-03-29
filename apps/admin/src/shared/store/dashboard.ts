import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DashboardConfig {
  cards: {
    mrr: boolean
    tenants: boolean
    pdvs: boolean
    upsell: boolean
  }
  charts: {
    mrrHistory: boolean
    planRevenue: boolean
  }
  panels: {
    activity: boolean
    segments: boolean
    upsellList: boolean
  }
  mrrRange: '6m' | '12m'
}

interface DashboardStore {
  config: DashboardConfig
  setConfig: (patch: Partial<DashboardConfig>) => void
  toggleCard: (key: keyof DashboardConfig['cards']) => void
  toggleChart: (key: keyof DashboardConfig['charts']) => void
  togglePanel: (key: keyof DashboardConfig['panels']) => void
  setMrrRange: (range: DashboardConfig['mrrRange']) => void
  reset: () => void
}

const DEFAULT: DashboardConfig = {
  cards: { mrr: true, tenants: true, pdvs: true, upsell: true },
  charts: { mrrHistory: true, planRevenue: true },
  panels: { activity: true, segments: true, upsellList: true },
  mrrRange: '12m',
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      config: DEFAULT,

      setConfig: (patch) =>
        set((s) => ({ config: { ...s.config, ...patch } })),

      toggleCard: (key) =>
        set((s) => ({ config: { ...s.config, cards: { ...s.config.cards, [key]: !s.config.cards[key] } } })),

      toggleChart: (key) =>
        set((s) => ({ config: { ...s.config, charts: { ...s.config.charts, [key]: !s.config.charts[key] } } })),

      togglePanel: (key) =>
        set((s) => ({ config: { ...s.config, panels: { ...s.config.panels, [key]: !s.config.panels[key] } } })),

      setMrrRange: (range) =>
        set((s) => ({ config: { ...s.config, mrrRange: range } })),

      reset: () => set({ config: DEFAULT }),
    }),
    {
      name: 'admin-dashboard',
    }
  )
)
