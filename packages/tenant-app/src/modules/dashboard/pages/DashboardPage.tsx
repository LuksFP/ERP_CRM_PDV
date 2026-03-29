import { useState } from 'react'
import {
  TrendingUp, Package,
  DollarSign, Users2, Activity,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip as RTooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useTenantConfig } from '@/shared/hooks/useTenantConfig'
import { useMockQuery } from '@/shared/hooks/useMockQuery'
import { formatCurrency } from '@/shared/utils/formatters'
import { Badge } from '@/shared/components/Badge'
import { Skeleton } from '@/shared/components/Skeleton'
import { cn } from '@/shared/utils/cn'

// ── Mock data ────────────────────────────────────────────────────────────────
const SALES_WEEK = [
  { day: 'Seg', value: 3200 }, { day: 'Ter', value: 4100 },
  { day: 'Qua', value: 3800 }, { day: 'Qui', value: 5200 },
  { day: 'Sex', value: 6100 }, { day: 'Sáb', value: 7400 },
  { day: 'Dom', value: 2800 },
]

const TOP_PRODUCTS = [
  { name: 'Produto A', qty: 142, revenue: 7820 },
  { name: 'Produto B', qty: 98, revenue: 5390 },
  { name: 'Produto C', qty: 75, revenue: 3750 },
  { name: 'Produto D', qty: 61, revenue: 3050 },
  { name: 'Produto E', qty: 44, revenue: 2200 },
]

const CASHFLOW = [
  { mes: 'Out', entrada: 28000, saida: 18000 },
  { mes: 'Nov', entrada: 32000, saida: 21000 },
  { mes: 'Dez', entrada: 41000, saida: 24000 },
  { mes: 'Jan', entrada: 35000, saida: 22000 },
  { mes: 'Fev', entrada: 38000, saida: 25000 },
  { mes: 'Mar', entrada: 44000, saida: 27000 },
]

const PDV_STATUS = [
  { id: 'PDV-01', operator: 'João Silva', status: 'online' as const, sales: 34 },
  { id: 'PDV-02', operator: 'Maria Santos', status: 'online' as const, sales: 28 },
  { id: 'PDV-03', operator: 'Pedro Alves', status: 'delayed' as const, sales: 12 },
]

const PIPELINE = [
  { stage: 'Lead', count: 8, color: '#6366f1' },
  { stage: 'Contato', count: 5, color: '#0891B2' },
  { stage: 'Proposta', count: 3, color: '#D97706' },
  { stage: 'Negociação', count: 2, color: '#059669' },
]

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({
  title, value, change, icon, positive,
}: {
  title: string
  value: string
  change?: string
  icon: React.ReactNode
  positive?: boolean
}) {
  return (
    <div className="bg-surface-0 border border-border rounded-lg p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center text-[var(--accent)] shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono uppercase tracking-wider text-ink-subtle">{title}</p>
        <p className="mt-1 text-2xl font-bold text-ink tracking-tight">{value}</p>
        {change && (
          <p className={cn('text-xs mt-0.5 font-medium', positive ? 'text-emerald-500' : 'text-red-500')}>
            {change}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-surface-0 border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Skeleton dashboard ───────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-64 rounded-lg lg:col-span-2" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const config = useTenantConfig()
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const { isLoading } = useMockQuery(true, 600)

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Dashboard</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Bem-vindo, {config.currentUser.name.split(' ')[0]}. Aqui está o resumo de hoje.
          </p>
        </div>
        <div className="flex gap-1 bg-surface-1 rounded-lg p-1 border border-border">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded transition-all',
                period === p
                  ? 'bg-surface-0 text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              {p === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Vendas Hoje"
          value={formatCurrency(6100)}
          change="+14% vs ontem"
          positive
          icon={<TrendingUp size={18} />}
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(87.40)}
          change="+5% vs semana"
          positive
          icon={<DollarSign size={18} />}
        />
        <KPICard
          title="Est. Baixo"
          value="7 itens"
          change="2 críticos"
          icon={<Package size={18} />}
        />
        <KPICard
          title="PDVs Ativos"
          value="2 / 3"
          change="1 com atraso"
          icon={<Activity size={18} />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales area chart */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Vendas da Semana"
            action={
              <Badge variant="accent">R$ {(SALES_WEEK.reduce((s, d) => s + d.value, 0) / 1000).toFixed(1)}k</Badge>
            }
          >
            <div className="p-4 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SALES_WEEK} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--ink-subtle)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--ink-subtle)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <RTooltip
                    contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [formatCurrency(v), 'Vendas']}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* CRM Pipeline */}
        <SectionCard title="Pipeline CRM">
          <div className="p-4 space-y-3">
            {PIPELINE.map((p) => (
              <div key={p.stage}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-muted">{p.stage}</span>
                  <span className="font-mono font-semibold text-ink">{p.count}</span>
                </div>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(p.count / 10) * 100}%`,
                      background: p.color,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 flex items-center gap-2 text-xs text-ink-muted border-t border-border">
              <Users2 size={13} />
              <span>18 oportunidades abertas</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cashflow mini */}
        <div className="lg:col-span-2">
          <SectionCard title="Fluxo de Caixa — 6 meses">
            <div className="p-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CASHFLOW} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--ink-subtle)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--ink-subtle)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <RTooltip
                    contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [formatCurrency(v)]}
                  />
                  <Bar dataKey="entrada" name="Entradas" fill="var(--accent)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="saida" name="Saídas" fill="var(--surface-3)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* PDV Status */}
        <SectionCard title="Status PDVs">
          <div className="divide-y divide-border">
            {PDV_STATUS.map((pdv) => (
              <div key={pdv.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    pdv.status === 'online' ? 'bg-emerald-500' :
                    pdv.status === 'delayed' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink">{pdv.id}</p>
                  <p className="text-[10px] text-ink-subtle truncate">{pdv.operator}</p>
                </div>
                <span className="text-xs font-mono text-ink-muted">{pdv.sales} vdas</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Top products */}
      <SectionCard title="Produtos Mais Vendidos">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['#', 'PRODUTO', 'QTD', 'RECEITA'].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-ink-subtle">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_PRODUCTS.map((p, i) => (
                <tr key={p.name} className={cn('border-b border-border/50 hover:bg-surface-1 transition-colors', i % 2 === 0 && 'bg-surface-0/50')}>
                  <td className="px-4 py-3 font-mono text-ink-subtle text-xs">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-ink-muted">{p.qty}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-[var(--accent)]">{formatCurrency(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}
