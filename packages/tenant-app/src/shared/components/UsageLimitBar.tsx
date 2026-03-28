import { cn } from '@/shared/utils/cn'
import { usePlanLimit } from '@/shared/hooks/usePlanLimit'

interface UsageLimitBarProps {
  resource: Parameters<typeof usePlanLimit>[0]
  label: string
  className?: string
}

export function UsageLimitBar({ resource, label, className }: UsageLimitBarProps) {
  const { current, max, percentage, isNearLimit, isAtLimit, isUnlimited } = usePlanLimit(resource)

  const barColor = isAtLimit
    ? 'bg-red-500'
    : isNearLimit
    ? 'bg-amber-500'
    : 'bg-[var(--accent)]'

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className={cn('font-mono font-semibold', isAtLimit ? 'text-red-500' : 'text-ink-muted')}>
          {current}{isUnlimited ? '' : ` / ${max >= 9999 ? '∞' : max}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
