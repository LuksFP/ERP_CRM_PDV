import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AdminRole = 'superadmin' | 'support' | 'sales' | 'technician'

interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole
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
  { id: 'admin_004', name: 'Técnico João', email: 'tecnico@erp.com', password: 'tecnico123', role: 'technician' },
]

export const MOCK_ADMIN_USERS = MOCK_ADMINS.map(({ password: _pw, ...u }) => u)

export const ROLE_PERMISSIONS: Record<AdminRole, {
  canManagePlans: boolean
  canManageSegments: boolean
  canViewTenants: boolean
  canUseTools: boolean
  canViewAnalytics: boolean
}> = {
  superadmin: { canManagePlans: true,  canManageSegments: true,  canViewTenants: true,  canUseTools: true,  canViewAnalytics: true  },
  support:    { canManagePlans: false, canManageSegments: false, canViewTenants: true,  canUseTools: true,  canViewAnalytics: false },
  sales:      { canManagePlans: false, canManageSegments: false, canViewTenants: true,  canUseTools: false, canViewAnalytics: true  },
  technician: { canManagePlans: false, canManageSegments: false, canViewTenants: false, canUseTools: true,  canViewAnalytics: false },
}

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

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  if (!user) {
    return ROLE_PERMISSIONS['support'] // minimal default
  }
  return ROLE_PERMISSIONS[user.role]
}
