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
        'flex flex-col shrink-0 transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-52'
      )}
      style={{
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Wordmark */}
      <div
        className={cn(
          'flex items-center border-b shrink-0',
          sidebarCollapsed ? 'justify-center' : 'px-4 gap-2.5'
        )}
        style={{ height: 53, borderColor: 'var(--border)' }}
      >
        {/* Logo mark */}
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '256px', opacity: 0.15, pointerEvents: 'none' }} />
          <span style={{ fontFamily: 'Geist Mono', fontWeight: 800, fontSize: 13, color: '#fff', position: 'relative', lineHeight: 1 }}>E</span>
        </div>
        {!sidebarCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.01em' }}>ERP Admin</span>
            <span style={{ fontFamily: 'Geist Mono', fontSize: 9, color: 'var(--fg-dim)', letterSpacing: '0.1em', marginTop: 2 }}>PLATAFORMA</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = !!matchRoute({ to: path, fuzzy: true })

          const linkEl = (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center h-9 rounded-[6px] transition-colors duration-100',
                'outline-none focus-visible:ring-1',
                sidebarCollapsed ? 'justify-center w-full' : 'gap-2.5 px-3',
              )}
              style={{
                color: isActive ? 'var(--accent)' : 'var(--fg-dim)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                borderLeft: isActive && !sidebarCollapsed ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--fg)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--fg-dim)'
                }
              }}
            >
              <Icon className={cn('shrink-0', sidebarCollapsed ? 'h-[17px] w-[17px]' : 'h-[15px] w-[15px]')} />
              {!sidebarCollapsed && (
                <span className="text-sm flex-1" style={{ color: isActive ? 'var(--accent)' : 'inherit', fontWeight: isActive ? 600 : 400 }}>
                  {label}
                </span>
              )}
            </Link>
          )

          return sidebarCollapsed
            ? <Tooltip key={path} content={label} side="right">{linkEl}</Tooltip>
            : <div key={path}>{linkEl}</div>
        })}
      </nav>

      {/* Collapse */}
      <div className="p-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center h-8 w-full rounded-[6px] transition-colors duration-100"
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
