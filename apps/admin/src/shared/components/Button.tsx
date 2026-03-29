import { forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const variants = {
  primary:
    'bg-accent text-[#0C0A09] font-medium hover:brightness-110 active:brightness-95 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
  secondary:
    'bg-surface-2 text-fg border border-[var(--border)] hover:bg-surface-3 hover:border-[var(--border-hover)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
  outline:
    'bg-transparent text-fg border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
  ghost:
    'bg-transparent text-fg-muted hover:text-fg hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
  danger:
    'bg-red/10 text-red border border-red/20 hover:bg-red/20 hover:border-red/40 focus-visible:ring-2 focus-visible:ring-red focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
}

const sizes = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? loading}
        className={cn(
          'inline-flex items-center justify-center rounded-btn font-sans transition-all duration-100 outline-none select-none whitespace-nowrap',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconRight && !loading && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
