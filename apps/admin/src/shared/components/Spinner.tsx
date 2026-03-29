import { cn } from '@/shared/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-3 w-3 border',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-2',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={cn(
        'rounded-full border-accent/30 border-t-accent animate-spin',
        sizes[size],
        className
      )}
    />
  )
}
