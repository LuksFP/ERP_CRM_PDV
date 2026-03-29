import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  Search,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  ChevronDown,
  Building2,
  UserX,
  RefreshCw,
  Users,
} from 'lucide-react'
import { MOCK_TENANTS } from '@/mock/data'
import type { Tenant, TenantStatus, SegmentType } from '@/shared/types'
import {
  formatCurrency,
  formatRelativeTime,
  segmentLabels,
  statusLabels,
} from '@/shared/utils/format'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { Input } from '@/shared/components/Input'
import { Spinner } from '@/shared/components/Spinner'
import { EmptyState } from '@/shared/components/EmptyState'
import { UsageBar } from '../components/UsageBar'
import { TenantCreateWizard } from '../components/TenantCreateWizard'

const statusVariant: Record<TenantStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  active: 'success',
  trial: 'info',
  suspended: 'warning',
  cancelled: 'danger',
}

export default function TenantsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all')
  const [segmentFilter, setSegmentFilter] = useState<SegmentType | 'all'>('all')
  const [wizardOpen, setWizardOpen] = useState(false)

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500))
      return MOCK_TENANTS
    },
  })

  const filtered = (tenants ?? []).filter((t) => {
    const matchSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    const matchSegment = segmentFilter === 'all' || t.segment === segmentFilter
    return matchSearch && matchStatus && matchSegment
  })

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-fg">Tenants</h1>
            <p className="text-sm text-fg-muted mt-0.5">
              {isLoading ? '…' : `${tenants?.length ?? 0} clientes cadastrados`}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setWizardOpen(true)}
          >
            Novo Tenant
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Input
            placeholder="Buscar por nome ou slug…"
            icon={<Search className="h-3.5 w-3.5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerClassName="w-64"
          />

          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          <SegmentFilter value={segmentFilter} onChange={setSegmentFilter} />

          {(statusFilter !== 'all' || segmentFilter !== 'all' || search) && (
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setSegmentFilter('all')
              }}
            >
              Limpar
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-12 w-12" />}
            title="Nenhum tenant encontrado"
            description="Tente ajustar os filtros ou criar um novo tenant"
            action={{ label: 'Criar tenant', onClick: () => setWizardOpen(true) }}
          />
        ) : (
          <TenantTable tenants={filtered} />
        )}
      </div>

      {/* Create wizard */}
      <TenantCreateWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </>
  )
}

// ─── TENANT TABLE ─────────────────────────────────────────────────
function TenantTable({ tenants }: { tenants: Tenant[] }) {
  return (
    <div className="bg-surface-1 border border-[var(--border)] rounded-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {['Tenant', 'Segmento', 'Plano', 'Uso', 'MRR', 'Último acesso', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wide text-fg-dim whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant, i) => (
              <TenantRow key={tenant.id} tenant={tenant} odd={i % 2 !== 0} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TenantRow({ tenant, odd }: { tenant: Tenant; odd: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <tr
      className={cn(
        'group border-b border-[var(--border)] last:border-b-0 hover:bg-surface-2 transition-colors',
        odd && 'bg-surface-2/30'
      )}
    >
      {/* Name + slug + status */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded flex items-center justify-center bg-surface-3 shrink-0">
            <span className="text-xs font-semibold text-fg-muted">
              {tenant.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to="/tenants/$tenantId"
                params={{ tenantId: tenant.id }}
                className="text-sm font-medium text-fg hover:text-accent transition-colors truncate max-w-[180px]"
              >
                {tenant.name}
              </Link>
              <Badge variant={statusVariant[tenant.status]} size="sm">
                {statusLabels[tenant.status]}
              </Badge>
            </div>
            <p className="text-xs text-fg-dim font-mono mt-0.5">{tenant.slug}</p>
          </div>
        </div>
      </td>

      {/* Segment */}
      <td className="px-4 py-3 text-xs text-fg-muted">{segmentLabels[tenant.segment]}</td>

      {/* Plan */}
      <td className="px-4 py-3">
        <span className="text-xs font-medium text-fg">{tenant.plan.name}</span>
      </td>

      {/* Usage */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <UsageBar
            label="users"
            current={tenant.usage.users}
            limit={tenant.plan.limits.maxUsers}
            compact
          />
          <UsageBar
            label="PDVs"
            current={tenant.usage.pdvs}
            limit={tenant.plan.limits.maxPDVs}
            compact
          />
          <UsageBar
            label="filiais"
            current={tenant.usage.branches}
            limit={tenant.plan.limits.maxBranches}
            compact
          />
        </div>
      </td>

      {/* MRR */}
      <td className="px-4 py-3">
        <span className="text-xs font-mono font-medium text-fg">
          {tenant.status === 'suspended' ? (
            <span className="text-fg-dim">—</span>
          ) : (
            formatCurrency(tenant.mrr)
          )}
        </span>
      </td>

      {/* Last access */}
      <td className="px-4 py-3 text-xs text-fg-dim">
        {formatRelativeTime(tenant.lastAccessAt)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link to="/tenants/$tenantId" params={{ tenantId: tenant.id }}>
            <Button variant="ghost" size="sm" icon={<ArrowUpRight className="h-3.5 w-3.5" />} />
          </Link>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon={<MoreHorizontal className="h-3.5 w-3.5" />}
              onClick={() => setMenuOpen(!menuOpen)}
            />
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-surface-2 border border-[var(--border)] rounded-card shadow-lg py-1">
                  <Link
                    to="/tenants/$tenantId"
                    params={{ tenantId: tenant.id }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Ver detalhes
                  </Link>
                  <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors">
                    <Users className="h-3.5 w-3.5" />
                    Impersonar
                  </button>
                  <div className="h-px bg-[var(--border)] my-1" />
                  <button
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors',
                      tenant.status === 'suspended'
                        ? 'text-green hover:bg-green/5'
                        : 'text-red hover:bg-red/5'
                    )}
                  >
                    {tenant.status === 'suspended' ? (
                      <><RefreshCw className="h-3.5 w-3.5" /> Reativar</>
                    ) : (
                      <><UserX className="h-3.5 w-3.5" /> Suspender</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── FILTER COMPONENTS ───────────────────────────────────────────
function StatusFilter({
  value,
  onChange,
}: {
  value: TenantStatus | 'all'
  onChange: (v: TenantStatus | 'all') => void
}) {
  const [open, setOpen] = useState(false)
  const options: Array<{ value: TenantStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Todos os status' },
    { value: 'active', label: 'Ativos' },
    { value: 'trial', label: 'Trial' },
    { value: 'suspended', label: 'Suspensos' },
    { value: 'cancelled', label: 'Cancelados' },
  ]
  const current = options.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-3 rounded-input text-sm text-fg-muted bg-surface-2 border border-[var(--border)] hover:border-[var(--border-hover)] hover:text-fg transition-colors"
      >
        {current?.label}
        <ChevronDown className="h-3.5 w-3.5 text-fg-dim" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 w-44 bg-surface-2 border border-[var(--border)] rounded-card shadow-lg py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={cn(
                  'flex items-center w-full px-3 py-2 text-sm transition-colors',
                  opt.value === value
                    ? 'text-accent bg-accent-dim'
                    : 'text-fg-muted hover:text-fg hover:bg-surface-3'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SegmentFilter({
  value,
  onChange,
}: {
  value: SegmentType | 'all'
  onChange: (v: SegmentType | 'all') => void
}) {
  const [open, setOpen] = useState(false)
  const options: Array<{ value: SegmentType | 'all'; label: string }> = [
    { value: 'all', label: 'Todos os segmentos' },
    ...Object.entries(segmentLabels).map(([k, v]) => ({
      value: k as SegmentType,
      label: v,
    })),
  ]
  const current = options.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-3 rounded-input text-sm text-fg-muted bg-surface-2 border border-[var(--border)] hover:border-[var(--border-hover)] hover:text-fg transition-colors"
      >
        {current?.label}
        <ChevronDown className="h-3.5 w-3.5 text-fg-dim" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 w-48 bg-surface-2 border border-[var(--border)] rounded-card shadow-lg py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={cn(
                  'flex items-center w-full px-3 py-2 text-sm transition-colors',
                  opt.value === value
                    ? 'text-accent bg-accent-dim'
                    : 'text-fg-muted hover:text-fg hover:bg-surface-3'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
