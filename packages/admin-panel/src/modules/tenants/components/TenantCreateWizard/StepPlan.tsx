import { Check, Lock, Zap, Star, Crown } from 'lucide-react'
import { MOCK_PLANS } from '@/mock/data'
import type { WizardData } from './index'
import { formatCurrency, moduleLabels } from '@/shared/utils/format'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'

interface Props {
  data: Partial<WizardData>
  onUpdate: (d: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

const planIcons = [
  <Zap key="starter" className="h-5 w-5" />,
  <Star key="professional" className="h-5 w-5" />,
  <Crown key="enterprise" className="h-5 w-5" />,
]

export function StepPlan({ data, onUpdate, onNext, onPrev }: Props) {
  const selected = data.planId ?? ''

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-fg mb-0.5">Plano</h3>
        <p className="text-xs text-fg-muted">
          Escolha o plano. Os limites e módulos disponíveis dependem do plano selecionado.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {MOCK_PLANS.map((plan, idx) => {
          const isSelected = selected === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onUpdate({ planId: plan.id })}
              className={cn(
                'relative text-left w-full rounded-card border p-4 transition-all duration-150 outline-none',
                'focus-visible:ring-2 focus-visible:ring-accent',
                isSelected
                  ? 'border-accent bg-accent-dim'
                  : 'border-[var(--border)] bg-surface-2 hover:border-[var(--border-hover)] hover:bg-surface-3'
              )}
            >
              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-4 right-4 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-3 w-3 text-[#0C0A09]" />
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-9 w-9 rounded-card flex items-center justify-center shrink-0"
                  style={{ background: `${plan.color}20`, color: plan.color }}
                >
                  {planIcons[idx]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-fg">{plan.name}</span>
                    {plan.slug === 'professional' && (
                      <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-accent text-[#0C0A09]">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-fg-muted">{plan.description}</p>
                </div>
                <div className="ml-auto text-right pr-8">
                  <p className="text-lg font-semibold text-fg font-mono">
                    {formatCurrency(plan.priceMonthly)}
                  </p>
                  <p className="text-2xs text-fg-dim">/mês</p>
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'Usuários', value: plan.limits.maxUsers === 9999 ? '∞' : plan.limits.maxUsers },
                  { label: 'PDVs', value: plan.limits.maxPDVs },
                  { label: 'Filiais', value: plan.limits.maxBranches },
                  {
                    label: 'Produtos',
                    value: plan.limits.maxProductsSKU === 0 ? '∞' : `${(plan.limits.maxProductsSKU / 1000).toFixed(0)}k`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className={cn(
                      'rounded border text-center py-2',
                      isSelected
                        ? 'border-accent/30 bg-accent/5'
                        : 'border-[var(--border)] bg-surface-3'
                    )}
                  >
                    <p className="text-sm font-semibold font-mono text-fg">{value}</p>
                    <p className="text-2xs text-fg-dim mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Modules */}
              <div className="flex flex-wrap gap-1">
                {plan.limits.modules.map((mod) => (
                  <span
                    key={mod}
                    className="text-2xs font-mono px-1.5 py-0.5 rounded bg-green/10 text-green border border-green/20"
                  >
                    {moduleLabels[mod]}
                  </span>
                ))}
                {!plan.limits.customFieldsEnabled && (
                  <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-surface-3 text-fg-dim border border-[var(--border)] flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    Campos custom
                  </span>
                )}
                {!plan.limits.apiAccess && (
                  <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-surface-3 text-fg-dim border border-[var(--border)] flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    API pública
                  </span>
                )}
              </div>

              {/* Support */}
              <div className="mt-2 flex items-center gap-1.5">
                <div
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    plan.limits.supportLevel === 'priority'
                      ? 'bg-green'
                      : plan.limits.supportLevel === 'chat'
                      ? 'bg-accent'
                      : 'bg-fg-dim'
                  )}
                />
                <span className="text-xs text-fg-dim">
                  Suporte{' '}
                  {plan.limits.supportLevel === 'email'
                    ? 'via Email'
                    : plan.limits.supportLevel === 'chat'
                    ? 'via Chat'
                    : 'Prioritário'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onPrev}>
          Voltar
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!selected}>
          Próximo
        </Button>
      </div>
    </div>
  )
}
