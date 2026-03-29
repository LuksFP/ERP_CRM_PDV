import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  MOCK_MRR_HISTORY,
  MOCK_SEGMENT_DISTRIBUTION,
  MOCK_PLAN_DISTRIBUTION,
  MOCK_DASHBOARD_METRICS,
  MOCK_TENANTS,
  MOCK_UPSELL,
} from '@/mock/data'
import { formatCurrency, segmentLabels, formatNumber } from '@/shared/utils/format'
import { Badge } from '@/shared/components/Badge'
import { Spinner } from '@/shared/components/Spinner'
import { cn } from '@/shared/utils/cn'

const SEGMENT_COLORS = ['#E2A336', '#5CB870', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#0891B2']
const PLAN_COLORS = { Starter: '#6B7280', Professional: '#E2A336', Enterprise: '#5CB870' }

function ChartTooltipCustom({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name?: string; color?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-2 border border-[var(--border)] rounded-card px-3 py-2 text-xs shadow-lg">
      <p className="text-fg-muted mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color ?? 'var(--accent)' }} />
          <span className="text-fg font-mono">
            {p.name && <span className="text-fg-muted mr-1">{p.name}:</span>}
            {typeof p.value === 'number' && p.value > 1000
              ? formatCurrency(p.value)
              : formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics-metrics'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500))
      return MOCK_DASHBOARD_METRICS
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  // Top tenants by MRR
  const topTenants = [...MOCK_TENANTS]
    .filter((t) => t.status === 'active')
    .sort((a, b) => b.mrr - a.mrr)
    .slice(0, 5)

  // Risky tenants (low usage)
  const riskyTenants = MOCK_TENANTS
    .filter((t) => t.status === 'active')
    .filter((t) => {
      const userRatio = t.usage.users / (t.plan.limits.maxUsers === 9999 ? 100 : t.plan.limits.maxUsers)
      return userRatio < 0.3
    })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Analytics</h1>
          <p className="text-sm text-fg-muted mt-0.5">Visão completa da plataforma</p>
        </div>
        <Badge variant="success">Dados atualizados agora</Badge>
      </div>

      {/* ─── MRR CHART ───────────────────────────────────────── */}
      <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5 mb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-fg">MRR — Receita Recorrente</h2>
            <p className="text-xs text-fg-dim mt-0.5">Evolução dos últimos 12 meses</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold font-mono text-accent">
              {formatCurrency(MOCK_MRR_HISTORY.at(-1)?.mrr ?? 0)}
            </p>
            <p className="text-xs text-green mt-0.5">
              +{metrics?.mrrGrowth}% vs mês anterior
            </p>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_MRR_HISTORY} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} width={48} />
              <Tooltip content={<ChartTooltipCustom />} />
              <Area type="monotone" dataKey="mrr" stroke="var(--accent)" strokeWidth={2} fill="url(#mrrFill)"
                dot={false} activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--bg)', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── SEGMENT + PLAN CHARTS ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* By Segment */}
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <h2 className="text-sm font-semibold text-fg mb-4">Distribuição por Segmento</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_SEGMENT_DISTRIBUTION.map((s) => ({
                  name: segmentLabels[s.segment],
                  tenants: s.count,
                  mrr: s.mrr,
                }))}
                layout="vertical"
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <XAxis type="number" tick={{ fill: 'var(--fg-dim)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--fg-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<ChartTooltipCustom />} />
                <Bar dataKey="tenants" fill="var(--accent)" radius={[0, 4, 4, 0]}>
                  {MOCK_SEGMENT_DISTRIBUTION.map((_, i) => (
                    <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Plan */}
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <h2 className="text-sm font-semibold text-fg mb-4">Distribuição por Plano</h2>
          <div className="flex items-center gap-4 h-48">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_PLAN_DISTRIBUTION}
                    dataKey="count"
                    nameKey="planName"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={2}
                    stroke="var(--bg)"
                  >
                    {MOCK_PLAN_DISTRIBUTION.map((entry) => (
                      <Cell
                        key={entry.planName}
                        fill={PLAN_COLORS[entry.planName as keyof typeof PLAN_COLORS] ?? '#6B7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipCustom />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              {MOCK_PLAN_DISTRIBUTION.map((p) => (
                <div key={p.planName} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm shrink-0"
                    style={{ backgroundColor: PLAN_COLORS[p.planName as keyof typeof PLAN_COLORS] ?? '#6B7280' }}
                  />
                  <div>
                    <p className="text-xs font-medium text-fg">{p.planName}</p>
                    <p className="text-2xs text-fg-dim font-mono">{p.count} tenants · {formatCurrency(p.mrr)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── TOP TENANTS + RISKS ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Top tenants */}
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <h2 className="text-sm font-semibold text-fg mb-4">Top Tenants por MRR</h2>
          <div className="flex flex-col gap-2">
            {topTenants.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="text-xs font-mono text-fg-dim w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-fg truncate">{t.name}</span>
                    <span className="text-xs font-mono text-accent ml-2 shrink-0">{formatCurrency(t.mrr)}</span>
                  </div>
                  <div className="h-1 bg-surface-3 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${(t.mrr / (topTenants[0]?.mrr ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upsell + risks */}
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-fg">Oportunidades de Upsell</h2>
            <Badge variant="warning">{MOCK_UPSELL.length}</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {MOCK_UPSELL.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-fg truncate">{item.tenantName}</span>
                    <span
                      className={cn(
                        'text-xs font-mono shrink-0 ml-2',
                        item.percentage >= 100 ? 'text-red' : 'text-yellow'
                      )}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', item.percentage >= 100 ? 'bg-red' : 'bg-yellow')}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-2xs text-fg-dim font-mono shrink-0">
                      {item.resource} {item.current}/{item.limit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {riskyTenants.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-fg">Tenants em risco de churn</span>
                <Badge variant="danger">{riskyTenants.length}</Badge>
              </div>
              <div className="flex flex-col gap-1.5">
                {riskyTenants.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="text-xs text-fg-muted truncate">{t.name}</span>
                    <span className="text-2xs text-fg-dim font-mono ml-2">
                      {t.usage.users}/{t.plan.limits.maxUsers === 9999 ? '∞' : t.plan.limits.maxUsers} users
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── KEY METRICS ─────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Churn Rate', value: `${metrics?.churnRate}%`, sub: '30 dias', color: 'text-red' },
          { label: 'PDVs Online', value: formatNumber(metrics?.pdvsOnline ?? 0), sub: `${metrics?.pdvsOffline} offline`, color: 'text-green' },
          { label: 'Usuários totais', value: formatNumber(metrics?.totalUsers ?? 0), sub: 'todos tenants', color: 'text-fg' },
          { label: 'Trials ativos', value: formatNumber(metrics?.trialTenants ?? 0), sub: 'aguardando conv.', color: 'text-accent' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-surface-1 border border-[var(--border)] rounded-card p-4">
            <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-2">{label}</p>
            <p className={cn('text-2xl font-semibold font-mono', color)}>{value}</p>
            <p className="text-xs text-fg-dim mt-1">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
