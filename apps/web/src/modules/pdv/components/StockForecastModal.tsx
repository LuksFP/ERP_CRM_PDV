import { X, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/formatters'
import { MOCK_PRODUCTS } from '@/mock/configs'
import { cn } from '@/shared/utils/cn'

interface Props {
  accent: string
  onClose: () => void
}

// Mock daily sales velocity per product (units/day)
const MOCK_VELOCITY: Record<string, number> = {
  p001: 4.2, p002: 1.1, p003: 3.5, p004: 0.3, p005: 5.8, p006: 0.8,
}

function getDaysLeft(stock: number, dailyVelocity: number) {
  if (dailyVelocity <= 0) return Infinity
  return Math.floor(stock / dailyVelocity)
}

function urgencyColor(days: number, accent: string) {
  if (days <= 3)  return '#ef4444'
  if (days <= 7)  return '#f59e0b'
  if (days <= 14) return '#eab308'
  return accent
}

function urgencyLabel(days: number) {
  if (days <= 0)   return 'ESGOTADO'
  if (days <= 3)   return `${days}d crítico`
  if (days <= 7)   return `${days}d urgente`
  if (days <= 14)  return `${days}d atenção`
  return `${days}d OK`
}

export function StockForecastModal({ accent, onClose }: Props) {
  const products = MOCK_PRODUCTS
    .filter((p) => p.isActive)
    .map((p) => {
      const velocity = MOCK_VELOCITY[p.id] ?? 0.5
      const days = getDaysLeft(p.stock, velocity)
      return { ...p, velocity, days }
    })
    .sort((a, b) => a.days - b.days)

  const critical = products.filter((p) => p.days <= 3).length
  const warning  = products.filter((p) => p.days > 3 && p.days <= 14).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-[520px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <TrendingDown size={16} style={{ color: accent }} />
            <div>
              <h3 className="font-semibold text-ink text-sm">Previsão de Estoque</h3>
              <p className="text-[10px] text-ink-muted mt-0.5">Com base na velocidade de vendas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {critical > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                <AlertTriangle size={9} /> {critical} crítico{critical > 1 ? 's' : ''}
              </span>
            )}
            {warning > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {warning} atenção
              </span>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-2">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-2.5 shrink-0 text-[10px] text-ink-muted" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-1)' }}>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> ≤ 3 dias: crítico</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 4-7 dias: urgente</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> 8-14 dias: atenção</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: accent }} /> OK</span>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {products.map((p) => {
            const color = urgencyColor(p.days, accent)
            const pct = Math.min(100, (p.stock / Math.max(p.stock, p.minStock * 3)) * 100)
            const isCritical = p.days <= 7
            return (
              <div key={p.id} className={cn('px-5 py-3.5 flex items-center gap-3', isCritical && 'bg-red-500/4')}>
                {/* Status dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: color }}
                />
                {/* Name + category */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-ink truncate">{p.name}</p>
                    {p.days <= 0 && (
                      <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded shrink-0">
                        ESGOTADO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-ink-muted">{p.category} · {formatCurrency(p.price)}</p>
                  </div>
                  {/* Stock bar */}
                  <div className="mt-1.5 h-1 rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
                {/* Stats */}
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono font-bold" style={{ color }}>
                    {urgencyLabel(p.days)}
                  </p>
                  <p className="text-[10px] text-ink-muted mt-0.5">
                    {p.stock} {p.unit} em estoque
                  </p>
                  <p className="text-[10px] text-ink-subtle">
                    {p.velocity.toFixed(1)} {p.unit}/dia
                  </p>
                </div>
                {/* Icon */}
                <div className="shrink-0">
                  {p.days > 14
                    ? <CheckCircle2 size={14} style={{ color: accent }} />
                    : <AlertTriangle size={14} style={{ color }} />
                  }
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-5 py-3 shrink-0 text-[10px] text-ink-muted text-center" style={{ borderTop: '1px solid var(--border)' }}>
          Velocidade calculada com base nos últimos 30 dias de vendas
        </div>
      </div>
    </div>
  )
}
