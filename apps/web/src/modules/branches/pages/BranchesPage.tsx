import { useState } from 'react'
import {
  Building2, MapPin, Phone, Users, Plus,
  Monitor, ChevronDown, MoreVertical, CheckCircle2,
} from 'lucide-react'
import { MOCK_BRANCHES } from '@/mock/configs'
import { formatRelative } from '@/shared/utils/formatters'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'
import type { Branch, PDVDevice, PDVStatus } from '@/shared/types'

const PDV_STATUS_CONFIG: Record<PDVStatus, { label: string; color: string; dot: string }> = {
  online:  { label: 'Online',   color: 'text-[var(--green)]',  dot: 'bg-[var(--green)]' },
  delayed: { label: 'Atrasado', color: 'text-[var(--yellow)]', dot: 'bg-[var(--yellow)]' },
  offline: { label: 'Offline',  color: 'text-ink-subtle',      dot: 'bg-surface-3' },
}

function PDVRow({ pdv }: { pdv: PDVDevice }) {
  const config = PDV_STATUS_CONFIG[pdv.status]

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-[6px] hover:bg-surface-2 transition-colors group">
      <div className={cn('w-2 h-2 rounded-full shrink-0', config.dot)} />
      <Monitor size={13} className="text-ink-subtle shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">PDV {pdv.number}</span>
          <span className={cn('text-xs font-mono', config.color)}>{config.label}</span>
        </div>
        {pdv.currentOperator && (
          <p className="text-xs text-ink-muted truncate mt-0.5">Operador: {pdv.currentOperator}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-ink-subtle">Sync {formatRelative(pdv.lastSyncAt)}</p>
        <p className="text-[10px] text-ink-subtle font-mono">v{pdv.appVersion}</p>
      </div>
    </div>
  )
}

function BranchCard({ branch }: { branch: Branch }) {
  const [expanded, setExpanded] = useState(true)
  const onlineCount = branch.pdvs.filter((p) => p.status === 'online').length
  const totalCount  = branch.pdvs.length

  return (
    <div className="bg-surface-1 border border-border rounded-lg overflow-hidden">
      {/* Card header */}
      <div className="flex items-start gap-3 p-4 border-b border-border">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--accent-dim)]">
          <Building2 size={16} className="text-[var(--accent)]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-ink">{branch.name}</h3>
            {branch.isMain && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[var(--accent-dim)] text-[var(--accent)] border border-[rgba(226,163,54,0.2)]">
                <CheckCircle2 size={9} />
                Matriz
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <MapPin size={11} className="text-ink-subtle" />
              <span className="truncate">{branch.address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Phone size={11} className="text-ink-subtle" />
              {branch.phone}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Users size={11} className="text-ink-subtle" />
              {branch.userCount} usuários
            </div>
            {branch.managerName && (
              <div className="text-xs text-ink-muted">
                Gerente: <span className="text-ink">{branch.managerName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* PDV summary pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-xs">
            <span className={cn('w-1.5 h-1.5 rounded-full', onlineCount > 0 ? 'bg-[var(--green)]' : 'bg-surface-3')} />
            <span className="text-ink-muted font-mono">{onlineCount}/{totalCount} PDVs</span>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded hover:bg-surface-2 text-ink-subtle hover:text-ink transition-colors"
          >
            <ChevronDown size={14} className={cn('transition-transform', expanded && 'rotate-180')} />
          </button>

          <div className="relative">
            <button className="p-1.5 rounded hover:bg-surface-2 text-ink-subtle hover:text-ink transition-colors">
              <MoreVertical size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* PDV list */}
      {expanded && (
        <div className="px-3 py-2">
          {branch.pdvs.length === 0 ? (
            <p className="text-sm text-ink-subtle py-3 px-1 italic">Nenhum PDV configurado nesta filial.</p>
          ) : (
            <>
              {branch.pdvs.map((pdv) => (
                <PDVRow key={pdv.id} pdv={pdv} />
              ))}
            </>
          )}
          <div className="mt-2 pt-2 border-t border-border">
            <button className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-[var(--accent)] transition-colors px-3 py-1.5 rounded hover:bg-[var(--accent-dim)]">
              <Plus size={12} />
              Adicionar PDV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BranchesPage() {
  const totalPDVs   = MOCK_BRANCHES.reduce((acc, b) => acc + b.pdvs.length, 0)
  const onlinePDVs  = MOCK_BRANCHES.reduce((acc, b) => acc + b.pdvs.filter((p) => p.status === 'online').length, 0)
  const offlinePDVs = MOCK_BRANCHES.reduce((acc, b) => acc + b.pdvs.filter((p) => p.status === 'offline').length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-ink">Filiais e PDVs</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {MOCK_BRANCHES.length} filiais · {totalPDVs} terminais cadastrados
          </p>
        </div>
        <Button size="sm" onClick={() => {}}>
          <Plus size={14} className="mr-1.5" />
          Nova filial
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Filiais',        value: MOCK_BRANCHES.length, color: 'var(--accent)' },
          { label: 'PDVs online',    value: onlinePDVs,           color: 'var(--green)' },
          { label: 'PDVs offline',   value: offlinePDVs,          color: 'var(--fg-muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-1 border border-border rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="text-2xl font-bold" style={{ color, fontFamily: 'Geist Mono' }}>{value}</span>
            <span className="text-sm text-ink-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Branch cards */}
      <div className="space-y-4">
        {MOCK_BRANCHES.map((branch) => (
          <BranchCard key={branch.id} branch={branch} />
        ))}
      </div>
    </div>
  )
}
