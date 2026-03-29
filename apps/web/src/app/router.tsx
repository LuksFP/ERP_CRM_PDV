import React, { Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/modules/auth/store'
import { Spinner } from '@/shared/components/Spinner'
import { AppLayout } from '@/layout/AppLayout'

// ── Lazy pages ──────────────────────────────────────────────────────────────
const LoginPage = React.lazy(() => import('@/modules/auth/pages/LoginPage'))
const OnboardingPage = React.lazy(() => import('@/modules/onboarding/pages/OnboardingPage'))
const DashboardPage = React.lazy(() => import('@/modules/dashboard/pages/DashboardPage'))
const InventoryPage = React.lazy(() => import('@/modules/inventory/pages/InventoryPage'))
const PDVPage = React.lazy(() => import('@/modules/pdv/pages/PDVPage'))
const CRMPage = React.lazy(() => import('@/modules/crm/pages/CRMPage'))
const FinancialPage = React.lazy(() => import('@/modules/financial/pages/FinancialPage'))
const TeamPage = React.lazy(() => import('@/modules/team/pages/TeamPage'))
const BranchesPage = React.lazy(() => import('@/modules/branches/pages/BranchesPage'))
const SettingsPage = React.lazy(() => import('@/modules/settings/pages/SettingsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Spinner size="lg" />
    </div>
  )
}

function wrap(el: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{el}</Suspense>
}

// ── Guards ──────────────────────────────────────────────────────────────────
function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const tenantConfig = useAuthStore((s) => s.tenantConfig)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (tenantConfig && !tenantConfig.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}

function GuestGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const tenantConfig = useAuthStore((s) => s.tenantConfig)

  if (isAuthenticated) {
    if (tenantConfig && !tenantConfig.onboardingCompleted) {
      return <Navigate to="/onboarding" replace />
    }
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

function OnboardingGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const tenantConfig = useAuthStore((s) => s.tenantConfig)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (tenantConfig?.onboardingCompleted) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

// ── Router ──────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Guest routes
  {
    element: <GuestGuard />,
    children: [
      { path: '/login', element: wrap(<LoginPage />) },
    ],
  },
  // Onboarding
  {
    element: <OnboardingGuard />,
    children: [
      { path: '/onboarding', element: wrap(<OnboardingPage />) },
    ],
  },
  // Protected app routes
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: wrap(<DashboardPage />) },
          { path: '/inventory',  element: wrap(<InventoryPage />) },
          { path: '/pdv',        element: wrap(<PDVPage />) },
          { path: '/crm',        element: wrap(<CRMPage />) },
          { path: '/financial',  element: wrap(<FinancialPage />) },
          { path: '/team',       element: wrap(<TeamPage />) },
          { path: '/branches',   element: wrap(<BranchesPage />) },
          { path: '/settings',   element: wrap(<SettingsPage />) },
        ],
      },
    ],
  },
  // Fallback
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
