import { cn } from '@/shared/utils/cn'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

const variants = {
  default: 'bg-accent-dim text-accent border border-accent/20',
  success: 'bg-green/10 text-green border border-green/20',
  warning: 'bg-yellow/10 text-yellow border border-yellow/20',
  danger: 'bg-red/10 text-red border border-red/20',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  neutral: 'bg-surface-3 text-fg-muted border border-[var(--border)]',
}

const sizes = {
  sm: 'text-2xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium rounded-badge uppercase tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
