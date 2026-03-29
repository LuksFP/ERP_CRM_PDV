import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  theme: 'dark' | 'light'
  sidebarCollapsed: boolean
  toggleTheme: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'admin-ui',
      partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
