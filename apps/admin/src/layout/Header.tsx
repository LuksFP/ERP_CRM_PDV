import {
  Sun, Moon, Bell, LogOut, ChevronDown,
  LayoutDashboard, Building2, CreditCard, Tag, BarChart3, ClipboardList, CalendarDays,
} from 'lucide-react'
import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useUIStore } from '@/shared/store/ui'
import { useAuthStore } from '@/modules/auth/store'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'

const PAGE_META: Record<string, { label: string; icon: React.ElementType }> = {
  '/dashboard':            { label: 'Dashboard',       icon: LayoutDashboard },
  '/tenants':              { label: 'Tenants',          icon: Building2 },
  '/plans':                { label: 'Planos',           icon: CreditCard },
  '/segments':             { label: 'Segmentos',        icon: Tag },
  '/analytics':            { label: 'Analytics',        icon: BarChart3 },
  '/tools/service-orders': { label: 'Ordem de Serviço', icon: ClipboardList },
  '/tools/agenda':         { label: 'Agenda',           icon: CalendarDays },
}

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Super Admin',
  support:    'Suporte',
  sales:      'Vendas',
  technician: 'Técnico',
}

export function Header() {
  const { theme, toggleTheme } = useUIStore()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const routerState = useRouterState()

  const pathname = routerState.location.pathname
  const matchedKey = Object.keys(PAGE_META)
    .sort((a, b) => b.length - a.length)
    .find(k => pathname === k || pathname.startsWith(k + '/'))
  const pageMeta = matchedKey ? PAGE_META[matchedKey] : undefined
  const PageIcon = pageMeta?.icon

  return (
    <header className="flex items-center justify-between px-6 border-b shrink-0" style={{ height: 53, background: 'var(--bg)', borderColor: 'var(--border)' }}>
      {/* Left: page context */}
      <div className="flex items-center gap-2">
        {PageIcon && <PageIcon className="h-[15px] w-[15px]" style={{ color: 'var(--fg-dim)' }} />}
        {pageMeta && (
          <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
            {pageMeta.label}
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          icon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          onClick={toggleTheme}
          aria-label="Alternar tema"
        />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          icon={<Bell className="h-4 w-4" />}
          aria-label="Notificações"
          className="relative"
        >
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
        </Button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className={cn(
              'flex items-center gap-2 h-9 pl-2 pr-3 rounded-btn',
              'text-sm text-fg-muted hover:text-fg hover:bg-surface-2',
              'transition-colors duration-100 outline-none',
              'focus-visible:ring-2 focus-visible:ring-accent'
            )}
          >
            <div className="h-6 w-6 rounded-full bg-accent-dim flex items-center justify-center shrink-0">
              <span className="text-2xs font-semibold text-accent">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-xs font-medium text-fg">{user?.name}</span>
              <span className="text-2xs text-fg-dim">
                {user?.role ? ROLE_LABEL[user.role] : ''}
              </span>
            </div>
            <ChevronDown className={cn('h-3.5 w-3.5 text-fg-dim transition-transform duration-150', menuOpen && 'rotate-180')} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-surface-2 border border-[var(--border)] rounded-card shadow-lg py-1">
                <div className="px-3 py-2 border-b border-[var(--border)]">
                  <p className="text-xs font-medium text-fg">{user?.name}</p>
                  <p className="text-2xs text-fg-dim mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-fg-muted hover:text-red hover:bg-red/5 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
