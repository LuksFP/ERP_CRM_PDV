import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, Zap, Lock, ArrowRight, Star } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useTenantConfig } from '@/shared/hooks/useTenantConfig'

interface Plan {
  name: string
  price: number
  highlight?: boolean
  features: Array<{ label: string; included: boolean }>
  badge?: string
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: 199,
    features: [
      { label: 'Dashboard', included: true },
      { label: 'Estoque básico (até 1.000 SKUs)', included: true },
      { label: 'PDV / Caixa (1 terminal)', included: true },
      { label: 'Configurações', included: true },
      { label: 'Equipe (até 5 usuários)', included: true },
      { label: '1 filial', included: true },
      { label: 'CRM', included: false },
      { label: 'Financeiro completo', included: false },
      { label: 'Fiscal / NF-e', included: false },
      { label: 'Compras', included: false },
      { label: 'Campos personalizados', included: false },
      { label: 'API & integrações', included: false },
    ],
  },
  {
    name: 'Professional',
    price: 349,
    highlight: true,
    badge: 'Mais popular',
    features: [
      { label: 'Dashboard', included: true },
      { label: 'Estoque completo (ilimitado)', included: true },
      { label: 'PDV / Caixa (até 3 terminais)', included: true },
      { label: 'Configurações', included: true },
      { label: 'Equipe (até 15 usuários)', included: true },
      { label: 'Até 2 filiais', included: true },
      { label: 'CRM', included: true },
      { label: 'Financeiro completo', included: true },
      { label: 'Fiscal / NF-e', included: true },
      { label: 'Compras', included: false },
      { label: 'Campos personalizados', included: true },
      { label: 'API & integrações', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 599,
    features: [
      { label: 'Dashboard', included: true },
      { label: 'Estoque completo (ilimitado)', included: true },
      { label: 'PDV / Caixa (ilimitado)', included: true },
      { label: 'Configurações', included: true },
      { label: 'Equipe (ilimitada)', included: true },
      { label: 'Filiais ilimitadas', included: true },
      { label: 'CRM', included: true },
      { label: 'Financeiro completo', included: true },
      { label: 'Fiscal / NF-e', included: true },
      { label: 'Compras', included: true },
      { label: 'Campos personalizados', included: true },
      { label: 'API & integrações', included: true },
    ],
  },
]

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  /** Optional context — which locked module triggered this */
  lockedModule?: string
}

export function UpgradeModal({ open, onClose, lockedModule }: UpgradeModalProps) {
  const config = useTenantConfig()
  const currentPlan = config.plan.name

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-xl"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={16} className="text-[var(--accent)]" />
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent)]">Fazer upgrade</span>
              </div>
              <h2 className="text-lg font-semibold text-ink">
                {lockedModule
                  ? `${lockedModule} está disponível em planos superiores`
                  : 'Escolha o plano ideal para o seu negócio'}
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Plano atual: <span className="font-medium text-ink">{currentPlan}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-2 text-ink-subtle hover:text-ink transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-3 gap-4 px-6 pb-6 overflow-y-auto">
            {PLANS.map((plan) => {
              const isCurrent = plan.name === currentPlan
              return (
                <div
                  key={plan.name}
                  className={cn(
                    'relative flex flex-col rounded-lg border overflow-hidden transition-all',
                    plan.highlight
                      ? 'border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]'
                      : 'border-border',
                    isCurrent && 'opacity-70',
                  )}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[var(--accent)] text-white">
                        <Star size={8} fill="currentColor" />
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className={cn(
                    'px-5 pt-5 pb-4',
                    plan.highlight ? 'bg-[var(--accent-dim)]' : 'bg-surface-2',
                  )}>
                    <p className="text-sm font-semibold text-ink">{plan.name}</p>
                    <div className="flex items-end gap-1 mt-2">
                      <span className="text-2xl font-bold text-ink" style={{ fontFamily: 'Geist Mono' }}>
                        R${plan.price}
                      </span>
                      <span className="text-xs text-ink-muted mb-1">/mês</span>
                    </div>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono uppercase tracking-wider text-ink-muted">
                        <Check size={10} /> Plano atual
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1 px-5 py-4 space-y-2 bg-surface-1">
                    {plan.features.map((feat) => (
                      <div key={feat.label} className="flex items-start gap-2">
                        {feat.included ? (
                          <Check size={13} className="text-[var(--green)] shrink-0 mt-0.5" />
                        ) : (
                          <Lock size={13} className="text-ink-subtle shrink-0 mt-0.5" />
                        )}
                        <span className={cn(
                          'text-xs leading-relaxed',
                          feat.included ? 'text-ink-muted' : 'text-ink-subtle line-through',
                        )}>
                          {feat.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="px-5 py-4 bg-surface-1 border-t border-border">
                    {isCurrent ? (
                      <div className="w-full h-8 flex items-center justify-center text-xs text-ink-subtle">
                        Plano atual
                      </div>
                    ) : (
                      <button
                        className={cn(
                          'w-full h-8 flex items-center justify-center gap-1.5 rounded-[6px] text-sm font-medium transition-all',
                          plan.highlight
                            ? 'bg-[var(--accent)] text-white hover:opacity-90 active:scale-[0.98]'
                            : 'bg-surface-2 text-ink hover:bg-surface-3 active:scale-[0.98]',
                        )}
                      >
                        {plan.highlight ? (
                          <>
                            <Zap size={13} />
                            Fazer upgrade
                          </>
                        ) : (
                          <>
                            Escolher {plan.name}
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 border-t border-border bg-surface-2 shrink-0">
            <p className="text-xs text-ink-subtle text-center">
              Todos os planos incluem suporte e atualizações. Sem fidelidade mínima. Cancele quando quiser.
            </p>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
