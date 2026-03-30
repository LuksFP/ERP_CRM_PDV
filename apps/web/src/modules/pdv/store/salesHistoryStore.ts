import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaymentMethod } from '@/shared/types'
import type { CartItem } from './pdvCartStore'

export interface SaleRecord {
  id: string
  items: CartItem[]
  subtotal: number
  globalDiscount: number
  total: number
  paymentMethod: PaymentMethod
  cashReceived?: number
  change?: number
  isTraining: boolean
  timestamp: string
  pdvId: string
}

interface SalesHistoryStore {
  sales: SaleRecord[]
  addSale: (sale: Omit<SaleRecord, 'id'>) => void
  clearHistory: () => void
}

export const useSalesHistoryStore = create<SalesHistoryStore>()(
  persist(
    (set) => ({
      sales: [],
      addSale: (sale) =>
        set((s) => ({
          sales: [...s.sales, { ...sale, id: `sale_${Date.now()}` }],
        })),
      clearHistory: () => set({ sales: [] }),
    }),
    { name: 'pdv-sales-history-v1' },
  ),
)

// ── Computed helpers ────────────────────────────────────────────────
export function getTodaySales(sales: SaleRecord[], includeTraining = false) {
  const today = new Date().toDateString()
  return sales.filter(
    (s) => new Date(s.timestamp).toDateString() === today && (includeTraining || !s.isTraining),
  )
}

export function getSalesTotals(sales: SaleRecord[]) {
  const byMethod: Partial<Record<PaymentMethod, number>> = {}
  let total = 0
  for (const s of sales) {
    total += s.total
    byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] ?? 0) + s.total
  }
  return { total, byMethod, count: sales.length }
}
