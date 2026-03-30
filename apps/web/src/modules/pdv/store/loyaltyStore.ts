import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LoyaltyCustomer {
  phone: string
  name?: string
  points: number
  totalSpent: number
  visits: number
  lastVisit: string
}

interface LoyaltyStore {
  customers: LoyaltyCustomer[]
  activePhone: string
  setActivePhone: (phone: string) => void
  lookupCustomer: (phone: string) => LoyaltyCustomer | undefined
  addPoints: (phone: string, amount: number, name?: string) => LoyaltyCustomer
  redeemPoints: (phone: string, points: number) => void
}

// 1 point per R$1 spent
export const POINTS_PER_REAL = 1

// 100 points = R$5 discount
export const POINTS_TO_DISCOUNT = 100
export const DISCOUNT_PER_100_POINTS = 5

export const useLoyaltyStore = create<LoyaltyStore>()(
  persist(
    (set, get) => ({
      customers: [],
      activePhone: '',
      setActivePhone: (phone) => set({ activePhone: phone }),
      lookupCustomer: (phone) => get().customers.find((c) => c.phone === phone),
      addPoints: (phone, amount, name) => {
        const earned = Math.floor(amount * POINTS_PER_REAL)
        const existing = get().customers.find((c) => c.phone === phone)
        let updated: LoyaltyCustomer
        if (existing) {
          updated = {
            ...existing,
            points: existing.points + earned,
            totalSpent: existing.totalSpent + amount,
            visits: existing.visits + 1,
            lastVisit: new Date().toISOString(),
          }
          set((s) => ({
            customers: s.customers.map((c) => (c.phone === phone ? updated : c)),
          }))
        } else {
          updated = {
            phone,
            name,
            points: earned,
            totalSpent: amount,
            visits: 1,
            lastVisit: new Date().toISOString(),
          }
          set((s) => ({ customers: [...s.customers, updated] }))
        }
        return updated
      },
      redeemPoints: (phone, points) => {
        set((s) => ({
          customers: s.customers.map((c) =>
            c.phone === phone ? { ...c, points: Math.max(0, c.points - points) } : c,
          ),
        }))
      },
    }),
    { name: 'pdv-loyalty-v1' },
  ),
)
