import { ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react'
import type { Tenant } from '@/shared/types'
import { formatCurrency, moduleLabels } from '@/shared/utils/format'
import { UsageBar } from '../UsageBar'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'

interface Props { tenant: Tenant }

const planHistory = [
  { date: '2023-06-15', from: 'Starter', to: 'Professional', by: 'Admin Geral' },
  { date: '2023-04-15', from: null, to: 'Starter', by: 'Sistema (criação)' },
]

export function TabPlanLimits({ tenant }: Props) {
  const { plan } = tenant

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      {/* Current plan */}
      <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-fg">{plan.name}</h2>
            <p className="text-sm font-mono text-accent mt-0.5">
              {formatCurrency(plan.priceMonthly)}/mês
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowDown className="h-3.5 w-3.5" />}
            >
              Downgrade
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowUp className="h-3.5 w-3.5" />}
            >
              Upgrade
            </Button>
          </div>
        </div>

        {/* Limits grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Usuários', limit: plan.limits.maxUsers === 9999 ? '∞' : plan.limits.maxUsers, current: tenant.usage.users },
            { label: 'PDVs', limit: plan.limits.maxPDVs, current: tenant.usage.pdvs },
            { label: 'Filiais', limit: plan.limits.maxBranches, current: tenant.usage.branches },
            {
              label: 'Produtos',
              limit: plan.limits.maxProductsSKU === 0 ? '∞' : plan.limits.maxProductsSKU,
              current: tenant.usage.productsSKU,
            },
          ].map(({ label, limit, current }) => (
            <div
              key={label}
              className="bg-surface-2 border border-[var(--border)] rounded-card p-3 text-center"
            >
              <p className="text-xs text-fg-dim mb-1">{label}</p>
              <p className="text-lg font-semibold font-mono text-fg">
                {current}
                <span className="text-sm text-fg-muted">/{limit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Usage bars */}
        <div className="flex flex-col gap-3">
          <UsageBar label="Usuários" current={tenant.usage.users} limit={plan.limits.maxUsers} />
          <UsageBar label="PDVs" current={tenant.usage.pdvs} limit={plan.limits.maxPDVs} />
          <UsageBar label="Filiais" current={tenant.usage.branches} limit={plan.limits.maxBranches} />
          <UsageBar label="Produtos (SKU)" current={tenant.usage.productsSKU} limit={plan.limits.maxProductsSKU} />
        </div>

        {/* Modules */}
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-2">Módulos inclusos</p>
          <div className="flex flex-wrap gap-1.5">
            {plan.limits.modules.map((mod) => (
              <Badge key={mod} variant="success">{moduleLabels[mod]}</Badge>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={plan.limits.customFieldsEnabled ? 'success' : 'neutral'}>
            Campos custom: {plan.limits.customFieldsEnabled ? 'Sim' : 'Não'}
          </Badge>
          <Badge variant={plan.limits.apiAccess ? 'success' : 'neutral'}>
            API pública: {plan.limits.apiAccess ? 'Sim' : 'Não'}
          </Badge>
          <Badge variant="info">
            Suporte: {plan.limits.supportLevel === 'email' ? 'Email' : plan.limits.supportLevel === 'chat' ? 'Chat' : 'Prioritário'}
          </Badge>
        </div>
      </div>

      {/* Downgrade warning example */}
      {tenant.usage.users > 5 && (
        <div className="flex items-start gap-3 p-4 bg-yellow/10 border border-yellow/20 rounded-card">
          <AlertTriangle className="h-4 w-4 text-yellow shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow">Aviso de downgrade</p>
            <p className="text-xs text-fg-muted mt-1">
              Este tenant tem {tenant.usage.users} usuários. Um downgrade para o plano Starter (máx 5) exigiria
              desativar {tenant.usage.users - 5} usuário(s) antes da migração.
            </p>
          </div>
        </div>
      )}

      {/* Plan history */}
      <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
        <h2 className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-4">
          Histórico de Planos
        </h2>
        <div className="flex flex-col gap-0">
          {planHistory.map((h, i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-3 border-b border-[var(--border)] last:border-0"
            >
              <span className="text-xs font-mono text-fg-dim w-20 shrink-0">
                {h.date}
              </span>
              <div className="flex items-center gap-2 flex-1">
                {h.from ? (
                  <>
                    <span className="text-xs text-fg-muted">{h.from}</span>
                    <span className="text-fg-dim">→</span>
                    <span className="text-xs font-medium text-fg">{h.to}</span>
                  </>
                ) : (
                  <span className="text-xs text-fg">Plano inicial: {h.to}</span>
                )}
              </div>
              <span className="text-xs text-fg-dim">{h.by}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
