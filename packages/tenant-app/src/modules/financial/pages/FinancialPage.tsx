import { useState } from 'react'
import {
  TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle2,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { MOCK_TRANSACTIONS } from '@/mock/configs'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { Badge } from '@/shared/components/Badge'
import { Tabs } from '@/shared/components/Tabs'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'
import type { TransactionStatus } from '@/shared/types'

const STATUS_BADGE: Record<TransactionStatus, { variant: 'success' | 'warning' | 'danger' | 'neutral'; label: string }> = {
  pending:   { variant: 'warning', label: 'Pendente' },
  paid:      { variant: 'success', label: 'Pago' },
  overdue:   { variant: 'danger',  label: 'Vencido' },
  cancelled: { variant: 'neutral', label: 'Cancelado' },
}

const CASHFLOW_DATA = [
  { mes: 'Out', entrada: 28000, saida: 18000, saldo: 10000 },
  { mes: 'Nov', entrada: 32000, saida: 21000, saldo: 11000 },
  { mes: 'Dez', entrada: 41000, saida: 24000, saldo: 17000 },
  { mes: 'Jan', entrada: 35000, saida: 22000, saldo: 13000 },
  { mes: 'Fev', entrada: 38000, saida: 25000, saldo: 13000 },
  { mes: 'Mar', entrada: 44000, saida: 27000, saldo: 17000 },
]

const DRE_DATA = [
  { label: 'Receita Bruta',      value: 44000, positive: true },
  { label: 'Deduções',            value: -1800, positive: false },
  { label: 'Receita Líquida',     value: 42200, positive: true,  bold: true },
  { label: 'CMV',                 value: -18000, positive: false },
  { label: 'Lucro Bruto',         value: 24200, positive: true,  bold: true },
  { label: 'Despesas Operac.',    value: -8500, positive: false },
  { label: 'Despesas Administr.', value: -3200, positive: false },
  { label: 'EBITDA',              value: 12500, positive: true,  bold: true },
  { label: 'Depreciação',         value: -900, positive: false },
  { label: 'EBIT',                value: 11600, positive: true,  bold: true },
  { label: 'IR/CSLL (est.)',      value: -2900, positive: false },
  { label: 'Lucro Líquido',       value: 8700,  positive: true,  bold: true, highlight: true },
]

export default function FinancialPage() {
  const [tab, setTab] = useState('overview')
  const [filter, setFilter] = useState<'all' | 'receivable' | 'payable'>('all')

  const receivables = MOCK_TRANSACTIONS.filter((t) => t.type === 'receivable')
  const payables = MOCK_TRANSACTIONS.filter((t) => t.type === 'payable')
  const filtered = filter === 'all' ? MOCK_TRANSACTIONS : MOCK_TRANSACTIONS.filter((t) => t.type === filter)

  const totalReceivable = receivables.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0)
  const totalPayable = payables.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0)
  const overdue = MOCK_TRANSACTIONS.filter((t) => t.status === 'overdue').length

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Financeiro</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Visão geral das finanças do mês
          </p>
        </div>
        <Button leftIcon={<DollarSign size={16} />} variant="outline">
          Novo Lançamento
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'A Receber', value: formatCurrency(totalReceivable), icon: <TrendingUp size={16} />, positive: true },
          { label: 'A Pagar',   value: formatCurrency(totalPayable),    icon: <TrendingDown size={16} />, positive: false },
          { label: 'Vencidos',  value: `${overdue} lançamentos`,        icon: <Clock size={16} />, positive: false },
          { label: 'Saldo Est.', value: formatCurrency(totalReceivable - totalPayable), icon: <CheckCircle2 size={16} />, positive: totalReceivable > totalPayable },
        ].map((kpi) => (
          <div key={kpi.label} className="flex items-center gap-3 p-4 bg-surface-0 border border-border rounded-lg">
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
              kpi.positive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            )}>
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
          { id: 'overview', label: 'Visão Geral' },
          { id: 'transactions', label: 'Lançamentos', badge: MOCK_TRANSACTIONS.length },
          { id: 'dre', label: 'DRE' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {/* Overview */}
      {tab === 'overview' && (
        <div className="bg-surface-0 border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-ink">Fluxo de Caixa — 6 Meses</h3>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CASHFLOW_DATA}>
                <defs>
                  <linearGradient id="entradaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="saidaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--ink-subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ink-subtle)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <RTooltip
                  contentStyle={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [formatCurrency(v)]}
                />
                <Area type="monotone" dataKey="entrada" name="Entradas" stroke="#10b981" strokeWidth={2} fill="url(#entradaGrad)" />
                <Area type="monotone" dataKey="saida" name="Saídas" stroke="#ef4444" strokeWidth={2} fill="url(#saidaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transactions */}
      {tab === 'transactions' && (
        <div className="space-y-3">
          {/* Filter */}
          <div className="flex gap-1">
            {(['all', 'receivable', 'payable'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                  filter === f
                    ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                )}
              >
                {f === 'all' ? 'Todos' : f === 'receivable' ? 'A Receber' : 'A Pagar'}
              </button>
            ))}
          </div>

          <div className="bg-surface-0 border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-1">
                  {['DESCRIÇÃO', 'TIPO', 'VENCIMENTO', 'VALOR', 'STATUS'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-ink-subtle">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const status = STATUS_BADGE[t.status]
                  return (
                    <tr key={t.id} className={cn('border-b border-border/50 hover:bg-surface-1 transition-colors', i % 2 === 0 ? 'bg-surface-0' : 'bg-surface-0/50')}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{t.description}</p>
                        {t.contactName && <p className="text-xs text-ink-subtle">{t.contactName}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={t.type === 'receivable' ? 'success' : 'danger'}>
                          {t.type === 'receivable' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-ink-muted">{formatDate(t.dueDate)}</td>
                      <td className={cn(
                        'px-4 py-3 font-mono font-bold',
                        t.type === 'receivable' ? 'text-emerald-500' : 'text-red-500'
                      )}>
                        {t.type === 'receivable' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DRE */}
      {tab === 'dre' && (
        <div className="bg-surface-0 border border-border rounded-lg overflow-hidden max-w-lg">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-ink">DRE Gerencial — Março 2026</h3>
          </div>
          <div className="divide-y divide-border">
            {DRE_DATA.map((row) => (
              <div
                key={row.label}
                className={cn(
                  'flex items-center justify-between px-4 py-2.5',
                  row.highlight && 'bg-[var(--accent-dim)]'
                )}
              >
                <span className={cn('text-sm', row.bold ? 'font-semibold text-ink' : 'text-ink-muted')}>
                  {row.label}
                </span>
                <span
                  className={cn(
                    'font-mono text-sm',
                    row.bold ? 'font-bold' : 'font-medium',
                    row.highlight
                      ? 'text-[var(--accent)]'
                      : row.positive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-500'
                  )}
                >
                  {row.value < 0 ? `-${formatCurrency(Math.abs(row.value))}` : formatCurrency(row.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
