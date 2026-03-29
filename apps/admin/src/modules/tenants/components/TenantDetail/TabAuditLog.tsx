import { useState } from 'react'
import { Shield, AlertTriangle, ChevronDown } from 'lucide-react'
import { MOCK_AUDIT_LOG } from '@/mock/data'
import type { Tenant } from '@/shared/types'
import { formatDateTime } from '@/shared/utils/format'
import { Badge } from '@/shared/components/Badge'
import { cn } from '@/shared/utils/cn'

interface Props { tenant: Tenant }

const actionColors: Record<string, string> = {
  USER_LOGIN: 'bg-green/10 text-green',
  IMPERSONATION_START: 'bg-yellow/10 text-yellow',
  IMPERSONATION_END: 'bg-yellow/10 text-yellow',
  USER_CREATED: 'bg-blue-500/10 text-blue-400',
  USER_DEACTIVATED: 'bg-red/10 text-red',
  PLAN_CHANGED: 'bg-accent-dim text-accent',
  PDV_OFFLINE: 'bg-red/10 text-red',
  CUSTOM_FIELD_CREATED: 'bg-surface-3 text-fg-muted',
  DEFAULT: 'bg-surface-3 text-fg-muted',
}

export function TabAuditLog({ tenant }: Props) {
  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | '90d'>('30d')
  const [typeFilter, setTypeFilter] = useState('all')

  const logs = MOCK_AUDIT_LOG.filter((l) => l.tenantId === tenant.id)

  const uniqueActions = ['all', ...new Set(logs.map((l) => l.action))]

  return (
    <div className="max-w-4xl flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Period */}
        <div className="flex gap-1 bg-surface-2 border border-[var(--border)] rounded-card p-1">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodFilter(p)}
              className={cn(
                'px-2.5 h-7 rounded text-xs transition-colors',
                periodFilter === p
                  ? 'bg-surface-1 text-fg font-medium'
                  : 'text-fg-muted hover:text-fg'
              )}
            >
              {p === '7d' ? 'Últimos 7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>

        {/* Action type */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-input bg-surface-2 border border-[var(--border)] text-sm text-fg-muted appearance-none outline-none focus:border-accent cursor-pointer"
          >
            {uniqueActions.map((a) => (
              <option key={a} value={a}>{a === 'all' ? 'Todas as ações' : a}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-dim pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-1 border border-[var(--border)] rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['Data/Hora', 'Ação', 'Realizado por', 'IP', 'Detalhes'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wide text-fg-dim whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.filter((l) => typeFilter === 'all' || l.action === typeFilter).map((log, i) => (
              <tr
                key={log.id}
                className={cn(
                  'border-b border-[var(--border)] last:border-0 hover:bg-surface-2 transition-colors',
                  i % 2 !== 0 && 'bg-surface-2/30'
                )}
              >
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-fg-dim whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-2xs font-mono px-1.5 py-0.5 rounded uppercase',
                        actionColors[log.action] ?? actionColors['DEFAULT']
                      )}
                    >
                      {log.action}
                    </span>
                    {log.isImpersonation && (
                      <Badge variant="warning" size="sm">
                        <Shield className="h-2.5 w-2.5 mr-0.5" />
                        Suporte
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-fg">{log.performedBy}</span>
                    {log.performedByRole === 'admin' && (
                      <Badge variant="default" size="sm">Admin</Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono text-fg-dim">{log.ipAddress}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-fg-muted">{log.details}</span>
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-fg-dim">
                  Nenhum registro no período selecionado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
