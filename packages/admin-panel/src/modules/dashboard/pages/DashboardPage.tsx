import { useQuery } from '@tanstack/react-query'
import {
  DollarSign,
  Building2,
  Users,
  Monitor,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Zap,
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
import { Button } from '@/shared/components/Button'
import { Spinner } from '@/shared/components/Spinner'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ─── METRIC CARD ─────────────────────────────────────────────────
interface MetricCardProps {
  label: string
  value: string
  sub?: string
  trend?: number
  icon: React.ReactNode
  iconColor?: string
  accent?: boolean
}

function MetricCard({ label, value, sub, trend, icon, iconColor, accent }: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-surface-1 border border-[var(--border)] rounded-card p-5',
        accent && 'border-accent/20 bg-accent-dim'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-mono uppercase tracking-wide text-fg-muted">{label}</p>
        <div
          className={cn(
            'h-7 w-7 rounded flex items-center justify-center',
            iconColor ?? 'bg-surface-3 text-fg-muted'
          )}
        >
          {icon}
        </div>
      </div>
      <p className={cn('text-2xl font-semibold', accent ? 'text-accent' : 'text-fg')}>{value}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {trend !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-mono',
              trend >= 0 ? 'text-green' : 'text-red'
            )}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
        {sub && <span className="text-xs text-fg-dim">{sub}</span>}
      </div>
    </div>
  )
}

// ─── ACTIVITY ITEM ───────────────────────────────────────────────
const activityColors: Record<string, string> = {
  pdv_offline: 'bg-red/10 text-red',
  tenant_created: 'bg-green/10 text-green',
  impersonation: 'bg-yellow/10 text-yellow',
  plan_changed: 'bg-blue-500/10 text-blue-400',
  subscription_cancelled: 'bg-red/10 text-red',
  user_added: 'bg-surface-3 text-fg-muted',
}

// ─── CUSTOM CHART TOOLTIP ────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="bg-surface-2 border border-[var(--border)] rounded-card px-3 py-2 text-xs shadow-lg">
      <p className="text-fg-muted mb-1">{label}</p>
      <p className="font-semibold text-accent font-mono">{formatCurrency(val ?? 0)}</p>
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 600))
      return MOCK_DASHBOARD_METRICS
    },
  })

  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
      return MOCK_ACTIVITY
    },
  })

  const { data: upsell } = useQuery({
    queryKey: ['dashboard-upsell'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500))
      return MOCK_UPSELL
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Dashboard</h1>
          <p className="text-sm text-fg-muted mt-0.5">Visão geral da plataforma</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green animate-pulse" />
          <span className="text-xs text-fg-muted font-mono">Live</span>
        </div>
      </div>

      {/* ─── KPI ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="MRR Total"
          value={formatCurrency(metrics.totalMRR)}
          trend={metrics.mrrGrowth}
          sub="vs mês anterior"
          icon={<DollarSign className="h-4 w-4" />}
          iconColor="bg-accent-dim text-accent"
          accent
        />
        <MetricCard
          label="Tenants Ativos"
          value={formatNumber(metrics.activeTenants)}
          sub={`${metrics.trialTenants} em trial · ${metrics.suspendedTenants} suspensos`}
          icon={<Building2 className="h-4 w-4" />}
          iconColor="bg-green/10 text-green"
        />
        <MetricCard
          label="Usuários Totais"
          value={formatNumber(metrics.totalUsers)}
          sub="em todos os tenants"
          icon={<Users className="h-4 w-4" />}
          iconColor="bg-blue-500/10 text-blue-400"
        />
        <MetricCard
          label="PDVs Online"
          value={formatNumber(metrics.pdvsOnline)}
          sub={`${metrics.pdvsOffline} offline`}
          icon={<Monitor className="h-4 w-4" />}
          iconColor={metrics.pdvsOffline > 0 ? 'bg-yellow/10 text-yellow' : 'bg-green/10 text-green'}
        />
      </div>

      {/* ─── SECONDARY ROW ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-card flex items-center justify-center bg-surface-3 shrink-0">
            <Activity className="h-5 w-5 text-fg-muted" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-fg-muted">Churn Rate</p>
            <p className="text-lg font-semibold text-fg mt-0.5">{metrics.churnRate}%</p>
            <p className="text-xs text-fg-dim">últimos 30 dias</p>
          </div>
        </div>

        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-card flex items-center justify-center bg-yellow/10 shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-fg-muted">Oport. Upsell</p>
            <p className="text-lg font-semibold text-fg mt-0.5">{metrics.upsellOpportunities}</p>
            <p className="text-xs text-fg-dim">tenants próximos do limite</p>
          </div>
        </div>

        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-card flex items-center justify-center bg-green/10 shrink-0">
            <Zap className="h-5 w-5 text-green" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-fg-muted">Trials Ativos</p>
            <p className="text-lg font-semibold text-fg mt-0.5">{metrics.trialTenants}</p>
            <p className="text-xs text-fg-dim">aguardando conversão</p>
          </div>
        </div>
      </div>

      {/* ─── CHART + SIDE PANELS ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* MRR Chart */}
        <div className="lg:col-span-2 bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-fg">Receita Recorrente (MRR)</h2>
              <p className="text-xs text-fg-dim mt-0.5">Últimos 12 meses</p>
            </div>
            <Badge variant="success">+{metrics.mrrGrowth}% este mês</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_MRR_HISTORY} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
                  width={48}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#mrrGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--bg)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PDVs offline alert */}
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-fg">PDVs com Problema</h2>
            {metrics.pdvsOffline > 0 && (
              <Badge variant="warning">{metrics.pdvsOffline} offline</Badge>
            )}
          </div>
          <div className="space-y-3">
            {[
              { tenant: 'Farmácia Central Saúde', pdv: 'PDV #1 — Filial Norte', time: '3h atrás', tenantId: 'tenant_001' },
              { tenant: 'Padaria Trigo de Ouro', pdv: 'PDV #1 — Principal', time: '6h atrás', tenantId: 'tenant_003' },
            ].map(({ tenant, pdv, time, tenantId }) => (
              <Link
                key={tenantId}
                to="/tenants/$tenantId"
                params={{ tenantId }}
                className="flex items-start gap-3 p-3 rounded-btn bg-surface-2 hover:bg-surface-3 transition-colors group"
              >
                <div className="h-2 w-2 rounded-full bg-red mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-fg truncate">{tenant}</p>
                  <p className="text-xs text-fg-dim truncate">{pdv}</p>
                  <p className="text-2xs text-red mt-0.5">Offline há {time}</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-fg-dim opacity-0 group-hover:opacity-100 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── ACTIVITY + UPSELL ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity feed */}
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <h2 className="text-sm font-semibold text-fg mb-4">Atividade Recente</h2>
          <div className="space-y-3">
            {(activity ?? []).map((entry) => (
              <div key={entry.id} className="flex items-start gap-3">
                <div
                  className={cn(
                    'h-6 w-6 rounded flex items-center justify-center shrink-0 mt-0.5',
                    activityColors[entry.type] ?? 'bg-surface-3 text-fg-muted'
                  )}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-fg">{entry.action}</p>
                    <span className="text-2xs text-fg-dim font-mono">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-fg-muted mt-0.5">{entry.tenantName}</p>
                  <p className="text-xs text-fg-dim">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upsell opportunities */}
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-fg">Oportunidades de Upsell</h2>
            <Badge variant="warning">{(upsell ?? []).length} tenants</Badge>
          </div>
          <div className="space-y-3">
            {(upsell ?? []).map((item) => (
              <Link
                key={`${item.tenantId}-${item.resource}`}
                to="/tenants/$tenantId"
                params={{ tenantId: item.tenantId }}
                className="block p-3 rounded-btn bg-surface-2 hover:bg-surface-3 transition-colors group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-xs font-medium text-fg truncate">{item.tenantName}</p>
                    <Badge variant="neutral" size="sm">{item.planName}</Badge>
                  </div>
                  <span
                    className={cn(
                      'text-2xs font-mono shrink-0',
                      item.percentage >= 100 ? 'text-red' : 'text-yellow'
                    )}
                  >
                    {item.percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        item.percentage >= 100 ? 'bg-red' : 'bg-yellow'
                      )}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-2xs text-fg-dim font-mono shrink-0">
                    {item.current}/{item.limit === 9999 ? '∞' : item.limit}{' '}
                    {item.resource === 'users' ? 'users' : item.resource === 'pdvs' ? 'PDVs' : 'filiais'}
                  </span>
                </div>
                <p className="text-2xs text-fg-dim mt-1.5">
                  {segmentLabels[item.segment]} · Considere oferecer upgrade
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <Button variant="ghost" size="sm" className="w-full justify-center text-accent hover:text-accent">
              Ver todos os tenants
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
