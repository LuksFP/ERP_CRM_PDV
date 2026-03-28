import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Edit2, Users, DollarSign, Check, Lock, AlertTriangle, Zap, Star, Crown } from 'lucide-react'
import { MOCK_PLANS } from '@/mock/data'
import type { Plan, ModuleType } from '@/shared/types'
import { formatCurrency, formatNumber, moduleLabels } from '@/shared/utils/format'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { Modal } from '@/shared/components/Modal'
import { Input } from '@/shared/components/Input'
import { cn } from '@/shared/utils/cn'

const planIcons: Record<string, React.ReactNode> = {
  starter: <Zap className="h-5 w-5" />,
  professional: <Star className="h-5 w-5" />,
  enterprise: <Crown className="h-5 w-5" />,
}

const ALL_MODULES: ModuleType[] = ['stock', 'pdv', 'crm', 'financial', 'fiscal', 'hr', 'reports', 'api']

function PlanCard({ plan }: { plan: Plan }) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-card flex items-center justify-center shrink-0"
              style={{ background: `${plan.color}20`, color: plan.color }}
            >
              {planIcons[plan.slug] ?? <Zap className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-fg">{plan.name}</h3>
              <p className="text-2xl font-semibold font-mono text-fg mt-0.5">
                {formatCurrency(plan.priceMonthly)}
                <span className="text-sm text-fg-muted font-sans font-normal">/mês</span>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit2 className="h-3.5 w-3.5" />}
            onClick={() => setEditOpen(true)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-2 rounded p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="h-3 w-3 text-fg-dim" />
              <span className="text-xs text-fg-muted">Tenants</span>
            </div>
            <p className="text-lg font-semibold font-mono text-fg">{formatNumber(plan.tenantCount)}</p>
          </div>
          <div className="bg-surface-2 rounded p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="h-3 w-3 text-fg-dim" />
              <span className="text-xs text-fg-muted">MRR</span>
            </div>
            <p className="text-lg font-semibold font-mono text-accent">{formatCurrency(plan.mrr)}</p>
          </div>
        </div>

        {/* Limits */}
        <div className="border border-[var(--border)] rounded p-3 flex flex-col gap-1.5">
          <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-1">Limites</p>
          {[
            { label: 'Usuários', value: plan.limits.maxUsers === 9999 ? 'Ilimitados' : `${plan.limits.maxUsers}` },
            { label: 'PDVs', value: `${plan.limits.maxPDVs}` },
            { label: 'Filiais', value: `${plan.limits.maxBranches}` },
            { label: 'Produtos', value: plan.limits.maxProductsSKU === 0 ? 'Ilimitados' : formatNumber(plan.limits.maxProductsSKU) },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-fg-muted">{label}</span>
              <span className="text-xs font-mono text-fg">{value}</span>
            </div>
          ))}
        </div>

        {/* Modules */}
        <div>
          <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-2">Módulos</p>
          <div className="flex flex-wrap gap-1">
            {ALL_MODULES.map((mod) => (
              <span
                key={mod}
                className={cn(
                  'text-2xs font-mono px-1.5 py-0.5 rounded border flex items-center gap-1',
                  plan.limits.modules.includes(mod)
                    ? 'bg-green/10 text-green border-green/20'
                    : 'bg-surface-3 text-fg-dim border-[var(--border)]'
                )}
              >
                {plan.limits.modules.includes(mod) ? (
                  <Check className="h-2.5 w-2.5" />
                ) : (
                  <Lock className="h-2.5 w-2.5" />
                )}
                {moduleLabels[mod]}
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={plan.limits.customFieldsEnabled ? 'success' : 'neutral'} size="sm">
            Campos custom
          </Badge>
          <Badge variant={plan.limits.apiAccess ? 'success' : 'neutral'} size="sm">
            API
          </Badge>
          <Badge variant="info" size="sm">
            Suporte {plan.limits.supportLevel}
          </Badge>
        </div>
      </div>

      {/* Edit modal */}
      <EditPlanModal open={editOpen} onClose={() => setEditOpen(false)} plan={plan} />
    </>
  )
}

function EditPlanModal({ open, onClose, plan }: { open: boolean; onClose: () => void; plan: Plan }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Editar plano: ${plan.name}`}
      description="Alterações impactarão todos os tenants que usam este plano."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={onClose}>Salvar alterações</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3 bg-yellow/10 border border-yellow/20 rounded-card">
          <AlertTriangle className="h-4 w-4 text-yellow shrink-0 mt-0.5" />
          <p className="text-xs text-fg-muted">
            Este plano é usado por <strong className="text-fg">{plan.tenantCount} tenants</strong>.
            Reduções de limites podem bloquear funcionalidades para eles.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Nome do plano" defaultValue={plan.name} />
          <Input label="Preço mensal (R$)" type="number" defaultValue={String(plan.priceMonthly)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Máx. usuários" type="number" defaultValue={String(plan.limits.maxUsers === 9999 ? '' : plan.limits.maxUsers)} placeholder="9999 = ilimitado" />
          <Input label="Máx. PDVs" type="number" defaultValue={String(plan.limits.maxPDVs)} />
          <Input label="Máx. filiais" type="number" defaultValue={String(plan.limits.maxBranches)} />
          <Input label="Máx. produtos (0 = ilimitado)" type="number" defaultValue={String(plan.limits.maxProductsSKU)} />
        </div>

        <div>
          <p className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">Módulos</p>
          <div className="flex flex-wrap gap-2">
            {ALL_MODULES.map((mod) => (
              <label key={mod} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={plan.limits.modules.includes(mod)}
                  className="h-3.5 w-3.5 accent-current"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="text-sm text-fg-muted">{moduleLabels[mod]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function PlansPage() {
  const [createOpen, setCreateOpen] = useState(false)

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
      return MOCK_PLANS
    },
  })

  const totalMRR = (plans ?? []).reduce((sum, p) => sum + p.mrr, 0)
  const totalTenants = (plans ?? []).reduce((sum, p) => sum + p.tenantCount, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Planos</h1>
          <p className="text-sm text-fg-muted mt-0.5">
            {totalTenants} tenants · {formatCurrency(totalMRR)} MRR total
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setCreateOpen(true)}
        >
          Novo plano
        </Button>
      </div>

      {/* Summary bar */}
      <div className="bg-surface-1 border border-[var(--border)] rounded-card p-4 mb-6">
        <div className="flex gap-6">
          {(plans ?? []).map((plan) => (
            <div key={plan.id} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: plan.color }} />
              <span className="text-xs text-fg-muted">{plan.name}:</span>
              <span className="text-xs font-mono text-fg">{plan.tenantCount} tenants</span>
              <span className="text-xs text-fg-dim">({formatCurrency(plan.mrr)})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(plans ?? []).map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  )
}
