import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowUpRight, TrendingUp, TrendingDown, Activity, Users, Monitor, RefreshCw } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  MOCK_DASHBOARD_METRICS, MOCK_ACTIVITY, MOCK_UPSELL, MOCK_MRR_HISTORY,
  MOCK_PLAN_DISTRIBUTION, MOCK_SEGMENT_DISTRIBUTION,
} from '@/mock/data'
import { formatCurrency, formatNumber, formatRelativeTime, segmentLabels } from '@/shared/utils/format'
import { Badge } from '@/shared/components/Badge'
import { Spinner } from '@/shared/components/Spinner'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'

// ─── TOOLTIP ────────────────────────────────────────────────────────────────
function MRRTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-hover)', borderRadius: 6, padding: '8px 14px' }}>
      <p style={{ color: 'var(--fg-dim)', fontFamily: 'Geist Mono', fontSize: 10, marginBottom: 4, letterSpacing: '0.1em' }}>{label}</p>
      <p style={{ color: 'var(--accent)', fontFamily: 'Geist Mono', fontSize: 14, fontWeight: 700 }}>{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

function PlanTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-hover)', borderRadius: 6, padding: '8px 14px' }}>
      <p style={{ color: 'var(--fg-dim)', fontFamily: 'Geist Mono', fontSize: 10, marginBottom: 6, letterSpacing: '0.1em' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontFamily: 'Geist Mono', fontSize: 12, fontWeight: 600, color: 'var(--fg)' }}>
          {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

// ─── DOT COLOR ───────────────────────────────────────────────────────────────
function dotColor(type: string) {
  if (type === 'pdv_offline' || type === 'subscription_cancelled') return 'var(--red)'
  if (type === 'tenant_created' || type === 'user_added') return 'var(--green)'
  return 'var(--yellow)'
}

const SEGMENT_COLORS: Record<string, string> = {
  pharmacy:    '#4DB864',
  supermarket: '#E8A830',
  bakery:      '#D4A84A',
  butcher:     '#D4644A',
  restaurant:  '#7B68EE',
  clothing:    '#E85D9C',
  electronics: '#4DBCE8',
}

const PLAN_COLORS = ['#5E584F', '#E8A830', '#4DB864']

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  highlighted?: boolean
  trend?: { value: string; up: boolean }
  alert?: string
  rows?: Array<{ label: string; value: string; color?: string }>
}

function MetricCard({ icon, label, value, sub, highlighted, trend, alert, rows }: MetricCardProps) {
  if (highlighted) {
    return (
      <div style={{
        background: 'var(--accent)',
        borderRadius: 10,
        padding: '22px 24px',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        {/* noise overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '256px', opacity: 0.15, pointerEvents: 'none' }} />
        {/* glow */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)' }}>
              {icon}
            </div>
            <span style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
              {label}
            </span>
            {trend && (
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: '3px 8px' }}>
                {trend.up ? <TrendingUp size={10} color="rgba(255,255,255,0.9)" /> : <TrendingDown size={10} color="rgba(255,255,255,0.9)" />}
                <span style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{trend.value}</span>
              </div>
            )}
          </div>

          <p style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff', fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
            {value}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: rows?.length ? 16 : 0 }}>{sub}</p>

          {rows && rows.length > 0 && (
            <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              {rows.map(r => (
                <div key={r.label}>
                  <p style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>{r.label}</p>
                  <p style={{ fontFamily: 'Geist Mono', fontSize: 15, fontWeight: 700, color: r.color ?? 'rgba(255,255,255,0.9)' }}>{r.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '22px 24px',
      flex: 1,
      minWidth: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '256px', opacity: 0.08, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-dim)' }}>
            {icon}
          </div>
          <span style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>
            {label}
          </span>
        </div>

        <p style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--fg)', fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
          {value}
        </p>
        <p style={{ fontSize: 12, color: 'var(--fg-dim)', marginBottom: rows?.length ? 16 : 0 }}>{sub}</p>

        {alert && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--red)', fontSize: 11 }}>
            <AlertTriangle size={11} />
            <span>{alert}</span>
          </div>
        )}

        {rows && rows.length > 0 && (
          <div style={{ display: 'flex', gap: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            {rows.map(r => (
              <div key={r.label}>
                <p style={{ fontFamily: 'Geist Mono', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-dim)', marginBottom: 4 }}>{r.label}</p>
                <p style={{ fontFamily: 'Geist Mono', fontSize: 15, fontWeight: 700, color: r.color ?? 'var(--fg)' }}>{r.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SECTION HEADER ─────────────────────────────────────────────────────────
function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <p style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>
        {title}
      </p>
      {right}
    </div>
  )
}

// ─── PAGE ───────────────────────────────────────────────────────────────────
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

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Spinner size="lg" />
    </div>
  )
  if (!metrics) return null

  const mrrUp = metrics.mrrGrowth >= 0
  const maxSegMRR = Math.max(...MOCK_SEGMENT_DISTRIBUTION.map(s => s.mrr))

  return (
    <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%' }}>

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Visão Geral
          </h1>
          <p style={{ fontSize: 12, color: 'var(--fg-dim)', marginTop: 4, fontFamily: 'Geist Mono' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {metrics.pdvsOffline > 0 && (
            <Link to="/tenants" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(212,100,74,0.12)', border: '1px solid rgba(212,100,74,0.25)', borderRadius: 6, padding: '6px 12px', textDecoration: 'none', color: 'var(--red)', fontSize: 12, fontWeight: 500 }}>
              <AlertTriangle size={12} />
              {metrics.pdvsOffline} PDVs offline
            </Link>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(77,184,100,0.08)', border: '1px solid rgba(77,184,100,0.2)', borderRadius: 6, padding: '6px 12px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'var(--green)', letterSpacing: '0.08em' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* ══ METRIC CARDS ═════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 16 }}>
        <MetricCard
          highlighted
          icon={<Activity size={14} />}
          label="MRR"
          value={formatCurrency(metrics.totalMRR)}
          sub="Receita recorrente mensal"
          trend={{ value: `${mrrUp ? '+' : ''}${metrics.mrrGrowth}%`, up: mrrUp }}
          rows={[
            { label: 'Starter', value: formatCurrency(MOCK_PLAN_DISTRIBUTION[0]?.mrr ?? 0), color: 'rgba(255,255,255,0.75)' },
            { label: 'Professional', value: formatCurrency(MOCK_PLAN_DISTRIBUTION[1]?.mrr ?? 0), color: 'rgba(255,255,255,0.9)' },
            { label: 'Enterprise', value: formatCurrency(MOCK_PLAN_DISTRIBUTION[2]?.mrr ?? 0), color: '#fff' },
          ]}
        />
        <MetricCard
          icon={<Users size={14} />}
          label="Tenants"
          value={formatNumber(metrics.activeTenants)}
          sub="clientes ativos na plataforma"
          rows={[
            { label: 'Trial', value: String(metrics.trialTenants), color: 'var(--yellow)' },
            { label: 'Suspensos', value: String(metrics.suspendedTenants), color: 'var(--red)' },
            { label: 'Usuários', value: formatNumber(metrics.totalUsers), color: 'var(--fg)' },
          ]}
        />
        <MetricCard
          icon={<Monitor size={14} />}
          label="PDVs"
          value={formatNumber(metrics.pdvsOnline)}
          sub="terminais online agora"
          alert={metrics.pdvsOffline > 0 ? `${metrics.pdvsOffline} offline` : undefined}
          rows={[
            { label: 'Online', value: String(metrics.pdvsOnline), color: 'var(--green)' },
            { label: 'Offline', value: String(metrics.pdvsOffline), color: metrics.pdvsOffline > 0 ? 'var(--red)' : 'var(--fg-dim)' },
            { label: 'Churn', value: `${metrics.churnRate}%`, color: metrics.churnRate > 3 ? 'var(--red)' : 'var(--green)' },
          ]}
        />
        <MetricCard
          icon={<RefreshCw size={14} />}
          label="Upsell"
          value={String(metrics.upsellOpportunities)}
          sub="oportunidades de upgrade"
          rows={[
            { label: 'Limite', value: '100%', color: 'var(--red)' },
            { label: '≥90%', value: '90%', color: 'var(--yellow)' },
            { label: '≥80%', value: '80%', color: 'var(--accent)' },
          ]}
        />
      </div>

      {/* ══ CHARTS ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

        {/* MRR History */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px' }}>
          <SectionHeader
            title="MRR — Últimos 12 meses"
            right={<Badge variant="success">+{metrics.mrrGrowth}% este mês</Badge>}
          />
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_MRR_HISTORY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.30} />
                    <stop offset="65%" stopColor="var(--accent)" stopOpacity={0.06} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 8" stroke="rgba(214,198,172,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} width={46} domain={['auto', 'auto']} />
                <Tooltip content={<MRRTooltip />} cursor={{ stroke: 'rgba(232,168,48,0.2)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="mrr" stroke="var(--accent)" strokeWidth={2} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--surface-2)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Plan */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px' }}>
          <SectionHeader title="Receita por Plano" />
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_PLAN_DISTRIBUTION} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="1 8" stroke="rgba(214,198,172,0.05)" vertical={false} />
                <XAxis dataKey="planName" tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} width={46} />
                <Tooltip content={<PlanTooltip />} cursor={{ fill: 'rgba(214,198,172,0.04)' }} />
                <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                  {MOCK_PLAN_DISTRIBUTION.map((_, i) => (
                    <Cell key={i} fill={PLAN_COLORS[i] ?? 'var(--accent)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            {MOCK_PLAN_DISTRIBUTION.map((p, i) => (
              <div key={p.planName} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: PLAN_COLORS[i] ?? 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--fg-dim)' }}>
                  {p.planName} <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{p.count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ BOTTOM ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px 260px', gap: 16, flex: 1 }}>

        {/* Activity */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px' }}>
          <SectionHeader title="Atividade recente" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(activity ?? []).map((entry, i, arr) => (
              <div key={entry.id} style={{ display: 'flex', gap: 12, paddingTop: 12, paddingBottom: 12, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor(entry.type) }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.action}</span>
                    <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--fg-dim)', flexShrink: 0 }}>{formatRelativeTime(entry.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 1 }}>{entry.tenantName}</p>
                  <p style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 1 }}>{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Segments */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px' }}>
          <SectionHeader
            title="Segmentos"
            right={<span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--fg-dim)' }}>{MOCK_SEGMENT_DISTRIBUTION.reduce((s, x) => s + x.count, 0)} total</span>}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_SEGMENT_DISTRIBUTION
              .sort((a, b) => b.mrr - a.mrr)
              .map(seg => {
                const pct = Math.round((seg.mrr / (maxSegMRR || 1)) * 100)
                const color = SEGMENT_COLORS[seg.segment] ?? 'var(--accent)'
                const label = segmentLabels[seg.segment] ?? seg.segment
                return (
                  <div key={seg.segment}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 500 }}>{label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--fg-dim)' }}>{seg.count}</span>
                        <span style={{ fontFamily: 'Geist Mono', fontSize: 11, fontWeight: 600, color: 'var(--fg)' }}>{formatCurrency(seg.mrr)}</span>
                      </div>
                    </div>
                    <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: color, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Upsell */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px' }}>
          <SectionHeader
            title="Upsell"
            right={
              <span style={{ fontFamily: 'Geist Mono', fontSize: 11, fontWeight: 700, color: 'var(--yellow)', background: 'rgba(232,168,48,0.1)', padding: '2px 8px', borderRadius: 20 }}>
                {(upsell ?? []).length}
              </span>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(upsell ?? []).map(item => (
              <Link
                key={`${item.tenantId}-${item.resource}`}
                to="/tenants/$tenantId"
                params={{ tenantId: item.tenantId }}
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.tenantName}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontFamily: 'Geist Mono', fontSize: 11, fontWeight: 700, color: item.percentage >= 100 ? 'var(--red)' : 'var(--yellow)' }}>
                      {item.percentage}%
                    </span>
                    <ArrowUpRight size={11} style={{ color: 'var(--fg-dim)' }} />
                  </div>
                </div>
                <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(item.percentage, 100)}%`, background: item.percentage >= 100 ? 'var(--red)' : item.percentage >= 90 ? 'var(--yellow)' : 'var(--accent)', transition: 'width 0.7s' }} />
                </div>
                <p style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--fg-dim)' }}>
                  {item.current}/{item.limit === 9999 ? '∞' : item.limit} {item.resource === 'users' ? 'usuários' : item.resource === 'pdvs' ? 'PDVs' : 'filiais'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
