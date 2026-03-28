import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { useAuthStore } from '@/modules/auth/store'
import { AppLayout } from '@/layout/AppLayout'
import { Spinner } from '@/shared/components/Spinner'

// ─── LAZY PAGES ──────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage'))
const TenantsPage = lazy(() => import('@/modules/tenants/pages/TenantsPage'))
const TenantDetailPage = lazy(() => import('@/modules/tenants/pages/TenantDetailPage'))
const PlansPage = lazy(() => import('@/modules/plans/pages/PlansPage'))
const SegmentsPage = lazy(() => import('@/modules/segments/pages/SegmentsPage'))
const AnalyticsPage = lazy(() => import('@/modules/analytics/pages/AnalyticsPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48">
      <Spinner size="lg" />
    </div>
  )
}

function withSuspense(Component: React.ComponentType) {
  return function SuspensePage() {
    return (
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    )
  }
}

// ─── GUARDS ──────────────────────────────────────────────────────
const authGuard = () => {
  const { isAuthenticated } = useAuthStore.getState()
  if (!isAuthenticated) {
    throw redirect({ to: '/login' })
  }
}

const guestGuard = () => {
  const { isAuthenticated } = useAuthStore.getState()
  if (isAuthenticated) {
    throw redirect({ to: '/dashboard' })
  }
}

// ─── ROUTES ──────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: () => <Outlet /> })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/dashboard' }) },
})

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth-layout',
  beforeLoad: guestGuard,
  component: () => (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <Outlet />
    </div>
  ),
})

const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected-layout',
  beforeLoad: authGuard,
  component: AppLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/login',
  component: withSuspense(LoginPage),
})

const dashboardRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/dashboard',
  component: withSuspense(DashboardPage),
})

const tenantsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/tenants',
  component: withSuspense(TenantsPage),
})

const tenantDetailRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/tenants/$tenantId',
  component: withSuspense(TenantDetailPage),
})

const plansRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/plans',
  component: withSuspense(PlansPage),
})

const segmentsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/segments',
  component: withSuspense(SegmentsPage),
})

const analyticsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: '/analytics',
  component: withSuspense(AnalyticsPage),
})

// ─── ROUTER ──────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  indexRoute,
  authLayoutRoute.addChildren([loginRoute]),
  protectedLayoutRoute.addChildren([
    dashboardRoute,
    tenantsRoute,
    tenantDetailRoute,
    plansRoute,
    segmentsRoute,
    analyticsRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
