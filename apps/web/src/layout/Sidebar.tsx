import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Users2, Wallet,
  FileText, ShoppingBag, Settings, Lock,
  ChevronRight, PanelLeftClose, Users, Building2,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useUIStore } from '@/shared/store/ui'
import { useAuthStore } from '@/modules/auth/store'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { moduleLabels, roleLabels } from '@/shared/utils/formatters'
import { Tooltip } from '@/shared/components/Tooltip'
import type { ModuleKey } from '@/shared/types'

const MODULE_ICONS: Record<ModuleKey, React.ElementType> = {
  dashboard:  LayoutDashboard,
  inventory:  Package,
  pdv:        ShoppingCart,
  crm:        Users2,
  financial:  Wallet,
  fiscal:     FileText,
  purchasing: ShoppingBag,
  team:       Users,
  branches:   Building2,
  settings:   Settings,
}

const MODULE_PATHS: Record<ModuleKey, string> = {
  dashboard:  '/dashboard',
  inventory:  '/inventory',
  pdv:        '/pdv',
  crm:        '/crm',
  financial:  '/financial',
  fiscal:     '/financial',
  purchasing: '/inventory',
  team:       '/team',
  branches:   '/branches',
  settings:   '/settings',
}

// Settings lives at the bottom, separated
const BOTTOM_MODULES: ModuleKey[] = ['settings']

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const config = useAuthStore((s) => s.tenantConfig)
  const { getVisibleModules, currentUser } = usePermissions()

  const allItems = getVisibleModules()
  const mainItems   = allItems.filter(({ module }) => !BOTTOM_MODULES.includes(module))
  const bottomItems = allItems.filter(({ module }) =>  BOTTOM_MODULES.includes(module))
  const branding = config?.branding

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-surface-0 border-r border-border transition-all duration-200 shrink-0',
        collapsed ? 'w-14' : 'w-56',
      )}
    >
      {/* Logo / brand */}
      <div className={cn(
        'flex items-center gap-2.5 border-b border-border shrink-0',
        collapsed ? 'justify-center px-0 py-0 h-[57px]' : 'px-4 h-[57px]',
      )}>
        <div
          className="shrink-0 flex items-center justify-center font-bold overflow-hidden"
          style={{
            width: 28, height: 28,
            borderRadius: 7,
            background: 'var(--accent)',
            color: 'var(--accent-contrast)',
            fontSize: 13,
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'rgba(255,255,255,0.15)', pointerEvents: 'none' }} />
          {branding?.logo ? (
            <img src={branding.logo} alt={branding.name} className="w-full h-full object-contain" style={{ borderRadius: 7 }} />
          ) : (
            <span style={{ position: 'relative', fontFamily: 'Geist Mono', fontWeight: 800 }}>
              {branding?.name?.charAt(0).toUpperCase() ?? 'E'}
            </span>
          )}
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-ink truncate leading-tight">
              {branding?.name ?? 'ERP'}
            </p>
            <p className="text-[9px] font-mono text-ink-subtle uppercase tracking-wider mt-0.5">
              {config?.plan.name ?? '—'}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-1.5 flex flex-col gap-0.5">
        {mainItems.map(({ module, locked, accessible }) => {
          const path = MODULE_PATHS[module]
          const Icon = MODULE_ICONS[module]
          const label = moduleLabels[module]
          if (!accessible && !locked) return null

          const navEl = (
            <NavLink
              key={module}
              to={path}
              className={({ isActive }) =>
                cn(
                  'group flex items-center h-9 rounded-[6px] transition-colors duration-150',
                  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-surface-0',
                  locked && 'pointer-events-none',
                  collapsed
                    ? cn(
                        'justify-center w-full',
                        locked ? 'opacity-40' : isActive ? 'bg-[var(--accent-dim)]' : 'hover:bg-surface-2',
                      )
                    : cn(
                        'gap-2.5 px-2.5 border-l-2',
                        locked
                          ? 'opacity-40 border-transparent'
                          : isActive
                          ? 'bg-[var(--accent-dim)] border-[var(--accent)]'
                          : 'border-transparent hover:bg-surface-2',
                      ),
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn(
                    'shrink-0 h-4 w-4 transition-colors duration-150',
                    locked
                      ? 'text-ink-muted'
                      : isActive
                      ? 'text-[var(--accent)]'
                      : 'text-ink-muted group-hover:text-ink',
                  )} />
                  {!collapsed && (
                    <>
                      <span className={cn(
                        'text-sm flex-1 truncate transition-colors duration-150',
                        locked
                          ? 'text-ink-muted'
                          : isActive
                          ? 'text-[var(--accent)] font-semibold'
                          : 'text-ink-muted group-hover:text-ink',
                      )}>
                        {label}
                      </span>
                      {locked && <Lock size={11} className="text-ink-subtle shrink-0" />}
                    </>
                  )}
                </>
              )}
            </NavLink>
          )

          return collapsed
            ? <Tooltip key={module} content={locked ? `${label} (bloqueado)` : label} side="right">{navEl}</Tooltip>
            : navEl
        })}
      </nav>

      {/* Settings at bottom */}
      {bottomItems.length > 0 && (
        <div className="px-1.5 pb-1.5 border-t border-border pt-1.5">
          {bottomItems.map(({ module, locked, accessible }) => {
            if (!accessible && !locked) return null
            const path = MODULE_PATHS[module]
            const Icon = MODULE_ICONS[module]
            const label = moduleLabels[module]

            const navEl = (
              <NavLink
                key={module}
                to={path}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center h-9 rounded-[6px] transition-colors duration-150',
                    'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                    collapsed
                      ? cn('justify-center w-full', isActive ? 'bg-[var(--accent-dim)]' : 'hover:bg-surface-2')
                      : cn('gap-2.5 px-2.5 border-l-2',
                          isActive
                            ? 'bg-[var(--accent-dim)] border-[var(--accent)]'
                            : 'border-transparent hover:bg-surface-2',
                        ),
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn(
                      'shrink-0 h-4 w-4 transition-colors duration-150',
                      isActive ? 'text-[var(--accent)]' : 'text-ink-muted group-hover:text-ink',
                    )} />
                    {!collapsed && (
                      <span className={cn(
                        'text-sm flex-1 truncate transition-colors duration-150',
                        isActive ? 'text-[var(--accent)] font-semibold' : 'text-ink-muted group-hover:text-ink',
                      )}>
                        {label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )

            return collapsed
              ? <Tooltip key={module} content={label} side="right">{navEl}</Tooltip>
              : navEl
          })}
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-border">
        {currentUser && (
          collapsed ? (
            <Tooltip content={`${currentUser.name} · ${roleLabels[currentUser.role]}`} side="right">
              <div className="flex justify-center py-2.5">
                <div
                  className="flex items-center justify-center text-xs font-bold"
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--accent-dim)',
                    border: '1px solid rgba(226,163,54,0.2)',
                    color: 'var(--accent)',
                    cursor: 'default',
                    fontFamily: 'Geist',
                    fontWeight: 700,
                  }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2.5 px-3 border-b border-border" style={{ height: 48 }}>
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  border: '1px solid rgba(226,163,54,0.2)',
                  color: 'var(--accent)',
                  fontFamily: 'Geist',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-ink truncate leading-tight">
                  {currentUser.name.split(' ')[0]}
                </p>
                <p className="font-mono text-ink-subtle uppercase truncate mt-0.5" style={{ fontSize: 9, letterSpacing: '0.12em' }}>
                  {roleLabels[currentUser.role]}
                </p>
              </div>
            </div>
          )
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          className={cn(
            'w-full flex items-center h-9 px-3 transition-colors duration-150',
            'text-ink-muted hover:text-ink hover:bg-surface-2',
            'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
            collapsed ? 'justify-center' : 'gap-2',
          )}
        >
          {collapsed
            ? <ChevronRight size={14} />
            : (
              <>
                <PanelLeftClose size={14} className="shrink-0" />
                <span className="text-xs">Recolher</span>
              </>
            )}
        </button>
      </div>
    </aside>
  )
}
