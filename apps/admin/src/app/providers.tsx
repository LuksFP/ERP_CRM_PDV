import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'
import { router } from './router'
import { useUIStore } from '@/shared/store/ui'
import { useBrandStore, applyBrand } from '@/shared/store/brand'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
  }, [theme])

  return <>{children}</>
}

function BrandProvider({ children }: { children: React.ReactNode }) {
  const { config } = useBrandStore()
  useEffect(() => { applyBrand(config) }, [config])
  return <>{children}</>
}

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrandProvider>
          <RouterProvider router={router} />
        </BrandProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
