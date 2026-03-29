import { useState } from 'react'
import { Bell, Sun, Moon, LogOut, ChevronDown, LayoutDashboard, Package, ShoppingCart, Users2, Wallet, FileText, ShoppingBag, Settings, Users, Building2, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import { useUIStore } from '@/shared/store/ui'
import { useAuthStore } from '@/modules/auth/store'
import { roleLabels } from '@/shared/utils/formatters'
import { NotificationsPanel } from '@/shared/components/NotificationsPanel'

const PAGE_META: Record<string, { label: string; icon: React.ElementType }> = {
  '/dashboard':  { label: 'Dashboard',      icon: LayoutDashboard },
  '/inventory':  { label: 'Estoque',         icon: Package },
  '/pdv':        { label: 'PDV',             icon: ShoppingCart },
  '/crm':        { label: 'CRM',             icon: Users2 },
  '/financial':  { label: 'Financeiro',      icon: Wallet },
  '/fiscal':     { label: 'Fiscal',          icon: FileText },
  '/purchasing': { label: 'Compras',         icon: ShoppingBag },
  '/team':       { label: 'Equipe',          icon: Users },
  '/branches':   { label: 'Filiais e PDVs',  icon: Building2 },
  '/settings':   { label: 'Configurações',   icon: Settings },
}

interface HeaderProps {
  onOpenCommandPalette?: () => void
}

export function Header({ onOpenCommandPalette }: HeaderProps) {
  const { theme, toggleTheme } = useUIStore()
  const { tenantConfig, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const location = useLocation()

  const user = tenantConfig?.currentUser

  const matchedKey = Object.keys(PAGE_META)
    .sort((a, b) => b.length - a.length)
    .find(k => location.pathname === k || location.pathname.startsWith(k + '/'))
  const pageMeta = matchedKey ? PAGE_META[matchedKey] : undefined
  const PageIcon = pageMeta?.icon

  return (
    <header className="h-[57px] flex items-center gap-3 px-4 bg-surface-0 border-b border-border shrink-0">
      {/* Left: page context */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {PageIcon && <PageIcon size={15} className="text-ink-subtle shrink-0" />}
        {pageMeta && (
          <span className="text-sm font-medium text-ink truncate">{pageMeta.label}</span>
        )}
      </div>

      {/* Command palette trigger */}
      {onOpenCommandPalette && (
        <button
          onClick={onOpenCommandPalette}
          aria-label="Abrir busca (Ctrl+K)"
          className={cn(
            'hidden md:flex items-center gap-2 px-3 h-8 rounded-[6px] text-sm text-ink-subtle',
            'bg-surface-1 border border-border hover:border-border-hover hover:text-ink',
            'transition-colors',
          )}
        >
          <Search size={13} />
          <span className="text-xs">Buscar…</span>
          <kbd className="flex items-center gap-0.5 ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-2 border border-border">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Mobile search */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            aria-label="Buscar"
            className="md:hidden p-2 rounded text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <Search size={16} />
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          className="p-2 rounded text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            aria-label="Notificações"
            onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false) }}
            className={cn(
              'relative p-2 rounded text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors',
              notifOpen && 'bg-surface-2 text-ink',
            )}
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" aria-hidden="true" />
          </button>
          <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => { setMenuOpen((v) => !v); setNotifOpen(false) }}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className={cn(
                'flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-surface-2 transition-colors text-sm',
                menuOpen && 'bg-surface-2'
              )}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
              >
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-ink leading-tight">{user.name.split(' ')[0]}</p>
                <p className="text-[10px] font-mono text-ink-subtle uppercase">{roleLabels[user.role]}</p>
              </div>
              <ChevronDown size={13} className={cn('text-ink-subtle transition-transform', menuOpen && 'rotate-180')} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface-0 border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-sm font-semibold text-ink">{user.name}</p>
                    <p className="text-xs text-ink-muted">{user.email}</p>
                  </div>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
                    onClick={() => { setMenuOpen(false); logout() }}
                  >
                    <LogOut size={14} />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
