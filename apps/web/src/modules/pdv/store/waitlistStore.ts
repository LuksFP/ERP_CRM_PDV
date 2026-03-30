import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WaitlistEntry {
  id: string
  name: string
  partySize: number
  phone: string
  waitingSince: string
  tableNumber?: number  // assigned table (when seated)
  status: 'waiting' | 'seated' | 'cancelled'
}

interface WaitlistStore {
  entries: WaitlistEntry[]
  addEntry: (name: string, partySize: number, phone?: string) => void
  seatEntry: (id: string, tableNumber: number) => void
  cancelEntry: (id: string) => void
  removeEntry: (id: string) => void
}

export const useWaitlistStore = create<WaitlistStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (name, partySize, phone = '') =>
        set((s) => ({
          entries: [
            ...s.entries,
            {
              id: `wait_${Date.now()}`,
              name,
              partySize,
              phone,
              waitingSince: new Date().toISOString(),
              status: 'waiting',
            },
          ],
        })),
      seatEntry: (id, tableNumber) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, status: 'seated', tableNumber } : e,
          ),
        })),
      cancelEntry: (id) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id ? { ...e, status: 'cancelled' } : e,
          ),
        })),
      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    { name: 'pdv-waitlist-v1' },
  ),
)
