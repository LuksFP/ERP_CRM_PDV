/**
 * Inventory store — tracks real-time stock levels.
 * Seeded from MOCK_PRODUCTS on first load; decremented when PDV sales are made.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_PRODUCTS } from '@/mock/configs'

export interface StockEntry {
  productId: string
  stock: number
}

interface InventoryStore {
  stock: Record<string, number>          // productId → current stock
  seeded: boolean
  seed: () => void
  deduct: (productId: string, qty: number) => void
  restock: (productId: string, qty: number) => void
  getStock: (productId: string) => number
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      stock: {},
      seeded: false,

      seed: () => {
        if (get().seeded) return
        const initial: Record<string, number> = {}
        for (const p of MOCK_PRODUCTS) {
          initial[p.id] = p.stock
        }
        set({ stock: initial, seeded: true })
      },

      deduct: (productId, qty) => {
        set((s) => ({
          stock: {
            ...s.stock,
            [productId]: Math.max(0, (s.stock[productId] ?? 0) - qty),
          },
        }))
      },

      restock: (productId, qty) => {
        set((s) => ({
          stock: {
            ...s.stock,
            [productId]: (s.stock[productId] ?? 0) + qty,
          },
        }))
      },

      getStock: (productId) => {
        const s = get().stock
        // Fall back to MOCK_PRODUCTS if not seeded yet
        return s[productId] ?? MOCK_PRODUCTS.find((p) => p.id === productId)?.stock ?? 0
      },
    }),
    { name: 'pdv-inventory-v1' },
  ),
)
