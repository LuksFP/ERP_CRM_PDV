import { Lock } from 'lucide-react'
import { usePlanLimit } from '@/shared/hooks/usePlanLimit'
import { Button } from './Button'

interface PlanLimitGateProps {
  resource: Parameters<typeof usePlanLimit>[0]
  children: React.ReactNode
  /** Custom message when at limit */
  message?: string
}

export function PlanLimitGate({ resource, children, message }: PlanLimitGateProps) {
  const limit = usePlanLimit(resource)

  if (!limit.isAtLimit) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-0/80 backdrop-blur-sm rounded-lg">
        <Lock size={20} className="text-[var(--accent)]" />
        <p className="text-xs font-medium text-ink text-center px-4">
          {message ?? `Limite de ${limit.max} atingido. Faça upgrade para continuar.`}
        </p>
        <Button size="xs" variant="outline">
          Ver planos
        </Button>
      </div>
    </div>
  )
}
