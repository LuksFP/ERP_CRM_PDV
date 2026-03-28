import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'superadmin' | 'support' | 'sales'
}

interface AuthState {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Mock credentials
const MOCK_ADMINS: Array<AdminUser & { password: string }> = [
  { id: 'admin_001', name: 'Admin Geral', email: 'admin@erp.com', password: 'admin123', role: 'superadmin' },
  { id: 'admin_002', name: 'Suporte Técnico', email: 'suporte@erp.com', password: 'suporte123', role: 'support' },
  { id: 'admin_003', name: 'Vendas Team', email: 'vendas@erp.com', password: 'vendas123', role: 'sales' },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 800))

        const admin = MOCK_ADMINS.find(
          (a) => a.email === email && a.password === password
        )

        if (!admin) {
          throw new Error('Credenciais inválidas')
        }

        const { password: _pw, ...user } = admin
        set({
          user,
          token: `mock_token_${Date.now()}`,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
