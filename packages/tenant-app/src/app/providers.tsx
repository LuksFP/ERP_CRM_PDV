import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useUIStore } from '@/shared/store/ui'
import { useAuthStore } from '@/modules/auth/store'
import { TenantThemeInjector } from '@/design-system/theme-provider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
})

function ThemeSync() {
  const theme = useUIStore((s) => s.theme)
  const tenantConfig = useAuthStore((s) => s.tenantConfig)

  // Sync UI store theme → dark class (but tenant branding takes priority when logged in)
  useEffect(() => {
    if (tenantConfig) return // TenantThemeInjector handles it
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme, tenantConfig])

  return null
}

function TenantTheme() {
  const tenantConfig = useAuthStore((s) => s.tenantConfig)
  if (!tenantConfig) return null
  return <TenantThemeInjector branding={tenantConfig.branding} />
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <TenantTheme />
      {children}
    </QueryClientProvider>
  )
}
