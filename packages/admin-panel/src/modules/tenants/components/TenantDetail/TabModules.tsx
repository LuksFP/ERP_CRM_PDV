import { useState } from 'react'
import { Lock } from 'lucide-react'
import type { Tenant, ModuleType } from '@/shared/types'
import { moduleLabels } from '@/shared/utils/format'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import { cn } from '@/shared/utils/cn'

interface Props { tenant: Tenant }

const ALL_MODULES: ModuleType[] = ['stock', 'pdv', 'crm', 'financial', 'fiscal', 'hr', 'reports', 'api']

const moduleDescriptions: Record<ModuleType, string> = {
  stock: 'Gestão completa de estoque, movimentações, inventário e alertas de reposição',
  pdv: 'Ponto de venda, abertura/fechamento de caixa, sangrias e suprimentos',
  crm: 'Gestão de clientes, contatos, negociações e pipeline de vendas',
  financial: 'Contas a pagar/receber, DRE, fluxo de caixa e conciliação bancária',
  fiscal: 'Emissão de NF-e, NFC-e, CT-e e integração com SEFAZ',
  hr: 'Gestão de funcionários, jornada, ponto eletrônico e folha de pagamento',
  reports: 'Relatórios avançados, dashboards customizáveis e exportação de dados',
  api: 'Acesso à API pública para integrações com sistemas externos',
}

export function TabModules({ tenant }: Props) {
  const [confirmModule, setConfirmModule] = useState<{ mod: ModuleType; enabling: boolean } | null>(null)
  const [activeModules, setActiveModules] = useState<Set<ModuleType>>(
    new Set(tenant.plan.limits.modules)
  )

  const planModules = new Set(tenant.plan.limits.modules)

  const handleToggle = (mod: ModuleType) => {
    const isActive = activeModules.has(mod)
    setConfirmModule({ mod, enabling: !isActive })
  }

  const confirmToggle = () => {
    if (!confirmModule) return
    setActiveModules((prev) => {
      const next = new Set(prev)
      if (next.has(confirmModule.mod)) {
        next.delete(confirmModule.mod)
      } else {
        next.add(confirmModule.mod)
      }
      return next
    })
    setConfirmModule(null)
  }

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-1 gap-3">
        {ALL_MODULES.map((mod) => {
          const inPlan = planModules.has(mod)
          const isActive = activeModules.has(mod)

          return (
            <div
              key={mod}
              className={cn(
                'flex items-center gap-4 p-4 rounded-card border transition-all',
                inPlan
                  ? 'bg-surface-1 border-[var(--border)]'
                  : 'bg-surface-2/50 border-[var(--border)] opacity-60'
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-fg">{moduleLabels[mod]}</p>
                  {!inPlan && (
                    <span className="flex items-center gap-1 text-2xs font-mono px-1.5 py-0.5 rounded bg-surface-3 text-fg-dim border border-[var(--border)]">
                      <Lock className="h-2.5 w-2.5" />
                      Requer Professional+
                    </span>
                  )}
                  {inPlan && isActive && (
                    <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-green/10 text-green border border-green/20">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-fg-muted mt-0.5">{moduleDescriptions[mod]}</p>
              </div>

              {inPlan ? (
                <button
                  onClick={() => handleToggle(mod)}
                  className={cn(
                    'relative h-5 w-9 rounded-full transition-colors shrink-0 outline-none',
                    'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface-1',
                    isActive ? 'bg-green' : 'bg-surface-3'
                  )}
                  role="switch"
                  aria-checked={isActive}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                      isActive ? 'translate-x-4' : 'translate-x-0.5'
                    )}
                  />
                </button>
              ) : (
                <Lock className="h-4 w-4 text-fg-dim shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      <ConfirmModal
        open={!!confirmModule}
        onClose={() => setConfirmModule(null)}
        onConfirm={confirmToggle}
        title={confirmModule?.enabling ? `Ativar ${moduleLabels[confirmModule.mod]}` : `Desativar ${confirmModule ? moduleLabels[confirmModule.mod] : ''}`}
        description={
          confirmModule?.enabling
            ? `Ativar o módulo "${confirmModule ? moduleLabels[confirmModule.mod] : ''}" para ${tenant.name}? Os dados serão acessíveis imediatamente.`
            : `Desativar o módulo "${confirmModule ? moduleLabels[confirmModule.mod] : ''}"? O tenant perderá acesso a essa funcionalidade.`
        }
        confirmLabel={confirmModule?.enabling ? 'Ativar' : 'Desativar'}
        confirmVariant={confirmModule?.enabling ? 'primary' : 'danger'}
      />
    </div>
  )
}
