import { useState } from 'react'
import { UserX, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react'
import type { Tenant } from '@/shared/types'
import { formatDate, formatRelativeTime, formatCurrency, statusLabels, segmentLabels } from '@/shared/utils/format'
import { UsageBar } from '../UsageBar'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { ConfirmModal } from '@/shared/components/ConfirmModal'

interface Props { tenant: Tenant }

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
      <span className="text-xs text-fg-muted">{label}</span>
      <span className="text-sm text-fg font-medium">{value}</span>
    </div>
  )
}

export function TabOverview({ tenant }: Props) {
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'reactivate' | 'cancel' | null>(null)

  const isSuspended = tenant.status === 'suspended'
  const isCancelled = tenant.status === 'cancelled'

  return (
    <div className="max-w-3xl grid grid-cols-2 gap-6">
      {/* Left: basic info */}
      <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
        <h2 className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-4">Dados Básicos</h2>
        <InfoRow label="Nome" value={tenant.name} />
        <InfoRow label="Slug" value={<span className="font-mono">{tenant.slug}</span>} />
        <InfoRow label="CNPJ/CPF" value={
          <span className="font-mono">{tenant.cnpj ?? tenant.cpf ?? '—'}</span>
        } />
        <InfoRow label="Telefone" value={tenant.phone} />
        <InfoRow label="Email" value={tenant.email} />
        <InfoRow label="Segmento" value={segmentLabels[tenant.segment]} />
        <InfoRow label="Criado em" value={formatDate(tenant.createdAt)} />
        <InfoRow label="Último acesso" value={formatRelativeTime(tenant.lastAccessAt)} />
        <InfoRow label="Último sync PDV" value={formatRelativeTime(tenant.lastPdvSyncAt)} />
      </div>

      {/* Right: status + usage */}
      <div className="flex flex-col gap-4">
        {/* Status card */}
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono uppercase tracking-wide text-fg-dim">Status</h2>
            <Badge
              variant={
                tenant.status === 'active'
                  ? 'success'
                  : tenant.status === 'trial'
                  ? 'info'
                  : tenant.status === 'suspended'
                  ? 'warning'
                  : 'danger'
              }
            >
              {statusLabels[tenant.status]}
            </Badge>
          </div>

          <div className="flex flex-col gap-2">
            {!isCancelled && !isSuspended && (
              <Button
                variant="danger"
                size="sm"
                icon={<UserX className="h-3.5 w-3.5" />}
                onClick={() => setConfirmAction('suspend')}
                className="w-full justify-center"
              >
                Suspender conta
              </Button>
            )}
            {isSuspended && (
              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw className="h-3.5 w-3.5" />}
                onClick={() => setConfirmAction('reactivate')}
                className="w-full justify-center"
              >
                Reativar conta
              </Button>
            )}
            {!isCancelled && (
              <Button
                variant="danger"
                size="sm"
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
                onClick={() => setConfirmAction('cancel')}
                className="w-full justify-center"
              >
                Cancelar conta
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={<ExternalLink className="h-3.5 w-3.5" />}
              onClick={() => window.open(`https://${tenant.slug}.erp.com.br`, '_blank')}
              className="w-full justify-center"
            >
              Impersonar
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-fg-muted">MRR atual</span>
              <span className="text-sm font-mono font-semibold text-fg">
                {tenant.status === 'suspended' ? '—' : formatCurrency(tenant.mrr)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-fg-muted">Plano</span>
              <span className="text-sm text-fg">{tenant.plan.name}</span>
            </div>
          </div>
        </div>

        {/* Usage card */}
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <h2 className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-4">
            Uso vs Limites
          </h2>
          <div className="flex flex-col gap-3">
            <UsageBar
              label="Usuários"
              current={tenant.usage.users}
              limit={tenant.plan.limits.maxUsers}
            />
            <UsageBar
              label="PDVs"
              current={tenant.usage.pdvs}
              limit={tenant.plan.limits.maxPDVs}
            />
            <UsageBar
              label="Filiais"
              current={tenant.usage.branches}
              limit={tenant.plan.limits.maxBranches}
            />
            <UsageBar
              label="Produtos (SKU)"
              current={tenant.usage.productsSKU}
              limit={tenant.plan.limits.maxProductsSKU}
            />
          </div>
        </div>
      </div>

      {/* Confirm modals */}
      <ConfirmModal
        open={confirmAction === 'suspend'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => setConfirmAction(null)}
        title="Suspender conta"
        description={`Tem certeza que deseja suspender "${tenant.name}"? O acesso será bloqueado imediatamente.`}
        confirmLabel="Suspender"
        confirmVariant="danger"
      />
      <ConfirmModal
        open={confirmAction === 'reactivate'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => setConfirmAction(null)}
        title="Reativar conta"
        description={`Reativar "${tenant.name}"? O acesso será restaurado.`}
        confirmLabel="Reativar"
        confirmVariant="primary"
      />
      <ConfirmModal
        open={confirmAction === 'cancel'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => setConfirmAction(null)}
        title="Cancelar conta"
        description={`ATENÇÃO: Cancelar "${tenant.name}" é irreversível. Todos os dados serão marcados para exclusão após 30 dias.`}
        confirmLabel="Cancelar conta"
        confirmVariant="danger"
      />
    </div>
  )
}
