import { Link, useMatchRoute } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Tag,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useUIStore } from '@/shared/store/ui'
import { Tooltip } from '@/shared/components/Tooltip'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tenants', label: 'Tenants', icon: Building2 },
  { path: '/plans', label: 'Planos', icon: CreditCard },
  { path: '/segments', label: 'Segmentos', icon: Tag },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore()
  const matchRoute = useMatchRoute()

  return (
    <aside
      className={cn(
        'flex flex-col bg-surface-1 border-r border-[var(--border)] transition-all duration-200 shrink-0',
        sidebarCollapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-[var(--border)] h-14',
          sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3'
        )}
      >
        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-accent shrink-0">
          <Zap className="h-4 w-4 text-[#0C0A09]" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-fg leading-tight truncate">Admin Panel</p>
            <p className="text-2xs text-fg-dim leading-tight">ERP Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = !!matchRoute({ to: path, fuzzy: true })

          const linkEl = (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center rounded-btn h-9 transition-colors duration-100 outline-none select-none',
                'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface-1',
                sidebarCollapsed ? 'justify-center px-0 w-full' : 'gap-3 px-3',
                isActive
                  ? 'bg-accent-dim text-accent font-medium'
                  : 'text-fg-muted hover:text-fg hover:bg-surface-2'
              )}
            >
              <Icon
                className={cn(
                  'shrink-0 transition-colors',
                  isActive ? 'text-accent' : 'text-fg-dim group-hover:text-fg',
                  sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4'
                )}
              />
              {!sidebarCollapsed && (
                <span className="text-sm">{label}</span>
              )}
            </Link>
          )

          if (sidebarCollapsed) {
            return (
              <Tooltip key={path} content={label} side="right">
                {linkEl}
              </Tooltip>
            )
          }

          return linkEl
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-[var(--border)]">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'flex items-center justify-center h-8 w-full rounded-btn',
            'text-fg-dim hover:text-fg hover:bg-surface-2 transition-colors duration-100',
            'outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
