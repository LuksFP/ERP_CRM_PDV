import { useState } from 'react'
import { Lock, Zap } from 'lucide-react'
import { Button } from './Button'
import { UpgradeModal } from './UpgradeModal'
import type { ModuleKey } from '@/shared/types'
import { moduleLabels } from '@/shared/utils/formatters'

interface ModuleLockOverlayProps {
  module: ModuleKey
  planName?: string
}

export function ModuleLockOverlay({ module, planName }: ModuleLockOverlayProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[400px] px-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center">
          <Lock size={28} className="text-[var(--accent)]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">{moduleLabels[module]} bloqueado</h2>
          <p className="mt-1 text-sm text-ink-muted max-w-sm">
            Este módulo não está disponível no seu plano{planName ? ` ${planName}` : ''}.
            Faça upgrade para desbloquear recursos avançados.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={() => setUpgradeOpen(true)}>
            <Zap size={13} className="mr-1" />
            Ver planos disponíveis
          </Button>
          <Button variant="ghost" size="sm">
            Falar com suporte
          </Button>
        </div>
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        lockedModule={moduleLabels[module]}
      />
    </>
  )
}
