import { useState } from 'react'
import { Plus, Users2, DollarSign, ArrowRight } from 'lucide-react'
import { MOCK_DEALS, MOCK_CONTACTS } from '@/mock/configs'
import { formatCurrency, formatDate, dealStageLabels } from '@/shared/utils/formatters'
import { useMockQuery } from '@/shared/hooks/useMockQuery'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Tabs } from '@/shared/components/Tabs'
import { Skeleton } from '@/shared/components/Skeleton'
import { cn } from '@/shared/utils/cn'
import type { DealStage } from '@/shared/types'

const STAGES: DealStage[] = ['lead', 'contact', 'proposal', 'negotiation', 'won', 'lost']

const STAGE_COLORS: Record<DealStage, string> = {
  lead:        'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  contact:     'bg-blue-500/10 text-blue-600',
  proposal:    'bg-indigo-500/10 text-indigo-600',
  negotiation: 'bg-amber-500/10 text-amber-600',
  won:         'bg-emerald-500/10 text-emerald-600',
  lost:        'bg-red-500/10 text-red-500',
}

function KanbanColumn({ stage }: { stage: DealStage }) {
  const deals = MOCK_DEALS.filter((d) => d.stage === stage)
  const total = deals.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex flex-col gap-2 w-52 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-semibold text-ink">{dealStageLabels[stage]}</p>
          <p className="text-[10px] font-mono text-ink-subtle">
            {deals.length} deal{deals.length !== 1 ? 's' : ''} · {formatCurrency(total)}
          </p>
        </div>
        <div
          className={cn('w-2 h-2 rounded-full', (STAGE_COLORS[stage] ?? '').split(' ')[0]?.replace('/10', '') ?? '')}
        />
      </div>

      {/* Cards */}
      <div className="space-y-2 min-h-[120px]">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-surface-0 border border-border rounded-lg p-3 hover:border-[var(--accent)]/50 hover:shadow-sm transition-all cursor-pointer group"
          >
            <p className="text-xs font-semibold text-ink group-hover:text-[var(--accent)] transition-colors line-clamp-2">
              {deal.title}
            </p>
            <p className="text-[10px] text-ink-subtle mt-1">{deal.contactName}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-mono font-bold text-[var(--accent)]">
                {formatCurrency(deal.value)}
              </span>
              <span className="text-[10px] text-ink-subtle">{deal.assignedTo}</span>
            </div>
          </div>
        ))}
        {deals.length === 0 && (
          <div className="flex items-center justify-center h-20 border-2 border-dashed border-border rounded-lg">
            <p className="text-xs text-ink-subtle">Vazio</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CRMPage() {
  const { isLoading } = useMockQuery(true, 650)
  const [tab, setTab] = useState('pipeline')

  const totalPipeline = MOCK_DEALS.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
    .reduce((s, d) => s + d.value, 0)
  const wonDeals = MOCK_DEALS.filter((d) => d.stage === 'won')

  if (isLoading) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-6 w-20" /><Skeleton className="h-4 w-48" /></div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 w-52 shrink-0 rounded-lg" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">CRM</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {MOCK_DEALS.length} oportunidades · {formatCurrency(totalPipeline)} em pipeline
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />}>Nova Oportunidade</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Em Pipeline', value: formatCurrency(totalPipeline), icon: <DollarSign size={16} /> },
          { label: 'Ganhos (mês)', value: `${wonDeals.length} deals`, icon: <ArrowRight size={16} /> },
          { label: 'Contatos', value: `${MOCK_CONTACTS.length}`, icon: <Users2 size={16} /> },
        ].map((kpi) => (
          <div key={kpi.label} className="flex items-center gap-3 p-3 bg-surface-0 border border-border rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center text-[var(--accent)] shrink-0">
              {kpi.icon}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-ink-subtle">{kpi.label}</p>
              <p className="text-base font-bold text-ink">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: 'pipeline', label: 'Pipeline' },
          { id: 'contacts', label: 'Contatos', badge: MOCK_CONTACTS.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* Pipeline kanban */}
      {tab === 'pipeline' && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => (
              <KanbanColumn key={stage} stage={stage} />
            ))}
          </div>
        </div>
      )}

      {/* Contacts */}
      {tab === 'contacts' && (
        <div className="bg-surface-0 border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-1">
                {['NOME', 'E-MAIL', 'TELEFONE', 'COMPRAS', 'ÚLTIMA COMPRA', 'TAGS'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-ink-subtle">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_CONTACTS.map((contact, i) => (
                <tr
                  key={contact.id}
                  className={cn(
                    'border-b border-border/50 hover:bg-surface-1 transition-colors',
                    i % 2 === 0 ? 'bg-surface-0' : 'bg-surface-0/50'
                  )}
                >
                  <td className="px-4 py-3 font-medium text-ink">{contact.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{contact.email ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-muted font-mono">{contact.phone ?? '—'}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-[var(--accent)]">
                    {formatCurrency(contact.totalPurchases)}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {contact.lastPurchaseAt ? formatDate(contact.lastPurchaseAt) : 'Nunca'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="neutral">{tag}</Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
