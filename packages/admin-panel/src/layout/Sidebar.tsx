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
        'flex flex-col shrink-0 transition-all duration-200 border-r',
        sidebarCollapsed ? 'w-12' : 'w-52'
      )}
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Wordmark */}
      <div
        className={cn(
          'flex items-center border-b',
          sidebarCollapsed ? 'justify-center' : 'px-4 gap-2.5'
        )}
        style={{ height: 53, borderColor: 'var(--border)' }}
      >
        <span
          className="font-bold text-[15px] leading-none shrink-0 font-mono"
          style={{ color: 'var(--accent)' }}
        >
          E
        </span>
        {!sidebarCollapsed && (
          <span className="text-sm leading-tight" style={{ color: 'var(--fg)' }}>
            <span className="font-semibold">ERP</span>
            <span style={{ color: 'var(--fg-muted)' }}> Admin</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-1.5 flex flex-col gap-px">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = !!matchRoute({ to: path, fuzzy: true })

          const linkEl = (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center h-8 rounded-[4px] transition-colors duration-100',
                'outline-none focus-visible:ring-1',
                sidebarCollapsed ? 'justify-center w-full' : 'gap-2.5 px-2.5',
              )}
              style={{
                color: isActive ? 'var(--accent)' : 'var(--fg-dim)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
              }}
            >
              <Icon className={cn('shrink-0', sidebarCollapsed ? 'h-[17px] w-[17px]' : 'h-[15px] w-[15px]')} />
              {!sidebarCollapsed && (
                <>
                  <span className="text-sm flex-1" style={{ color: isActive ? 'var(--accent)' : 'var(--fg-muted)' }}>
                    {label}
                  </span>
                  {isActive && (
                    <span className="h-1 w-1 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                  )}
                </>
              )}
            </Link>
          )

          return sidebarCollapsed
            ? <Tooltip key={path} content={label} side="right">{linkEl}</Tooltip>
            : linkEl
        })}
      </nav>

      {/* Collapse */}
      <div className="p-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center h-7 w-full rounded-[4px] transition-colors duration-100"
          style={{ color: 'var(--fg-dim)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-dim)' }}
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
