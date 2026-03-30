/**
 * Flash promotions store.
 * Promotions are time-boxed discounts that auto-apply in the PDV.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PromotionTarget = 'all' | 'category' | 'product'

export interface Promotion {
  id: string
  name: string
  discount: number          // percentage (1-100)
  target: PromotionTarget
  targetValue?: string      // category name or product ID when target !== 'all'
  startsAt: string          // ISO string
  endsAt: string            // ISO string
  active: boolean
}

interface PromotionsStore {
  promotions: Promotion[]
  addPromotion: (p: Omit<Promotion, 'id' | 'active'>) => void
  togglePromotion: (id: string) => void
  removePromotion: (id: string) => void
  getActiveForProduct: (productId: string, category: string) => Promotion | undefined
}

export const usePromotionsStore = create<PromotionsStore>()(
  persist(
    (set, get) => ({
      promotions: [],

      addPromotion: (p) =>
        set((s) => ({
          promotions: [
            ...s.promotions,
            { ...p, id: `promo_${Date.now()}`, active: true },
          ],
        })),

      togglePromotion: (id) =>
        set((s) => ({
          promotions: s.promotions.map((p) =>
            p.id === id ? { ...p, active: !p.active } : p,
          ),
        })),

      removePromotion: (id) =>
        set((s) => ({ promotions: s.promotions.filter((p) => p.id !== id) })),

      getActiveForProduct: (productId, category) => {
        const now = Date.now()
        return get().promotions.find((p) => {
          if (!p.active) return false
          const start = new Date(p.startsAt).getTime()
          const end   = new Date(p.endsAt).getTime()
          if (now < start || now > end) return false
          if (p.target === 'all') return true
          if (p.target === 'category') return p.targetValue === category
          if (p.target === 'product')  return p.targetValue === productId
          return false
        })
      },
    }),
    { name: 'pdv-promotions-v1' },
  ),
)
