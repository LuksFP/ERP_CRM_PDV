import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react'
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
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

// ── Chart Tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 text-xs shadow-xl rounded-[4px]"
      style={{ background: 'var(--surface-3)', border: '1px solid var(--border-hover)' }}
    >
      <p className="font-mono mb-1" style={{ color: 'var(--fg-dim)' }}>{label}</p>
      <p className="font-bold font-mono tabular-nums" style={{ color: 'var(--accent)' }}>
        {formatCurrency(payload[0]?.value ?? 0)}
      </p>
    </div>
  )
}

// ── Activity type → dot color ─────────────────────────────────────────────────
function dotColor(type: string) {
  if (type === 'pdv_offline' || type === 'subscription_cancelled') return 'var(--red)'
  if (type === 'tenant_created' || type === 'user_added') return 'var(--green)'
  return 'var(--yellow)'
}

// ─────────────────────────────────────────────────────────────────────────────
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

  const mrrUp = metrics.mrrGrowth >= 0

  return (
    <div className="flex flex-col h-full">

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <div
        className="px-8 pt-9 pb-7"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-1)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-12">

            {/* MRR — editorial left column */}
            <div className="min-w-0">
              <p
                className="text-[10px] font-mono uppercase tracking-[0.18em] mb-3"
                style={{ color: 'var(--fg-dim)' }}
              >
                Receita Recorrente —{' '}
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>

              <div className="flex items-end gap-4 flex-wrap">
                <span
                  className="text-[3.25rem] font-bold leading-none tracking-tight tabular-nums"
                  style={{ color: 'var(--fg)' }}
                >
                  {formatCurrency(metrics.totalMRR)}
                </span>
                <div
                  className={cn(
                    'flex items-center gap-1.5 pb-2 text-sm font-mono font-semibold'
                  )}
                  style={{ color: mrrUp ? 'var(--green)' : 'var(--red)' }}
                >
                  {mrrUp
                    ? <TrendingUp className="h-3.5 w-3.5" />
                    : <TrendingDown className="h-3.5 w-3.5" />}
                  {mrrUp ? '+' : ''}{metrics.mrrGrowth}%
                  <span className="text-xs font-sans font-normal" style={{ color: 'var(--fg-dim)' }}>
                    vs mês anterior
                  </span>
                </div>
              </div>

              {/* Alert */}
              {metrics.pdvsOffline > 0 && (
                <div
                  className="mt-3.5 inline-flex items-center gap-2 text-[11px]"
                  style={{ color: 'var(--yellow)' }}
                >
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>
                    <strong>{metrics.pdvsOffline} PDVs offline</strong>
                    {' — '}
                    <Link
                      to="/tenants"
                      className="underline underline-offset-2 transition-colors"
                      style={{ color: 'var(--yellow)' }}
                    >
                      ver tenants afetados
                    </Link>
                  </span>
                </div>
              )}
            </div>

            {/* Stats — 2×2 grid, dark inset on elevated surface */}
            <div
              className="grid grid-cols-2 rounded-[6px] overflow-hidden shrink-0"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                gap: '1px',
              }}
            >
              {[
                {
                  label: 'Tenants ativos',
                  value: formatNumber(metrics.activeTenants),
                  sub: `${metrics.trialTenants} trial · ${metrics.suspendedTenants} suspensos`,
                  valueColor: 'var(--fg)',
                },
                {
                  label: 'Usuários',
                  value: formatNumber(metrics.totalUsers),
                  sub: 'em todos os tenants',
                  valueColor: 'var(--fg)',
                },
                {
                  label: 'PDVs online',
                  value: formatNumber(metrics.pdvsOnline),
                  sub: `${metrics.pdvsOffline} offline`,
                  valueColor: metrics.pdvsOffline > 0 ? 'var(--yellow)' : 'var(--fg)',
                },
                {
                  label: 'Churn rate',
                  value: `${metrics.churnRate}%`,
                  sub: 'últimos 30 dias',
                  valueColor: metrics.churnRate > 3 ? 'var(--red)' : 'var(--fg)',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="px-5 py-4 min-w-[148px]"
                  style={{ background: 'var(--surface-2)' }}
                >
                  <p
                    className="text-[10px] font-mono uppercase tracking-[0.12em] mb-2"
                    style={{ color: 'var(--fg-dim)' }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-[1.6rem] font-bold tabular-nums leading-none"
                    style={{ color: s.valueColor }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-[11px] mt-1.5 leading-snug"
                    style={{ color: 'var(--fg-dim)' }}
                  >
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Sub-strip */}
          <div
            className="flex items-center gap-4 mt-5 pt-4 text-[11px] font-mono"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-dim)' }}
          >
            <span>{metrics.upsellOpportunities} oportunidades de upsell</span>
            <span style={{ color: 'var(--surface-3)' }}>·</span>
            <span>{metrics.trialTenants} trials aguardando conversão</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--green)' }}
              />
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CHART ════════════════════════════════════════════════════════════ */}
      <div
        className="px-8 py-6"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <p
              className="text-[10px] font-mono uppercase tracking-[0.18em]"
              style={{ color: 'var(--fg-dim)' }}
            >
              MRR — Últimos 12 meses
            </p>
            <Badge variant="success">+{metrics.mrrGrowth}% este mês</Badge>
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_MRR_HISTORY} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="var(--accent)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 6" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }}
                  axisLine={false} tickLine={false} tickMargin={8}
                />
                <YAxis
                  tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                  width={46} domain={['auto', 'auto']}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'var(--fg-dim)', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone" dataKey="mrr"
                  stroke="var(--accent)" strokeWidth={1.5}
                  fill="url(#g)" dot={false}
                  activeDot={{ r: 3, fill: 'var(--accent)', stroke: 'var(--bg)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ══ BOTTOM ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-auto" style={{ background: 'var(--surface-1)' }}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div
            className="grid grid-cols-[1fr_280px_240px] gap-0 divide-x"
            style={{ borderColor: 'var(--border)' }}
          >

            {/* ── Activity ───────────────────────────────────────────────── */}
            <div className="pr-8">
              <p
                className="text-[10px] font-mono uppercase tracking-[0.18em] mb-4"
                style={{ color: 'var(--fg-dim)' }}
              >
                Atividade recente
              </p>
              <div>
                {(activity ?? []).map((entry, i, arr) => (
                  <div
                    key={entry.id}
                    className="flex gap-3 py-2.5"
                    style={i < arr.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0 mt-[5px]"
                      style={{ background: dotColor(entry.type) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: 'var(--fg)' }}
                        >
                          {entry.action}
                        </span>
                        <span
                          className="text-[10px] font-mono shrink-0 tabular-nums"
                          style={{ color: 'var(--fg-dim)' }}
                        >
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--fg-muted)' }}>
                        {entry.tenantName}
                      </p>
                      <p className="text-[11px] leading-snug" style={{ color: 'var(--fg-dim)' }}>
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Upsell ─────────────────────────────────────────────────── */}
            <div className="px-8">
              <div className="flex items-center justify-between mb-4">
                <p
                  className="text-[10px] font-mono uppercase tracking-[0.18em]"
                  style={{ color: 'var(--fg-dim)' }}
                >
                  Upsell
                </p>
                <span
                  className="text-[10px] font-mono font-semibold tabular-nums"
                  style={{ color: 'var(--yellow)' }}
                >
                  {(upsell ?? []).length}
                </span>
              </div>
              <div className="space-y-4">
                {(upsell ?? []).map((item) => (
                  <Link
                    key={`${item.tenantId}-${item.resource}`}
                    to="/tenants/$tenantId"
                    params={{ tenantId: item.tenantId }}
                    className="block group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-xs font-medium truncate max-w-[160px] transition-colors group-hover:underline underline-offset-2"
                        style={{ color: 'var(--fg)' }}
                      >
                        {item.tenantName}
                      </span>
                      <span
                        className="text-[10px] font-mono font-semibold tabular-nums shrink-0 ml-2"
                        style={{ color: item.percentage >= 100 ? 'var(--red)' : 'var(--yellow)' }}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                    <div
                      className="h-[3px] rounded-full overflow-hidden"
                      style={{ background: 'var(--surface-3)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(item.percentage, 100)}%`,
                          background: item.percentage >= 100
                            ? 'var(--red)'
                            : item.percentage >= 90
                            ? 'var(--yellow)'
                            : 'var(--accent)',
                        }}
                      />
                    </div>
                    <p
                      className="text-[10px] mt-1.5 font-mono"
                      style={{ color: 'var(--fg-dim)' }}
                    >
                      {item.current}/{item.limit === 9999 ? '∞' : item.limit}{' '}
                      {item.resource === 'users' ? 'usuários' : item.resource === 'pdvs' ? 'PDVs' : 'filiais'}
                      <span style={{ margin: '0 4px', color: 'var(--fg-dim)', opacity: 0.4 }}>·</span>
                      {segmentLabels[item.segment]}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── PDVs offline ───────────────────────────────────────────── */}
            <div className="pl-8">
              <div className="flex items-center justify-between mb-4">
                <p
                  className="text-[10px] font-mono uppercase tracking-[0.18em]"
                  style={{ color: 'var(--fg-dim)' }}
                >
                  PDVs offline
                </p>
                {metrics.pdvsOffline > 0 && (
                  <span
                    className="text-[10px] font-mono font-semibold tabular-nums"
                    style={{ color: 'var(--red)' }}
                  >
                    {metrics.pdvsOffline}
                  </span>
                )}
              </div>
              {metrics.pdvsOffline === 0 ? (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--fg-dim)' }}>
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'var(--green)' }} />
                  Todos online
                </div>
              ) : (
                <div>
                  {[
                    { tenant: 'Farmácia Central Saúde', pdv: 'PDV #1 — Filial Norte', time: '3h', id: 'tenant_001' },
                    { tenant: 'Padaria Trigo de Ouro',  pdv: 'PDV #1 — Principal',   time: '6h', id: 'tenant_003' },
                  ].map(({ tenant, pdv, time, id }, i, arr) => (
                    <Link
                      key={id}
                      to="/tenants/$tenantId"
                      params={{ tenantId: id }}
                      className="flex items-start gap-2.5 py-2.5 group"
                      style={i < arr.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0 mt-[5px]"
                        style={{ background: 'var(--red)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium truncate transition-colors group-hover:underline underline-offset-2"
                          style={{ color: 'var(--fg)' }}
                        >
                          {tenant}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--fg-dim)' }}>{pdv}</p>
                        <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--red)' }}>
                          Offline há {time}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0"
                        style={{ color: 'var(--fg-dim)' }}
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
