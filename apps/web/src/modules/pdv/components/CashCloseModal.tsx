import { useState } from 'react'
import { X, Printer, Lock, Banknote, CreditCard, Smartphone, AlertTriangle, CheckCircle2, Tag } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { formatCurrency } from '@/shared/utils/formatters'
import { useSalesHistoryStore, getTodaySales, getSalesTotals } from '../store/salesHistoryStore'
import type { PaymentMethod } from '@/shared/types'

const METHOD_LABELS: Record<PaymentMethod, { label: string; icon: React.ElementType }> = {
  cash:        { label: 'Dinheiro',    icon: Banknote },
  card_debit:  { label: 'Débito',      icon: CreditCard },
  card_credit: { label: 'Crédito',     icon: CreditCard },
  pix:         { label: 'Pix',         icon: Smartphone },
  voucher:     { label: 'Voucher',     icon: Tag },
}

interface CashCloseModalProps {
  open: boolean
  onClose: () => void
  accent: string
  hasBackground: boolean
}

export function CashCloseModal({ open, onClose, accent, hasBackground }: CashCloseModalProps) {
  const { sales, clearHistory } = useSalesHistoryStore()
  const todaySales   = getTodaySales(sales)
  const { total, byMethod, count } = getSalesTotals(todaySales)
  const cashInSystem = byMethod['cash'] ?? 0

  const [physicalCash, setPhysicalCash] = useState('')
  const [confirmed, setConfirmed]       = useState(false)

  if (!open) return null

  const physVal  = parseFloat(physicalCash.replace(',', '.'))
  const diff     = !isNaN(physVal) ? physVal - cashInSystem : null
  const hasDiff  = diff !== null && Math.abs(diff) > 0.01

  const handleConfirm = () => {
    setConfirmed(true)
    setTimeout(() => {
      clearHistory()
      setConfirmed(false)
      setPhysicalCash('')
      onClose()
    }, 2000)
  }

  const panelBg = hasBackground
    ? { background: 'rgba(8,7,6,0.97)', border: '1px solid rgba(255,255,255,0.1)' }
    : { background: 'var(--surface-0)', border: '1px solid var(--border)' }

  const rowCls = cn('flex justify-between items-center py-2 text-sm',
    hasBackground ? 'border-b border-white/6' : 'border-b border-border',
    'last:border-0',
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-[420px] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={panelBg}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Lock size={16} style={{ color: accent }} />
            <span className={cn('font-semibold', hasBackground ? 'text-white' : 'text-ink')}>Fechamento de Caixa</span>
          </div>
          <button onClick={onClose} className={hasBackground ? 'text-white/40 hover:text-white' : 'text-ink-subtle hover:text-ink'}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Date/summary */}
          <div className={cn('rounded-xl p-4', hasBackground ? 'bg-white/5 border border-white/8' : 'bg-surface-1 border border-border')}>
            <p className={cn('text-xs font-mono mb-1', hasBackground ? 'text-white/40' : 'text-ink-subtle')}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-mono font-bold" style={{ color: accent }}>{formatCurrency(total)}</p>
              <p className={cn('text-xs', hasBackground ? 'text-white/40' : 'text-ink-subtle')}>{count} {count === 1 ? 'venda' : 'vendas'}</p>
            </div>
          </div>

          {/* Breakdown by method */}
          <div>
            <p className={cn('text-[10px] font-mono uppercase tracking-widest mb-2', hasBackground ? 'text-white/30' : 'text-ink-subtle')}>Por forma de pagamento</p>
            <div className={cn('rounded-xl overflow-hidden', hasBackground ? 'border border-white/8' : 'border border-border')}>
              {(Object.entries(METHOD_LABELS) as [PaymentMethod, { label: string; icon: React.ElementType }][]).map(([key, { label, icon: Icon }]) => {
                const val = byMethod[key] ?? 0
                if (val === 0 && count > 0) return null
                return (
                  <div key={key} className={cn(rowCls, 'px-4')}>
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={hasBackground ? 'text-white/40' : 'text-ink-subtle'} />
                      <span className={hasBackground ? 'text-white/70' : 'text-ink-muted'}>{label}</span>
                    </div>
                    <span className={cn('font-mono font-semibold', hasBackground ? 'text-white' : 'text-ink')}>{formatCurrency(val)}</span>
                  </div>
                )
              })}
              {count === 0 && (
                <p className={cn('px-4 py-3 text-sm', hasBackground ? 'text-white/30' : 'text-ink-subtle')}>Nenhuma venda registrada hoje</p>
              )}
            </div>
          </div>

          {/* Physical cash count */}
          <div>
            <p className={cn('text-[10px] font-mono uppercase tracking-widest mb-2', hasBackground ? 'text-white/30' : 'text-ink-subtle')}>Contagem física do caixa</p>
            <div className="flex gap-2 items-center">
              <span className={cn('text-sm', hasBackground ? 'text-white/50' : 'text-ink-muted')}>R$</span>
              <input
                type="number"
                placeholder="0,00"
                value={physicalCash}
                onChange={(e) => setPhysicalCash(e.target.value)}
                className={cn(
                  'flex-1 h-10 px-3 rounded-lg text-sm font-mono focus:outline-none',
                  hasBackground
                    ? 'bg-white/8 border border-white/15 text-white placeholder:text-white/25 focus:border-white/35'
                    : 'bg-surface-1 border border-border text-ink focus:border-border-hover',
                )}
              />
            </div>

            {/* Difference */}
            {diff !== null && (
              <div className={cn(
                'mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm',
                hasDiff
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
              )}>
                {hasDiff ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                <span className="font-semibold">
                  {hasDiff
                    ? `Diferença de ${formatCurrency(Math.abs(diff))} (${diff > 0 ? 'sobra' : 'falta'})`
                    : 'Caixa conferido — sem diferença'
                  }
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className={cn('grid grid-cols-3 gap-2')}>
            {[
              { label: 'Ticket Médio', value: count > 0 ? formatCurrency(total / count) : '—' },
              { label: 'Dinheiro', value: formatCurrency(cashInSystem) },
              { label: 'Digital', value: formatCurrency(total - cashInSystem) },
            ].map(({ label, value }) => (
              <div key={label} className={cn('rounded-xl p-3 text-center', hasBackground ? 'bg-white/5 border border-white/8' : 'bg-surface-1 border border-border')}>
                <p className={cn('text-[10px] mb-1', hasBackground ? 'text-white/35' : 'text-ink-subtle')}>{label}</p>
                <p className={cn('text-sm font-mono font-bold', hasBackground ? 'text-white' : 'text-ink')}>{value}</p>
              </div>
            ))}
          </div>

          {/* Chart bar — visual breakdown */}
          {total > 0 && (
            <div>
              <p className={cn('text-[10px] font-mono uppercase tracking-widest mb-2', hasBackground ? 'text-white/30' : 'text-ink-subtle')}>Composição</p>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                {(Object.entries(byMethod) as [string, number][]).map(([method, val], i) => {
                  const pct = (val / total) * 100
                  const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b']
                  return (
                    <div key={method} className="rounded-full transition-all" style={{ width: `${pct}%`, background: colors[i % colors.length] }} title={`${method}: ${pct.toFixed(0)}%`} />
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 shrink-0 flex gap-2"
          style={{ borderTop: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)' }}
        >
          <button
            onClick={() => window.print()}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors',
              hasBackground ? 'border-white/15 text-white/60 hover:bg-white/8' : 'border-border text-ink-muted hover:bg-surface-2',
            )}
          >
            <Printer size={14} />
            Imprimir
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmed || count === 0}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-40"
            style={{ background: accent }}
          >
            {confirmed ? (
              <><CheckCircle2 size={15} /> Fechamento Registrado!</>
            ) : (
              <><Lock size={15} /> Fechar Caixa</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
