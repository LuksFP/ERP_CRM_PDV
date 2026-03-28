import { cn } from '@/shared/utils/cn'
import { Tooltip } from '@/shared/components/Tooltip'

interface UsageBarProps {
  label: string
  current: number
  limit: number
  compact?: boolean
}

export function UsageBar({ label, current, limit, compact = false }: UsageBarProps) {
  const isUnlimited = limit === 0 || limit === 9999
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100)
  const atLimit = !isUnlimited && current >= limit
  const nearLimit = !isUnlimited && percentage >= 80

  const barColor = atLimit
    ? 'bg-red'
    : nearLimit
    ? 'bg-yellow'
    : 'bg-green'

  const labelText = isUnlimited
    ? `${current} / ∞`
    : `${current}/${limit}`

  const tooltipText = atLimit
    ? `Limite atingido! ${current}/${limit} ${label}`
    : `${current} de ${isUnlimited ? 'ilimitados' : limit} ${label} (${Math.round(percentage)}%)`

  if (compact) {
    return (
      <Tooltip content={tooltipText} side="top">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden min-w-[40px]">
            {!isUnlimited && (
              <div
                className={cn('h-full rounded-full transition-all', barColor)}
                style={{ width: `${percentage}%` }}
              />
            )}
          </div>
          <span className={cn('text-2xs font-mono shrink-0', atLimit ? 'text-red' : nearLimit ? 'text-yellow' : 'text-fg-dim')}>
            {labelText}
          </span>
          {atLimit && <span className="text-red text-2xs">⚠</span>}
        </div>
      </Tooltip>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-fg-muted">{label}</span>
        <span
          className={cn(
            'text-xs font-mono',
            atLimit ? 'text-red font-medium' : nearLimit ? 'text-yellow' : 'text-fg-muted'
          )}
        >
          {labelText}
          {atLimit && ' ⚠ Limite atingido'}
        </span>
      </div>
      <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
        {!isUnlimited ? (
          <div
            className={cn('h-full rounded-full transition-all duration-300', barColor)}
            style={{ width: `${percentage}%` }}
          />
        ) : (
          <div className="h-full w-full bg-surface-3 rounded-full" />
        )}
      </div>
    </div>
  )
}
