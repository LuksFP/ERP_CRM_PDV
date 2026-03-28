import { cn } from '@/shared/utils/cn'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent' | 'default'

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger:  'bg-red-500/10 text-red-600 dark:text-red-400',
  info:    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  neutral: 'bg-surface-2 text-ink-muted',
  accent:  'bg-[var(--accent-dim)] text-[var(--accent)]',
  default: 'bg-surface-2 text-ink border border-border',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-widest rounded-[2px]',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
