import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Users2, Wallet,
  FileText, ShoppingBag, Settings, Lock, ChevronLeft, ChevronRight,
  Building2,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useUIStore } from '@/shared/store/ui'
import { useAuthStore } from '@/modules/auth/store'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { moduleLabels } from '@/shared/utils/formatters'
import type { ModuleKey } from '@/shared/types'

const MODULE_ICONS: Record<ModuleKey, React.ReactNode> = {
  dashboard:  <LayoutDashboard size={18} />,
  inventory:  <Package size={18} />,
  pdv:        <ShoppingCart size={18} />,
  crm:        <Users2 size={18} />,
  financial:  <Wallet size={18} />,
  fiscal:     <FileText size={18} />,
  purchasing: <ShoppingBag size={18} />,
  settings:   <Settings size={18} />,
}

const MODULE_PATHS: Record<ModuleKey, string> = {
  dashboard:  '/dashboard',
  inventory:  '/inventory',
  pdv:        '/pdv',
  crm:        '/crm',
  financial:  '/financial',
  fiscal:     '/financial',     // fiscal shares financial for now
  purchasing: '/inventory',     // purchasing shares inventory for now
  settings:   '/settings',
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const config = useAuthStore((s) => s.tenantConfig)
  const { getVisibleModules } = usePermissions()

  const navItems = getVisibleModules()
  const branding = config?.branding

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-surface-0 border-r border-border transition-all duration-200 shrink-0',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Logo / brand */}
      <div className={cn('flex items-center gap-2 p-4 border-b border-border min-h-[57px]', collapsed && 'justify-center p-3')}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-contrast)',
          }}
        >
          {branding?.logo ? (
            <img src={branding.logo} alt={branding.name} className="w-full h-full object-contain rounded-lg" />
          ) : (
            branding?.name?.charAt(0).toUpperCase() ?? 'E'
          )}
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-ink truncate leading-tight">
              {branding?.name ?? 'ERP'}
            </p>
            <p className="text-[10px] font-mono text-ink-subtle uppercase tracking-wide">
              {config?.plan.name ?? '—'}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1.5 space-y-0.5">
        {navItems.map(({ module, locked, accessible }) => {
          const path = MODULE_PATHS[module]
          const icon = MODULE_ICONS[module]
          const label = moduleLabels[module]
          const isDisabled = !accessible && !locked

          if (isDisabled) return null

          return (
            <NavLink
              key={module}
              to={path}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  locked
                    ? 'opacity-50 pointer-events-none text-ink-muted'
                    : isActive
                    ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                )
              }
            >
              <span className="shrink-0">{icon}</span>
              {!collapsed && <span className="flex-1 truncate">{label}</span>}
              {!collapsed && locked && <Lock size={12} className="text-ink-subtle" />}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom: org info + collapse */}
      <div className="border-t border-border">
        {!collapsed && config && (
          <div className="px-3 py-2.5 flex items-center gap-2">
            <Building2 size={14} className="text-ink-subtle shrink-0" />
            <span className="text-xs text-ink-subtle truncate">{config.branding.slug}</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2.5 text-xs text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Recolher</span></>}
        </button>
      </div>
    </aside>
  )
}
