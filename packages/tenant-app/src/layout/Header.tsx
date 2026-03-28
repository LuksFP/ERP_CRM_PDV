import { useState } from 'react'
import { Bell, Sun, Moon, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useUIStore } from '@/shared/store/ui'
import { useAuthStore } from '@/modules/auth/store'
import { roleLabels } from '@/shared/utils/formatters'

export function Header() {
  const { theme, toggleTheme } = useUIStore()
  const { tenantConfig, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const user = tenantConfig?.currentUser

  return (
    <header className="h-[57px] flex items-center gap-3 px-4 bg-surface-0 border-b border-border shrink-0">
      {/* Left spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
        </button>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
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
                <div className="absolute right-0 top-full mt-1 w-48 bg-surface-0 border border-border rounded-lg shadow-lg z-20 overflow-hidden animate-fade-up">
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
