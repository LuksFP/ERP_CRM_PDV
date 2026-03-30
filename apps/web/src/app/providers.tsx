import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useUIStore } from '@/shared/store/ui'
import { useAuthStore } from '@/modules/auth/store'
import { TenantThemeInjector } from '@/design-system/theme-provider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
})

function ThemeSync() {
  const { theme, setTheme } = useUIStore()
  const tenantConfig = useAuthStore((s) => s.tenantConfig)
  const seeded = useRef(false)

  // On first login, seed UIStore from tenant branding.darkMode
  useEffect(() => {
    if (!tenantConfig || seeded.current) return
    seeded.current = true
    setTheme(tenantConfig.branding.darkMode ? 'dark' : 'light')
  }, [tenantConfig, setTheme])

  // Always apply theme class — UIStore is source of truth at runtime
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, [theme])

  return null
}

function TenantTheme() {
  const tenantConfig = useAuthStore((s) => s.tenantConfig)
  const { theme } = useUIStore()
  if (!tenantConfig) return null
  return <TenantThemeInjector branding={tenantConfig.branding} theme={theme} />
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
