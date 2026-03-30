import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, PaymentMethod } from '@/shared/types'

export interface ComandaItem {
  product: Product
  quantity: number
  note: string
}

export type ComandaStatus = 'open' | 'paid' | 'cancelled'

export interface Comanda {
  id: string
  tableNumber: number
  customerName: string
  status: ComandaStatus
  items: ComandaItem[]
  openedAt: string
  closedAt?: string
  paymentMethod?: PaymentMethod
  discount: number
}

interface ComandaStore {
  comandas: Comanda[]
  tableCount: number          // total tables configured (superadmin configures this)
  openComanda: (tableNumber: number, customerName?: string) => Comanda
  addItem: (comandaId: string, product: Product) => void
  removeItem: (comandaId: string, productId: string) => void
  updateItemQty: (comandaId: string, productId: string, qty: number) => void
  updateItemNote: (comandaId: string, productId: string, note: string) => void
  setDiscount: (comandaId: string, discount: number) => void
  finalizeComanda: (comandaId: string, paymentMethod: PaymentMethod) => void
  cancelComanda: (comandaId: string) => void
  setTableCount: (n: number) => void
}

export const useComandaStore = create<ComandaStore>()(
  persist(
    (set, get) => ({
      comandas: [],
      tableCount: 10,

      openComanda: (tableNumber, customerName = '') => {
        const existing = get().comandas.find(
          (c) => c.tableNumber === tableNumber && c.status === 'open',
        )
        if (existing) return existing

        const comanda: Comanda = {
          id: `comanda-${Date.now()}`,
          tableNumber,
          customerName,
          status: 'open',
          items: [],
          openedAt: new Date().toISOString(),
          discount: 0,
        }
        set((s) => ({ comandas: [...s.comandas, comanda] }))
        return comanda
      },

      addItem: (comandaId, product) =>
        set((s) => ({
          comandas: s.comandas.map((c) => {
            if (c.id !== comandaId) return c
            const existing = c.items.find((i) => i.product.id === product.id)
            return {
              ...c,
              items: existing
                ? c.items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...c.items, { product, quantity: 1, note: '' }],
            }
          }),
        })),

      removeItem: (comandaId, productId) =>
        set((s) => ({
          comandas: s.comandas.map((c) =>
            c.id !== comandaId ? c : { ...c, items: c.items.filter((i) => i.product.id !== productId) },
          ),
        })),

      updateItemQty: (comandaId, productId, qty) =>
        set((s) => ({
          comandas: s.comandas.map((c) => {
            if (c.id !== comandaId) return c
            return {
              ...c,
              items: qty <= 0
                ? c.items.filter((i) => i.product.id !== productId)
                : c.items.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i),
            }
          }),
        })),

      updateItemNote: (comandaId, productId, note) =>
        set((s) => ({
          comandas: s.comandas.map((c) =>
            c.id !== comandaId ? c : {
              ...c,
              items: c.items.map((i) => i.product.id === productId ? { ...i, note } : i),
            },
          ),
        })),

      setDiscount: (comandaId, discount) =>
        set((s) => ({
          comandas: s.comandas.map((c) =>
            c.id !== comandaId ? c : { ...c, discount },
          ),
        })),

      finalizeComanda: (comandaId, paymentMethod) =>
        set((s) => ({
          comandas: s.comandas.map((c) =>
            c.id !== comandaId ? c : {
              ...c,
              status: 'paid',
              closedAt: new Date().toISOString(),
              paymentMethod,
            },
          ),
        })),

      cancelComanda: (comandaId) =>
        set((s) => ({
          comandas: s.comandas.map((c) =>
            c.id !== comandaId ? c : {
              ...c,
              status: 'cancelled',
              closedAt: new Date().toISOString(),
            },
          ),
        })),

      setTableCount: (n) => set({ tableCount: n }),
    }),
    { name: 'pdv-comanda-v1' },
  ),
)
