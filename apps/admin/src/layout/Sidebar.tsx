import { Link, useMatchRoute } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Tag,
  BarChart3,
  ChevronRight,
  ClipboardList,
  CalendarDays,
  Users,
  Palette,
  PanelLeftClose,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useUIStore } from '@/shared/store/ui'
import { Tooltip } from '@/shared/components/Tooltip'
import { useAuthStore, usePermissions } from '@/modules/auth/store'
import type { AdminRole } from '@/modules/auth/store'

const ROLE_LABEL: Record<AdminRole, string> = {
  superadmin: 'Super Admin',
  support:    'Suporte',
  sales:      'Vendas',
  technician: 'Técnico',
}

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  allowedRoles: AdminRole[]
}

const CORE_NAV: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['superadmin', 'support', 'sales', 'technician'] },
  { path: '/tenants',   label: 'Tenants',   icon: Building2,       allowedRoles: ['superadmin', 'support', 'sales'] },
  { path: '/plans',     label: 'Planos',     icon: CreditCard,      allowedRoles: ['superadmin', 'sales'] },
  { path: '/segments',  label: 'Segmentos',  icon: Tag,             allowedRoles: ['superadmin'] },
  { path: '/analytics', label: 'Analytics',  icon: BarChart3,       allowedRoles: ['superadmin', 'sales'] },
]

const ADMIN_NAV: NavItem[] = [
  { path: '/team',         label: 'Equipe',       icon: Users,   allowedRoles: ['superadmin'] },
  { path: '/personalizar', label: 'Personalizar',  icon: Palette, allowedRoles: ['superadmin'] },
]

const TOOLS_NAV: NavItem[] = [
  { path: '/tools/service-orders', label: 'Ordem de Serviço', icon: ClipboardList, allowedRoles: ['superadmin', 'support', 'technician'] },
  { path: '/tools/agenda',         label: 'Agenda',           icon: CalendarDays,  allowedRoles: ['superadmin', 'support', 'technician'] },
]

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  return (
    <div style={{ marginTop: 16, marginBottom: 4 }}>
      <div style={{ height: 1, background: 'var(--border)', marginBottom: collapsed ? 0 : 8 }} />
      {!collapsed && (
        <span style={{
          fontFamily: 'Geist Mono, monospace',
          fontSize: 9,
          fontWeight: 600,
          color: 'var(--fg-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          paddingLeft: 10,
          display: 'block',
          marginTop: 8,
        }}>
          {label}
        </span>
      )}
    </div>
  )
}

function NavLink({
  path,
  label,
  icon: Icon,
  isActive,
  collapsed,
}: {
  path: string
  label: string
  icon: React.ElementType
  isActive: boolean
  collapsed: boolean
}) {
  const linkEl = (
    <Link
      to={path}
      className={cn(
        'group flex items-center h-9 rounded-[6px] transition-colors duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-1)]',
        collapsed
          ? cn(
              'justify-center w-full',
              isActive ? 'bg-[var(--accent-dim)]' : 'hover:bg-[var(--surface-2)]',
            )
          : cn(
              'gap-2.5 px-3 border-l-2',
              isActive
                ? 'bg-[var(--accent-dim)] border-[var(--accent)]'
                : 'border-transparent hover:bg-[var(--surface-2)]',
            ),
      )}
    >
      <Icon className={cn(
        'shrink-0 h-4 w-4 transition-colors duration-150',
        isActive
          ? 'text-[var(--accent)]'
          : 'text-[var(--fg-dim)] group-hover:text-[var(--fg)]',
      )} />
      {!collapsed && (
        <span className={cn(
          'text-sm flex-1 transition-colors duration-150',
          isActive
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--fg-dim)] group-hover:text-[var(--fg)]',
        )}>
          {label}
        </span>
      )}
    </Link>
  )

  return collapsed
    ? <Tooltip content={label} side="right">{linkEl}</Tooltip>
    : linkEl
}

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore()
  const matchRoute = useMatchRoute()
  const user = useAuthStore(s => s.user)
  const permissions = usePermissions()

  const role = user?.role ?? 'support'

  const visibleCore  = CORE_NAV.filter(item => item.allowedRoles.includes(role))
  const visibleAdmin = ADMIN_NAV.filter(item => item.allowedRoles.includes(role))
  const visibleTools = TOOLS_NAV.filter(item => item.allowedRoles.includes(role))
  const showAdminSection = visibleAdmin.length > 0
  const showToolsSection = permissions.canUseTools && visibleTools.length > 0

  return (
    <aside
      className={cn(
        'flex flex-col shrink-0 h-full transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-52',
      )}
      style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border)' }}
    >
      {/* Wordmark */}
      <div
        className={cn(
          'flex items-center border-b shrink-0',
          sidebarCollapsed ? 'justify-center' : 'px-4 gap-2.5',
        )}
        style={{ height: 53, borderColor: 'var(--border)' }}
      >
        <div style={{
          width: 26, height: 26,
          borderRadius: 6,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '256px', opacity: 0.15, pointerEvents: 'none' }} />
          {/* inner top highlight */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'rgba(255,255,255,0.15)', pointerEvents: 'none' }} />
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
      <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
        {/* Core items */}
        {visibleCore.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            path={path}
            label={label}
            icon={icon}
            isActive={!!matchRoute({ to: path, fuzzy: true })}
            collapsed={sidebarCollapsed}
          />
        ))}

        {/* Admin section */}
        {showAdminSection && (
          <>
            <SectionLabel label="Admin" collapsed={sidebarCollapsed} />
            {visibleAdmin.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                path={path}
                label={label}
                icon={icon}
                isActive={!!matchRoute({ to: path, fuzzy: true })}
                collapsed={sidebarCollapsed}
              />
            ))}
          </>
        )}

        {/* Tools section */}
        {showToolsSection && (
          <>
            <SectionLabel label="Ferramentas" collapsed={sidebarCollapsed} />
            {visibleTools.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                path={path}
                label={label}
                icon={icon}
                isActive={!!matchRoute({ to: path, fuzzy: true })}
                collapsed={sidebarCollapsed}
              />
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        {user && (
          sidebarCollapsed ? (
            /* Collapsed: avatar only with tooltip */
            <Tooltip content={`${user.name} · ${ROLE_LABEL[role]}`} side="right">
              <div className="flex justify-center py-2.5">
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  border: '1px solid rgba(232,168,48,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'default',
                }}>
                  <span style={{ fontFamily: 'Geist', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </Tooltip>
          ) : (
            /* Expanded: avatar + name + role */
            <div
              className="flex items-center gap-2.5 px-3"
              style={{ height: 48, borderBottom: '1px solid var(--border)' }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent-dim)',
                border: '1px solid rgba(232,168,48,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Geist', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
                  {user.name}
                </p>
                <p style={{ fontFamily: 'Geist Mono', fontSize: 9, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 2 }}>
                  {ROLE_LABEL[role]}
                </p>
              </div>
            </div>
          )
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          className={cn(
            'flex items-center w-full h-9 px-3 transition-colors duration-150',
            'text-[var(--fg-dim)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]',
            'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
            sidebarCollapsed ? 'justify-center' : 'gap-2',
          )}
        >
          {sidebarCollapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : (
              <>
                <PanelLeftClose className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">Recolher</span>
              </>
            )}
        </button>
      </div>
    </aside>
  )
}
