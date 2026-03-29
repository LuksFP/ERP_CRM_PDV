import { useState } from 'react'
import { Plus, MapPin, Monitor, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { MOCK_TENANT_BRANCHES } from '@/mock/data'
import type { Tenant, Branch, PDV, PDVStatus } from '@/shared/types'
import { formatRelativeTime, pdvStatusLabels } from '@/shared/utils/format'
import { UsageBar } from '../UsageBar'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { Tooltip } from '@/shared/components/Tooltip'
import { Spinner } from '@/shared/components/Spinner'
import { cn } from '@/shared/utils/cn'

interface Props { tenant: Tenant }

const pdvStatusVariant: Record<PDVStatus, 'success' | 'danger' | 'warning'> = {
  online: 'success',
  offline: 'danger',
  maintenance: 'warning',
}

function PDVItem({ pdv }: { pdv: PDV }) {
  const syncAge = pdv.lastSyncAt
    ? Date.now() - new Date(pdv.lastSyncAt).getTime()
    : null
  const isStale = syncAge !== null && syncAge > 2 * 60 * 60 * 1000 // 2h

  return (
    <div className="flex items-center gap-3 py-2 px-3 ml-6 rounded-btn hover:bg-surface-3/50 transition-colors group">
      <Monitor
        className={cn(
          'h-4 w-4 shrink-0',
          pdv.status === 'online' ? 'text-green' : 'text-red'
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-fg font-medium">PDV #{pdv.number}</span>
          <Badge variant={pdvStatusVariant[pdv.status]} size="sm">
            {pdvStatusLabels[pdv.status]}
          </Badge>
          {isStale && pdv.status === 'online' && (
            <Tooltip content="Sem sync há mais de 2h">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow" />
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-fg-dim">
            Sync: {formatRelativeTime(pdv.lastSyncAt)}
          </span>
          {pdv.currentOperator && (
            <span className="text-xs text-fg-dim">
              Op.: {pdv.currentOperator}
            </span>
          )}
          <span className="text-xs text-fg-dim font-mono">v{pdv.appVersion}</span>
        </div>
      </div>
    </div>
  )
}

function BranchCard({ branch }: { branch: Branch }) {
  const [expanded, setExpanded] = useState(true)
  const allOffline = branch.pdvs.every((p) => p.status === 'offline')

  return (
    <div className="border border-[var(--border)] rounded-card overflow-hidden">
      {/* Branch header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-surface-2 cursor-pointer hover:bg-surface-3 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <button className="text-fg-dim">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <MapPin className="h-4 w-4 text-fg-muted shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-fg">{branch.name}</span>
            {branch.isMain && <Badge variant="default" size="sm">Principal</Badge>}
            {allOffline && branch.pdvs.length > 0 && (
              <Badge variant="danger" size="sm">Todos offline</Badge>
            )}
          </div>
          <p className="text-xs text-fg-dim mt-0.5 truncate">{branch.address}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-fg-dim">
          <span>{branch.pdvs.length} PDV{branch.pdvs.length !== 1 ? 's' : ''}</span>
          {branch.managerName && <span>— {branch.managerName}</span>}
        </div>
      </div>

      {/* PDVs */}
      {expanded && (
        <div className="py-1.5">
          {branch.pdvs.length === 0 ? (
            <p className="text-xs text-fg-dim px-6 py-3">Nenhum PDV nesta filial</p>
          ) : (
            branch.pdvs.map((pdv) => <PDVItem key={pdv.id} pdv={pdv} />)
          )}
          <div className="px-6 pt-1">
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              className="text-fg-dim"
            >
              Adicionar PDV
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function TabBranchesPDVs({ tenant }: Props) {
  const atBranchLimit = tenant.usage.branches >= tenant.plan.limits.maxBranches
  const atPDVLimit = tenant.usage.pdvs >= tenant.plan.limits.maxPDVs

  const { data: branches, isLoading } = useQuery({
    queryKey: ['tenant-branches', tenant.id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
      return MOCK_TENANT_BRANCHES[tenant.id] ?? []
    },
  })

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      {/* Usage bars */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-4">
          <UsageBar
            label="Filiais"
            current={tenant.usage.branches}
            limit={tenant.plan.limits.maxBranches}
          />
        </div>
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-4">
          <UsageBar
            label="PDVs"
            current={tenant.usage.pdvs}
            limit={tenant.plan.limits.maxPDVs}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Tooltip
          content={atBranchLimit ? 'Limite de filiais atingido. Faça upgrade.' : 'Criar nova filial'}
        >
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            disabled={atBranchLimit}
          >
            Nova filial
          </Button>
        </Tooltip>
        <Tooltip
          content={atPDVLimit ? 'Limite de PDVs atingido. Faça upgrade.' : 'Criar PDV'}
        >
          <Button
            variant="secondary"
            size="sm"
            icon={<Monitor className="h-4 w-4" />}
            disabled={atPDVLimit}
          >
            Novo PDV
          </Button>
        </Tooltip>
      </div>

      {/* Branches list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(branches ?? []).map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      )}
    </div>
  )
}
