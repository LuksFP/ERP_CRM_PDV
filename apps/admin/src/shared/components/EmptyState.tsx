import { cn } from '@/shared/utils/cn'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-8',
        className
      )}
    >
      {icon && (
        <div className="text-fg-dim mb-4 opacity-40">{icon}</div>
      )}
      <p className="text-sm font-medium text-fg-muted">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-fg-dim max-w-xs">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
