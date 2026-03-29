import { cn } from '@/shared/utils/cn'

interface SkeletonProps { className?: string; lines?: number }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton rounded', className)} />
}

export function SkeletonCard() {
  return (
    <div className="p-4 bg-surface-1 border border-border rounded-lg space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
