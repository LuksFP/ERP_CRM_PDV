import { useAuthStore } from '@/modules/auth/store'

export function useTenantConfig() {
  const config = useAuthStore((s) => s.tenantConfig)
  if (!config) throw new Error('useTenantConfig used outside authenticated context')
  return config
}
