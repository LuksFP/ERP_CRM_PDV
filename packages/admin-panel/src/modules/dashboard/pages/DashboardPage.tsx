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

function MRRTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-hover)', borderRadius: 6, padding: '8px 14px' }}>
      <p style={{ color: 'var(--fg-dim)', fontFamily: 'Geist Mono', fontSize: 10, marginBottom: 4, letterSpacing: '0.1em' }}>{label}</p>
      <p style={{ color: 'var(--accent)', fontFamily: 'Geist Mono', fontSize: 13, fontWeight: 700 }}>{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

function PlanTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-hover)', borderRadius: 6, padding: '8px 14px' }}>
      <p style={{ color: 'var(--fg-dim)', fontFamily: 'Geist Mono', fontSize: 10, marginBottom: 4 }}>{label}</p>
      <p style={{ color: 'var(--fg)', fontFamily: 'Geist Mono', fontSize: 12, fontWeight: 700 }}>{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

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

const PLAN_COLORS = ['#4A4540', '#E8A830', '#4DB864']

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
    <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Visão Geral
          </h1>
          <p style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 3, fontFamily: 'Geist Mono' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {metrics.pdvsOffline > 0 && (
            <Link to="/tenants" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(212,100,74,0.1)', border: '1px solid rgba(212,100,74,0.22)', borderRadius: 6, padding: '5px 10px', textDecoration: 'none', color: 'var(--red)', fontSize: 11, fontWeight: 500 }}>
              <AlertTriangle size={11} />
              {metrics.pdvsOffline} PDVs offline
            </Link>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(77,184,100,0.08)', border: '1px solid rgba(77,184,100,0.18)', borderRadius: 6, padding: '5px 10px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--green)', letterSpacing: '0.1em', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* ── METRIC CARDS ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>

        {/* MRR — highlighted */}
        <div style={{ background: 'var(--accent)', borderRadius: 10, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '256px', opacity: 0.12, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={13} color="rgba(255,255,255,0.7)" />
                <span style={{ fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>MRR</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.18)', borderRadius: 20, padding: '3px 7px' }}>
                {mrrUp ? <TrendingUp size={9} color="rgba(255,255,255,0.9)" /> : <TrendingDown size={9} color="rgba(255,255,255,0.9)" />}
                <span style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                  {mrrUp ? '+' : ''}{metrics.mrrGrowth}%
                </span>
              </div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff', fontVariantNumeric: 'tabular-nums', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formatCurrency(metrics.totalMRR)}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>Receita recorrente mensal</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              {MOCK_PLAN_DISTRIBUTION.map(p => (
                <div key={p.planName}>
                  <p style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>{p.planName}</p>
                  <p style={{ fontFamily: 'Geist Mono', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatCurrency(p.mrr)}
                  </p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{p.count} tenants</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tenants */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '256px', opacity: 0.07, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Users size={13} color="var(--fg-dim)" />
              <span style={{ fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>Tenants</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--fg)', fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
              {formatNumber(metrics.activeTenants)}
            </p>
            <p style={{ fontSize: 11, color: 'var(--fg-dim)', marginBottom: 14 }}>clientes ativos na plataforma</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              {[
                { label: 'Trial', value: metrics.trialTenants, color: 'var(--yellow)' },
                { label: 'Suspensos', value: metrics.suspendedTenants, color: 'var(--red)' },
                { label: 'Usuários', value: metrics.totalUsers, color: 'var(--fg)' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-dim)', marginBottom: 3 }}>{s.label}</p>
                  <p style={{ fontFamily: 'Geist Mono', fontSize: 14, fontWeight: 700, color: s.color }}>{formatNumber(s.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PDVs */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '256px', opacity: 0.07, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Monitor size={13} color="var(--fg-dim)" />
              <span style={{ fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>PDVs</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--fg)', fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
              {formatNumber(metrics.pdvsOnline)}
            </p>
            <p style={{ fontSize: 11, color: 'var(--fg-dim)', marginBottom: 14 }}>terminais online agora</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              {[
                { label: 'Online', value: metrics.pdvsOnline, color: 'var(--green)' },
                { label: 'Offline', value: metrics.pdvsOffline, color: metrics.pdvsOffline > 0 ? 'var(--red)' : 'var(--fg-dim)' },
                { label: 'Churn', value: `${metrics.churnRate}%`, color: metrics.churnRate > 3 ? 'var(--red)' : 'var(--green)' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: 'Geist Mono', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-dim)', marginBottom: 3 }}>{s.label}</p>
                  <p style={{ fontFamily: 'Geist Mono', fontSize: 14, fontWeight: 700, color: s.color }}>{typeof s.value === 'number' ? formatNumber(s.value) : s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upsell */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'var(--noise)', backgroundSize: '256px', opacity: 0.07, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <RefreshCw size={13} color="var(--fg-dim)" />
              <span style={{ fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>Upsell</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--fg)', fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>
              {metrics.upsellOpportunities}
            </p>
            <p style={{ fontSize: 11, color: 'var(--fg-dim)', marginBottom: 14 }}>oportunidades de upgrade</p>
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              {(upsell ?? []).slice(0, 2).map(item => (
                <div key={`${item.tenantId}-${item.resource}`} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{item.tenantName}</span>
                    <span style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 700, color: item.percentage >= 100 ? 'var(--red)' : 'var(--yellow)', flexShrink: 0 }}>{item.percentage}%</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(item.percentage, 100)}%`, background: item.percentage >= 100 ? 'var(--red)' : 'var(--yellow)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CHARTS ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>

        {/* MRR History */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>
              MRR — Últimos 12 meses
            </p>
            <Badge variant="success">+{metrics.mrrGrowth}% este mês</Badge>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_MRR_HISTORY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.30} />
                    <stop offset="65%" stopColor="var(--accent)" stopOpacity={0.05} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 8" stroke="rgba(214,198,172,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--fg-dim)', fontSize: 9, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis tick={{ fill: 'var(--fg-dim)', fontSize: 9, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} width={42} domain={['auto', 'auto']} />
                <Tooltip content={<MRRTooltip />} cursor={{ stroke: 'rgba(232,168,48,0.18)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="mrr" stroke="var(--accent)" strokeWidth={2} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--accent)', stroke: 'var(--surface-2)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Plan */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 22px' }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>
              Receita por Plano
            </p>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_PLAN_DISTRIBUTION} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="1 8" stroke="rgba(214,198,172,0.05)" vertical={false} />
                <XAxis dataKey="planName" tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} tickMargin={8} />
                <YAxis tick={{ fill: 'var(--fg-dim)', fontSize: 9, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`} width={42} />
                <Tooltip content={<PlanTooltip />} cursor={{ fill: 'rgba(214,198,172,0.03)' }} />
                <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                  {MOCK_PLAN_DISTRIBUTION.map((_, i) => (
                    <Cell key={i} fill={PLAN_COLORS[i] ?? 'var(--accent)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            {MOCK_PLAN_DISTRIBUTION.map((p, i) => (
              <div key={p.planName} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: PLAN_COLORS[i] ?? 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--fg-dim)' }}>
                  {p.planName} <span style={{ color: 'var(--fg)', fontWeight: 600 }}>{p.count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 264px 248px', gap: 14 }}>

        {/* Activity */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 22px' }}>
          <p style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-dim)', marginBottom: 14 }}>
            Atividade recente
          </p>
          <div>
            {(activity ?? []).map((entry, i, arr) => (
              <div key={entry.id} style={{ display: 'flex', gap: 10, paddingTop: 11, paddingBottom: 11, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor(entry.type) }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.action}</span>
                    <span style={{ fontFamily: 'Geist Mono', fontSize: 9, color: 'var(--fg-dim)', flexShrink: 0 }}>{formatRelativeTime(entry.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 1 }}>{entry.tenantName}</p>
                  <p style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 1 }}>{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Segments */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>Segmentos</p>
            <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--fg-dim)' }}>
              {MOCK_SEGMENT_DISTRIBUTION.reduce((s, x) => s + x.count, 0)} total
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {MOCK_SEGMENT_DISTRIBUTION
              .sort((a, b) => b.mrr - a.mrr)
              .map(seg => {
                const pct = Math.round((seg.mrr / (maxSegMRR || 1)) * 100)
                const color = SEGMENT_COLORS[seg.segment] ?? 'var(--accent)'
                const label = segmentLabels[seg.segment] ?? seg.segment
                return (
                  <div key={seg.segment}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 500 }}>{label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'Geist Mono', fontSize: 9, color: 'var(--fg-dim)' }}>{seg.count}</span>
                        <span style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 600, color: 'var(--fg)' }}>{formatCurrency(seg.mrr)}</span>
                      </div>
                    </div>
                    <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: color, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Upsell list */}
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>Upsell</p>
            <span style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 700, color: 'var(--yellow)', background: 'rgba(232,168,48,0.1)', padding: '2px 7px', borderRadius: 10 }}>
              {(upsell ?? []).length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(upsell ?? []).map(item => (
              <Link
                key={`${item.tenantId}-${item.resource}`}
                to="/tenants/$tenantId"
                params={{ tenantId: item.tenantId }}
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--fg)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.tenantName}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 700, color: item.percentage >= 100 ? 'var(--red)' : 'var(--yellow)' }}>
                      {item.percentage}%
                    </span>
                    <ArrowUpRight size={10} style={{ color: 'var(--fg-dim)' }} />
                  </div>
                </div>
                <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden', marginBottom: 3 }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(item.percentage, 100)}%`, background: item.percentage >= 100 ? 'var(--red)' : item.percentage >= 90 ? 'var(--yellow)' : 'var(--accent)', transition: 'width 0.7s' }} />
                </div>
                <p style={{ fontFamily: 'Geist Mono', fontSize: 9, color: 'var(--fg-dim)' }}>
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
