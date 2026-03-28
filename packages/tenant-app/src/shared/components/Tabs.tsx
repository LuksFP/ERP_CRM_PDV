import { cn } from '@/shared/utils/cn'

interface Tab { id: string; label: string; icon?: React.ReactNode; badge?: string | number }

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-end gap-0 border-b border-border overflow-x-auto scrollbar-none',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
            active === tab.id
              ? 'text-[var(--accent)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--accent)] after:rounded-t'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          {tab.icon && <span className="shrink-0 opacity-70">{tab.icon}</span>}
          {tab.label}
          {tab.badge !== undefined && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[var(--accent-dim)] text-[var(--accent)] text-[10px] font-mono font-bold rounded-full">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
