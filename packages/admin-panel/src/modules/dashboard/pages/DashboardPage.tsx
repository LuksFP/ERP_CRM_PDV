import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  MOCK_DASHBOARD_METRICS,
  MOCK_ACTIVITY,
  MOCK_UPSELL,
  MOCK_MRR_HISTORY,
} from '@/mock/data'
import { formatCurrency, formatNumber, formatRelativeTime, segmentLabels } from '@/shared/utils/format'
import { cn } from '@/shared/utils/cn'
import { Badge } from '@/shared/components/Badge'
import { Spinner } from '@/shared/components/Spinner'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-2 border border-[var(--border)] rounded px-3 py-2 text-xs shadow-lg">
      <p className="text-fg-dim mb-1 font-mono">{label}</p>
      <p className="font-bold text-accent font-mono">{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  )
}


export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => { await new Promise(r => setTimeout(r, 600)); return MOCK_DASHBOARD_METRICS },
  })
  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => { await new Promise(r => setTimeout(r, 400)); return MOCK_ACTIVITY },
  })
  const { data: upsell } = useQuery({
    queryKey: ['dashboard-upsell'],
    queryFn: async () => { await new Promise(r => setTimeout(r, 500)); return MOCK_UPSELL },
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  }
  if (!metrics) return null

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-0">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="pt-2 pb-8 border-b border-[var(--border)]">
        <div className="flex items-end justify-between gap-8">

          {/* MRR editorial */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-fg-dim mb-2">
              Receita Recorrente — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
            <div className="flex items-end gap-4">
              <span className="text-[3.25rem] font-bold text-fg leading-none tracking-tight">
                {formatCurrency(metrics.totalMRR)}
              </span>
              <span className={cn(
                'flex items-center gap-1 text-sm font-mono pb-1.5',
                metrics.mrrGrowth >= 0 ? 'text-green' : 'text-red'
              )}>
                {metrics.mrrGrowth >= 0
                  ? <TrendingUp className="h-3.5 w-3.5" />
                  : <TrendingDown className="h-3.5 w-3.5" />}
                {metrics.mrrGrowth >= 0 ? '+' : ''}{metrics.mrrGrowth}%
                <span className="text-fg-dim font-sans text-xs">vs mês anterior</span>
              </span>
            </div>
          </div>

          {/* Right stats — inline, no cards */}
          <div className="flex items-center divide-x divide-[var(--border)] shrink-0 pb-1">
            {[
              { label: 'Tenants ativos', value: formatNumber(metrics.activeTenants), sub: `${metrics.trialTenants} trial` },
              { label: 'Usuários', value: formatNumber(metrics.totalUsers), sub: 'todos os tenants' },
              { label: 'PDVs online', value: formatNumber(metrics.pdvsOnline), sub: `${metrics.pdvsOffline} offline`, alert: metrics.pdvsOffline > 0 },
              { label: 'Churn rate', value: `${metrics.churnRate}%`, sub: '30 dias' },
            ].map(s => (
              <div key={s.label} className="px-6 first:pl-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-fg-dim">{s.label}</p>
                <p className={cn('text-xl font-bold mt-0.5', s.alert ? 'text-yellow' : 'text-fg')}>
                  {s.value}
                </p>
                <p className={cn('text-[11px] mt-0.5', s.alert ? 'text-yellow/70' : 'text-fg-dim')}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Alert strip */}
        {metrics.pdvsOffline > 0 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-yellow">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>
              <strong>{metrics.pdvsOffline} PDVs offline</strong> detectados —{' '}
              <Link to="/tenants" className="underline underline-offset-2 hover:text-fg transition-colors">
                ver tenants afetados
              </Link>
            </span>
            <span className="text-fg-dim ml-auto font-mono">
              {metrics.upsellOpportunities} oportunidades de upsell ·{' '}
              {metrics.trialTenants} trials aguardando conversão
            </span>
          </div>
        )}
      </div>

      {/* ── MRR CHART ─────────────────────────────────────────────── */}
      <div className="pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-mono uppercase tracking-widest text-fg-dim">MRR — Últimos 12 meses</p>
          <Badge variant="success">+{metrics.mrrGrowth}% este mês</Badge>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_MRR_HISTORY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }}
                axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                width={44}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey="mrr"
                stroke="var(--accent)" strokeWidth={1.5}
                fill="url(#mrrGrad)" dot={false}
                activeDot={{ r: 3, fill: 'var(--accent)', stroke: 'var(--bg)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── BOTTOM GRID ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px_280px] gap-0 border-t border-[var(--border)] pt-6">

        {/* Activity feed — borderless, dense */}
        <div className="pr-6 border-r border-[var(--border)]">
          <p className="text-[10px] font-mono uppercase tracking-widest text-fg-dim mb-4">
            Atividade recente
          </p>
          <div className="space-y-0 divide-y divide-[var(--border)]/50">
            {(activity ?? []).map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2.5 group">
                <div className={cn(
                  'h-1.5 w-1.5 rounded-full mt-1.5 shrink-0',
                  entry.type === 'pdv_offline' || entry.type === 'subscription_cancelled'
                    ? 'bg-red' : entry.type === 'tenant_created' || entry.type === 'user_added'
                    ? 'bg-green' : 'bg-yellow'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs font-medium text-fg">{entry.action}</span>
                    <span className="text-[10px] text-fg-dim font-mono shrink-0">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-fg-muted leading-snug">{entry.tenantName} — {entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upsell opportunities */}
        <div className="px-6 border-r border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-fg-dim">Upsell</p>
            <span className="text-[10px] font-mono text-yellow">{(upsell ?? []).length} tenants</span>
          </div>
          <div className="space-y-3">
            {(upsell ?? []).map((item) => (
              <Link
                key={`${item.tenantId}-${item.resource}`}
                to="/tenants/$tenantId"
                params={{ tenantId: item.tenantId }}
                className="block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-fg group-hover:text-accent transition-colors truncate max-w-[140px]">
                    {item.tenantName}
                  </span>
                  <span className={cn(
                    'text-[10px] font-mono shrink-0',
                    item.percentage >= 100 ? 'text-red' : 'text-yellow'
                  )}>
                    {item.percentage}%
                  </span>
                </div>
                <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      item.percentage >= 100 ? 'bg-red' : 'bg-yellow'
                    )}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-fg-dim mt-0.5 font-mono">
                  {item.current}/{item.limit === 9999 ? '∞' : item.limit}{' '}
                  {item.resource === 'users' ? 'users' : item.resource === 'pdvs' ? 'PDVs' : 'filiais'}
                  {' · '}{segmentLabels[item.segment]}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* PDVs offline — compact list */}
        <div className="pl-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-fg-dim">PDVs offline</p>
            {metrics.pdvsOffline > 0 && (
              <span className="text-[10px] font-mono text-red">{metrics.pdvsOffline}</span>
            )}
          </div>
          <div className="space-y-2">
            {[
              { tenant: 'Farmácia Central Saúde', pdv: 'PDV #1 — Filial Norte', time: '3h', tenantId: 'tenant_001' },
              { tenant: 'Padaria Trigo de Ouro',  pdv: 'PDV #1 — Principal',    time: '6h', tenantId: 'tenant_003' },
            ].map(({ tenant, pdv, time, tenantId }) => (
              <Link
                key={tenantId}
                to="/tenants/$tenantId"
                params={{ tenantId }}
                className="flex items-start gap-2 group py-2 border-b border-[var(--border)]/50 last:border-0"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-fg group-hover:text-accent transition-colors truncate">
                    {tenant}
                  </p>
                  <p className="text-[10px] text-fg-dim">{pdv}</p>
                  <p className="text-[10px] text-red font-mono">Offline há {time}</p>
                </div>
                <ArrowUpRight className="h-3 w-3 text-fg-dim opacity-0 group-hover:opacity-100 mt-0.5 shrink-0" />
              </Link>
            ))}
            {metrics.pdvsOffline === 0 && (
              <p className="text-xs text-fg-dim">Todos os PDVs online.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
