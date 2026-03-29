import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Search, LayoutDashboard, Package, ShoppingCart, Users2,
  Wallet, Settings, Users, Building2,
  Sun, Moon, LogOut, ChevronRight,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useUIStore } from '@/shared/store/ui'
import { useAuthStore } from '@/modules/auth/store'
import { usePermissions } from '@/shared/hooks/usePermissions'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  group: string
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-[var(--accent-dim)] text-[var(--accent)] rounded-[2px] not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { toggleTheme, theme } = useUIStore()
  const logout = useAuthStore((s) => s.logout)
  const { canAccess } = usePermissions()

  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const go = useCallback((path: string) => {
    navigate(path)
    onClose()
  }, [navigate, onClose])

  const commands = useMemo<Command[]>(() => {
    const navItems: Command[] = [
      { id: 'nav-dashboard',  label: 'Dashboard',       icon: LayoutDashboard, group: 'Navegar', action: () => go('/dashboard'),  keywords: ['inicio', 'home'] },
      { id: 'nav-inventory',  label: 'Estoque',         icon: Package,         group: 'Navegar', action: () => go('/inventory'),  keywords: ['produto', 'sku'] },
      { id: 'nav-pdv',        label: 'PDV / Caixa',     icon: ShoppingCart,    group: 'Navegar', action: () => go('/pdv'),        keywords: ['venda', 'caixa', 'pdv'] },
      { id: 'nav-crm',        label: 'CRM',             icon: Users2,          group: 'Navegar', action: () => go('/crm'),        keywords: ['cliente', 'contato', 'deal'] },
      { id: 'nav-financial',  label: 'Financeiro',      icon: Wallet,          group: 'Navegar', action: () => go('/financial'),  keywords: ['financas', 'dre', 'fluxo'] },
      { id: 'nav-team',       label: 'Equipe',          icon: Users,           group: 'Navegar', action: () => go('/team'),       keywords: ['usuario', 'membro', 'staff'] },
      { id: 'nav-branches',   label: 'Filiais e PDVs',  icon: Building2,       group: 'Navegar', action: () => go('/branches'),   keywords: ['filial', 'terminal'] },
      { id: 'nav-settings',   label: 'Configurações',   icon: Settings,        group: 'Navegar', action: () => go('/settings'),   keywords: ['config', 'setup'] },
    ].filter((cmd) => {
      const moduleKey = cmd.id.replace('nav-', '') as Parameters<typeof canAccess>[0]
      // dashboard and settings always visible
      if (moduleKey === 'dashboard' || moduleKey === 'settings') return true
      return canAccess(moduleKey as Parameters<typeof canAccess>[0])
    })

    const actions: Command[] = [
      {
        id: 'action-theme',
        label: theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro',
        icon: theme === 'dark' ? Sun : Moon,
        group: 'Ações',
        action: () => { toggleTheme(); onClose() },
        keywords: ['tema', 'dark', 'light', 'escuro', 'claro'],
      },
      {
        id: 'action-logout',
        label: 'Sair da conta',
        icon: LogOut,
        group: 'Ações',
        action: () => { logout(); onClose() },
        keywords: ['logout', 'sair', 'deslogar'],
      },
    ]

    return [...navItems, ...actions]
  }, [go, canAccess, theme, toggleTheme, logout, onClose])

  const filtered = useMemo(() => {
    if (!query) return commands
    const q = query.toLowerCase()
    return commands.filter((cmd) => {
      const inLabel = cmd.label.toLowerCase().includes(q)
      const inKeywords = cmd.keywords?.some((k) => k.includes(q))
      const inDesc = cmd.description?.toLowerCase().includes(q)
      return inLabel || inKeywords || inDesc
    })
  }, [commands, query])

  // Group results
  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    for (const cmd of filtered) {
      const arr = groups[cmd.group] ?? (groups[cmd.group] = [])
      arr.push(cmd)
    }
    return groups
  }, [filtered])

  // Reset state on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[activeIdx]
      if (cmd) cmd.action()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [filtered, activeIdx, onClose])

  // Reset active index on filter change
  useEffect(() => { setActiveIdx(0) }, [query])

  if (!open) return null

  // Flatten for keyboard index mapping
  const flatItems = filtered

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="fixed left-1/2 top-[20vh] -translate-x-1/2 z-50 w-full max-w-[540px] mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div
          className="bg-surface-1 border border-border rounded-xl shadow-xl overflow-hidden"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 border-b border-border h-13" style={{ height: 52 }}>
            <Search size={16} className="text-ink-subtle shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar páginas e ações…"
              className="flex-1 bg-transparent text-sm text-ink placeholder-ink-subtle outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-ink-subtle bg-surface-2 border border-border">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="overflow-y-auto max-h-[360px] py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-ink-subtle">
                Nenhum resultado para "<span className="text-ink">{query}</span>"
              </div>
            ) : (
              Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <p className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-ink-subtle">{group}</p>
                  {items.map((cmd) => {
                    const globalIdx = flatItems.indexOf(cmd)
                    const isActive = globalIdx === activeIdx
                    const Icon = cmd.icon
                    return (
                      <button
                        key={cmd.id}
                        data-active={isActive}
                        onClick={cmd.action}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          isActive ? 'bg-[var(--accent-dim)]' : 'hover:bg-surface-2',
                        )}
                      >
                        <div className={cn(
                          'w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 transition-colors',
                          isActive ? 'bg-[rgba(226,163,54,0.2)]' : 'bg-surface-2',
                        )}>
                          <Icon size={14} className={isActive ? 'text-[var(--accent)]' : 'text-ink-muted'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-sm', isActive ? 'text-[var(--accent)] font-medium' : 'text-ink')}>
                            {highlight(cmd.label, query)}
                          </p>
                          {cmd.description && (
                            <p className="text-xs text-ink-muted truncate">{cmd.description}</p>
                          )}
                        </div>
                        {isActive && <ChevronRight size={14} className="text-[var(--accent)] shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-3 px-4 py-2 border-t border-border">
            <div className="flex items-center gap-1 text-[10px] text-ink-subtle">
              <kbd className="px-1 py-0.5 rounded text-[10px] font-mono bg-surface-2 border border-border">↑↓</kbd>
              navegar
            </div>
            <div className="flex items-center gap-1 text-[10px] text-ink-subtle">
              <kbd className="px-1 py-0.5 rounded text-[10px] font-mono bg-surface-2 border border-border">↵</kbd>
              executar
            </div>
            <div className="flex items-center gap-1 text-[10px] text-ink-subtle">
              <kbd className="px-1 py-0.5 rounded text-[10px] font-mono bg-surface-2 border border-border">ESC</kbd>
              fechar
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
