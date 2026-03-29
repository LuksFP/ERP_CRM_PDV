import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TenantConfig } from '@/shared/types'
import { MOCK_CREDENTIALS } from '@/mock/configs'

interface AuthStore {
  tenantConfig: TenantConfig | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateConfig: (patch: Partial<TenantConfig>) => void
  completeOnboarding: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      tenantConfig: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        await new Promise((r) => setTimeout(r, 900))

        const cred = MOCK_CREDENTIALS.find(
          (c) => c.email === email && c.password === password
        )

        if (!cred) {
          set({ isLoading: false, error: 'E-mail ou senha inválidos.' })
          return
        }

        set({
          isLoading: false,
          isAuthenticated: true,
          tenantConfig: cred.config,
          error: null,
        })
      },

      logout: () =>
        set({ isAuthenticated: false, tenantConfig: null, error: null }),

      updateConfig: (patch) => {
        const current = get().tenantConfig
        if (!current) return
        set({ tenantConfig: { ...current, ...patch } })
      },

      completeOnboarding: () => {
        const current = get().tenantConfig
        if (!current) return
        set({ tenantConfig: { ...current, onboardingCompleted: true } })
      },
    }),
    {
      name: 'tenant-auth',
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        tenantConfig: s.tenantConfig,
      }),
    }
  )
)
