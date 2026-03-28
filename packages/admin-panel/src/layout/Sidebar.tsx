import { Link, useMatchRoute } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Tag,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useUIStore } from '@/shared/store/ui'
import { Tooltip } from '@/shared/components/Tooltip'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tenants',   label: 'Tenants',   icon: Building2 },
  { path: '/plans',     label: 'Planos',     icon: CreditCard },
  { path: '/segments',  label: 'Segmentos',  icon: Tag },
  { path: '/analytics', label: 'Analytics',  icon: BarChart3 },
]

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore()
  const matchRoute = useMatchRoute()

  return (
    <aside
      className={cn(
        'flex flex-col bg-surface-1 border-r border-[var(--border)] transition-all duration-200 shrink-0',
        sidebarCollapsed ? 'w-12' : 'w-52'
      )}
    >
      {/* Wordmark */}
      <div className={cn(
        'flex items-center h-14 border-b border-[var(--border)]',
        sidebarCollapsed ? 'justify-center' : 'px-4 gap-2.5'
      )}>
        {/* Logotype mark — just a letter, no box */}
        <span className="text-accent font-bold text-base leading-none shrink-0 font-mono">E</span>
        {!sidebarCollapsed && (
          <div className="leading-tight">
            <span className="text-sm font-semibold text-fg tracking-tight">ERP</span>
            <span className="text-sm font-light text-fg-muted tracking-tight"> Admin</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-1.5 flex flex-col gap-px">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = !!matchRoute({ to: path, fuzzy: true })

          const linkEl = (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center h-8 rounded transition-colors duration-100 outline-none select-none',
                'focus-visible:ring-1 focus-visible:ring-accent',
                sidebarCollapsed ? 'justify-center px-0 w-full' : 'gap-2.5 px-2.5',
                isActive
                  ? 'text-accent bg-accent-dim'
                  : 'text-fg-dim hover:text-fg hover:bg-surface-2'
              )}
            >
              <Icon className={cn('shrink-0', sidebarCollapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4')} />
              {!sidebarCollapsed && (
                <span className="text-sm">{label}</span>
              )}
              {/* Active indicator */}
              {isActive && !sidebarCollapsed && (
                <span className="ml-auto h-1 w-1 rounded-full bg-accent" />
              )}
            </Link>
          )

          return sidebarCollapsed
            ? <Tooltip key={path} content={label} side="right">{linkEl}</Tooltip>
            : linkEl
        })}
      </nav>

      {/* Collapse */}
      <div className="p-1.5 border-t border-[var(--border)]">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={cn(
            'flex items-center justify-center h-7 w-full rounded',
            'text-fg-dim hover:text-fg hover:bg-surface-2 transition-colors duration-100',
            'outline-none focus-visible:ring-1 focus-visible:ring-accent'
          )}
          aria-label={sidebarCollapsed ? 'Expandir' : 'Recolher'}
        >
          {sidebarCollapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>
    </aside>
  )
}
