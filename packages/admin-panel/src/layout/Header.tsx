import { Sun, Moon, Bell, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useUIStore } from '@/shared/store/ui'
import { useAuthStore } from '@/modules/auth/store'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'

export function Header() {
  const { theme, toggleTheme } = useUIStore()
  const { user, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const roleLabel: Record<string, string> = {
    superadmin: 'Super Admin',
    support: 'Suporte',
    sales: 'Vendas',
  }

  return (
    <header className="flex items-center justify-between px-6 border-b shrink-0" style={{ height: 53, background: 'var(--bg)', borderColor: 'var(--border)' }}>
      {/* Left: breadcrumb handled by pages */}
      <div />

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
                {user?.role ? roleLabel[user.role] : ''}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-fg-dim" />
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
