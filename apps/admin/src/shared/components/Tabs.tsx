import { cn } from '@/shared/utils/cn'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-0.5 border-b border-[var(--border)] overflow-x-auto',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex items-center gap-1.5 px-3 h-10 text-sm whitespace-nowrap',
            'outline-none transition-colors duration-100 select-none',
            'hover:text-fg',
            activeTab === tab.id
              ? 'text-fg font-medium'
              : 'text-fg-muted font-normal',
            'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset rounded-sm'
          )}
        >
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-0.5 text-2xs font-mono px-1 rounded',
                activeTab === tab.id
                  ? 'bg-accent-dim text-accent'
                  : 'bg-surface-3 text-fg-dim'
              )}
            >
              {tab.count}
            </span>
          )}

          {/* Active indicator */}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  )
}
