import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  MOCK_DASHBOARD_METRICS, MOCK_ACTIVITY, MOCK_UPSELL, MOCK_MRR_HISTORY,
} from '@/mock/data'
import { formatCurrency, formatNumber, formatRelativeTime, segmentLabels } from '@/shared/utils/format'
import { Badge } from '@/shared/components/Badge'
import { Spinner } from '@/shared/components/Spinner'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-hover)', borderRadius: 4, padding: '8px 12px' }}>
      <p style={{ color: 'var(--fg-dim)', fontFamily: 'Geist Mono', fontSize: 10, marginBottom: 4 }}>{label}</p>
      <p style={{ color: 'var(--accent)', fontFamily: 'Geist Mono', fontSize: 13, fontWeight: 700 }}>{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

function dotColor(type: string) {
  if (type === 'pdv_offline' || type === 'subscription_cancelled') return 'var(--red)'
  if (type === 'tenant_created' || type === 'user_added') return 'var(--green)'
  return 'var(--yellow)'
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

  if (isLoading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
  if (!metrics) return null

  const mrrUp = metrics.mrrGrowth >= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '48px 48px 36px', borderBottom: '1px solid var(--border)' }}>

        {/* Label */}
        <p style={{ fontFamily: 'Geist Mono', fontSize: 10, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-dim)', marginBottom: 16 }}>
          Receita Recorrente —{' '}
          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>

        {/* MRR number + trend */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
          <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(metrics.totalMRR)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8, color: mrrUp ? 'var(--green)' : 'var(--red)' }}>
            {mrrUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span style={{ fontFamily: 'Geist Mono', fontSize: 13, fontWeight: 600 }}>
              {mrrUp ? '+' : ''}{metrics.mrrGrowth}%
            </span>
            <span style={{ fontFamily: 'Geist', fontSize: 11, color: 'var(--fg-dim)', fontWeight: 400 }}>
              vs mês anterior
            </span>
          </div>
        </div>

        {/* Stats row — clearly secondary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          {[
            { label: 'Tenants', value: formatNumber(metrics.activeTenants), note: `${metrics.trialTenants} trial`, color: 'var(--fg)' },
            { label: 'Usuários', value: formatNumber(metrics.totalUsers), note: 'total', color: 'var(--fg)' },
            { label: 'PDVs online', value: formatNumber(metrics.pdvsOnline), note: `${metrics.pdvsOffline} offline`, color: metrics.pdvsOffline > 0 ? 'var(--yellow)' : 'var(--fg)' },
            { label: 'Churn rate', value: `${metrics.churnRate}%`, note: '30 dias', color: metrics.churnRate > 3 ? 'var(--red)' : 'var(--fg)' },
            { label: 'Upsell', value: String(metrics.upsellOpportunities), note: 'oportunidades', color: 'var(--fg)' },
          ].map((s, i) => (
            <div key={s.label} style={{
              paddingRight: 32,
              paddingLeft: i === 0 ? 0 : 32,
              borderLeft: i === 0 ? 'none' : '1px solid var(--border)',
            }}>
              <p style={{ fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-dim)', marginBottom: 6 }}>
                {s.label}
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: s.color, fontVariantNumeric: 'tabular-nums', fontFamily: 'Geist Mono', letterSpacing: '-0.02em' }}>
                {s.value}
              </p>
              <p style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 4 }}>{s.note}</p>
            </div>
          ))}

          {/* Live indicator — far right */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em' }}>LIVE</span>
          </div>
        </div>

        {/* Alert */}
        {metrics.pdvsOffline > 0 && (
          <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--yellow)', fontSize: 11 }}>
            <AlertTriangle size={12} />
            <span><strong>{metrics.pdvsOffline} PDVs offline</strong> — <Link to="/tenants" style={{ color: 'var(--yellow)', textDecoration: 'underline', textUnderlineOffset: 3 }}>ver tenants afetados</Link></span>
          </div>
        )}
      </div>

      {/* ══ CHART ═════════════════════════════════════════════════════════════ */}
      <div style={{ padding: '32px 48px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p style={{ fontFamily: 'Geist Mono', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>
            MRR — Últimos 12 meses
          </p>
          <Badge variant="success">+{metrics.mrrGrowth}% este mês</Badge>
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_MRR_HISTORY} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                  <stop offset="70%" stopColor="var(--accent)" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 6" stroke="rgba(214,198,172,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis tick={{ fill: 'var(--fg-dim)', fontSize: 10, fontFamily: 'Geist Mono' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `R$${(v/1000).toFixed(0)}k`} width={46} domain={['auto','auto']} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(214,198,172,0.15)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="mrr" stroke="var(--accent)" strokeWidth={1.5} fill="url(#mrr)" dot={false} activeDot={{ r: 3, fill: 'var(--accent)', stroke: 'var(--bg)', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══ BOTTOM ════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, padding: '32px 48px', display: 'grid', gridTemplateColumns: '1fr 288px 248px', gap: 0 }}>

        {/* Activity */}
        <div style={{ paddingRight: 40, borderRight: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'Geist Mono', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-dim)', marginBottom: 20 }}>
            Atividade recente
          </p>
          {(activity ?? []).map((entry, i, arr) => (
            <div key={entry.id} style={{ display: 'flex', gap: 12, paddingTop: 12, paddingBottom: 12, borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor(entry.type), flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>{entry.action}</span>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--fg-dim)', flexShrink: 0 }}>{formatRelativeTime(entry.timestamp)}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>{entry.tenantName}</p>
                <p style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{entry.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upsell */}
        <div style={{ padding: '0 32px', borderRight: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontFamily: 'Geist Mono', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>Upsell</p>
            <span style={{ fontFamily: 'Geist Mono', fontSize: 11, fontWeight: 600, color: 'var(--yellow)' }}>{(upsell ?? []).length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(upsell ?? []).map(item => (
              <Link key={`${item.tenantId}-${item.resource}`} to="/tenants/$tenantId" params={{ tenantId: item.tenantId }} style={{ display: 'block', textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.tenantName}</span>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 11, fontWeight: 600, color: item.percentage >= 100 ? 'var(--red)' : 'var(--yellow)', flexShrink: 0, marginLeft: 8 }}>{item.percentage}%</span>
                </div>
                <div style={{ height: 2, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, transition: 'width 0.7s', width: `${Math.min(item.percentage, 100)}%`, background: item.percentage >= 100 ? 'var(--red)' : item.percentage >= 90 ? 'var(--yellow)' : 'var(--accent)' }} />
                </div>
                <p style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--fg-dim)', marginTop: 5 }}>
                  {item.current}/{item.limit === 9999 ? '∞' : item.limit} {item.resource === 'users' ? 'usuários' : item.resource === 'pdvs' ? 'PDVs' : 'filiais'} · {segmentLabels[item.segment]}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* PDVs offline */}
        <div style={{ paddingLeft: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <p style={{ fontFamily: 'Geist Mono', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-dim)' }}>PDVs offline</p>
            {metrics.pdvsOffline > 0 && <span style={{ fontFamily: 'Geist Mono', fontSize: 11, fontWeight: 600, color: 'var(--red)' }}>{metrics.pdvsOffline}</span>}
          </div>
          {metrics.pdvsOffline === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-dim)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              Todos online
            </div>
          ) : (
            [
              { tenant: 'Farmácia Central Saúde', pdv: 'PDV #1 — Filial Norte', time: '3h', id: 'tenant_001' },
              { tenant: 'Padaria Trigo de Ouro', pdv: 'PDV #1 — Principal', time: '6h', id: 'tenant_003' },
            ].map(({ tenant, pdv, time, id }, i, arr) => (
              <Link key={id} to="/tenants/$tenantId" params={{ tenantId: id }} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingTop: 12, paddingBottom: 12, borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none', textDecoration: 'none' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tenant}</p>
                  <p style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{pdv}</p>
                  <p style={{ fontFamily: 'Geist Mono', fontSize: 10, color: 'var(--red)', marginTop: 3 }}>Offline há {time}</p>
                </div>
                <ArrowUpRight size={12} style={{ color: 'var(--fg-dim)', flexShrink: 0, marginTop: 2 }} />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
