import { useState, useEffect } from 'react'
import {
  Plus, Minus, X, CreditCard, Banknote, Smartphone,
  Search, Users, ChevronLeft, CheckCircle2, Tag, Clock,
  UtensilsCrossed, SplitSquareHorizontal, ListOrdered, Phone, UserPlus,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { formatCurrency } from '@/shared/utils/formatters'
import { Input } from '@/shared/components/Input'
import { MOCK_PRODUCTS } from '@/mock/configs'
import { useComandaStore } from '../store/comandaStore'
import { useWaitlistStore } from '../store/waitlistStore'
import type { Comanda } from '../store/comandaStore'
import type { PaymentMethod, Product } from '@/shared/types'
import { PixQRCode } from './PixQRCode'

// ─── PAYMENT METHODS ──────────────────────────────────────────────
const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'cash',        label: 'Dinheiro',  icon: <Banknote size={16} /> },
  { id: 'card_debit',  label: 'Débito',    icon: <CreditCard size={16} /> },
  { id: 'card_credit', label: 'Crédito',   icon: <CreditCard size={16} /> },
  { id: 'pix',         label: 'Pix',       icon: <Smartphone size={16} /> },
]

// ─── HELPERS ──────────────────────────────────────────────────────
function comandaTotal(comanda: Comanda) {
  const subtotal = comanda.items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  return subtotal - subtotal * (comanda.discount / 100)
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'agora'
  if (diff < 60) return `${diff}min`
  return `${Math.floor(diff / 60)}h${diff % 60 > 0 ? `${diff % 60}min` : ''}`
}

// ─── OPEN COMANDA MODAL ──────────────────────────────────────────
function OpenComandaModal({
  tableNumber,
  onConfirm,
  onClose,
}: {
  tableNumber: number
  onConfirm: (name: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter') onConfirm(name)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [name, onClose, onConfirm])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-80 rounded-2xl p-6 space-y-5"
        style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-ink">Mesa {tableNumber}</h3>
            <p className="text-xs text-ink-muted mt-0.5">Abrir nova comanda</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-2">
            <X size={14} />
          </button>
        </div>
        <Input
          label="Nome do cliente (opcional)"
          placeholder="Ex: João, Mesa 3..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg text-sm font-medium text-ink-muted border border-border hover:bg-surface-2 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(name)}
            className="flex-1 h-10 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: 'var(--accent)' }}
          >
            Abrir Comanda
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PAYMENT MODAL ────────────────────────────────────────────────
function PaymentModal({
  comanda,
  accent,
  onConfirm,
  onClose,
}: {
  comanda: Comanda
  accent: string
  onConfirm: (method: PaymentMethod) => void
  onClose: () => void
}) {
  const [method, setMethod]         = useState<PaymentMethod>('pix')
  const [cashReceived, setCashReceived] = useState('')
  const [splitCount, setSplitCount] = useState(1)

  const total = comandaTotal(comanda)
  const perPerson = splitCount > 1 ? total / splitCount : total
  const change = method === 'cash' && cashReceived
    ? parseFloat(cashReceived.replace(',', '.')) - perPerson
    : null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-[420px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="font-semibold text-ink">Fechar Comanda</h3>
            <p className="text-xs text-ink-muted mt-0.5">Mesa {comanda.tableNumber}{comanda.customerName ? ` · ${comanda.customerName}` : ''}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-2">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Items summary */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {comanda.items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-ink-muted">{item.quantity}x {item.product.name}</span>
                <span className="font-mono text-ink">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {comanda.discount > 0 && (
            <div className="flex justify-between text-sm text-red-400">
              <span>Desconto ({comanda.discount}%)</span>
              <span className="font-mono">-{formatCurrency(
                comanda.items.reduce((s, i) => s + i.product.price * i.quantity, 0) * (comanda.discount / 100)
              )}</span>
            </div>
          )}

          <div
            className="flex justify-between font-bold text-xl pt-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <span className="text-ink">Total</span>
            <span className="font-mono" style={{ color: accent }}>{formatCurrency(total)}</span>
          </div>

          {/* Bill split */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-1">
            <SplitSquareHorizontal size={15} className="text-ink-subtle shrink-0" />
            <span className="text-xs text-ink-muted flex-1">Dividir conta</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                className="w-6 h-6 rounded bg-surface-2 text-ink hover:bg-surface-3 flex items-center justify-center text-xs transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-mono font-bold text-ink">{splitCount}</span>
              <button
                onClick={() => setSplitCount(Math.min(20, splitCount + 1))}
                className="w-6 h-6 rounded bg-surface-2 text-ink hover:bg-surface-3 flex items-center justify-center text-xs transition-colors"
              >
                +
              </button>
            </div>
            {splitCount > 1 && (
              <span className="text-sm font-mono font-bold ml-1" style={{ color: accent }}>
                {formatCurrency(perPerson)}/pessoa
              </span>
            )}
          </div>

          {/* Payment methods */}
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setMethod(pm.id)}
                className={cn('flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all')}
                style={method === pm.id
                  ? { background: accent, color: '#fff', border: `1px solid ${accent}` }
                  : { background: 'var(--surface-1)', color: 'var(--fg-dim)', border: '1px solid var(--border)' }
                }
              >
                {pm.icon}
                {pm.label}
              </button>
            ))}
          </div>

          {/* PIX QR Code */}
          {method === 'pix' && perPerson > 0 && (
            <div className="flex justify-center py-2">
              <PixQRCode total={perPerson} size={160} />
            </div>
          )}

          {/* Cash change */}
          {method === 'cash' && (
            <div className="space-y-2">
              <Input
                label={splitCount > 1 ? `Valor recebido (${formatCurrency(perPerson)} por pessoa)` : 'Valor recebido'}
                type="number"
                placeholder="0,00"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                autoFocus
              />
              {change !== null && change >= 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Troco</span>
                  <span className="font-mono font-bold text-emerald-400">{formatCurrency(change)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 pb-5 shrink-0">
          <button
            onClick={() => onConfirm(method)}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: accent }}
          >
            {splitCount > 1
              ? `Confirmar — ${formatCurrency(perPerson)} × ${splitCount}`
              : 'Confirmar Pagamento'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SUCCESS OVERLAY ──────────────────────────────────────────────
function ComandaSuccessOverlay({
  comanda,
  accent,
  onClose,
}: {
  comanda: Comanda
  accent: string
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface-0 border border-border rounded-2xl p-10 text-center space-y-4 shadow-2xl">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ background: `${accent}22` }}>
          <CheckCircle2 size={44} style={{ color: accent }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-ink">Comanda Fechada!</h2>
          <p className="text-3xl font-mono font-bold mt-2" style={{ color: accent }}>
            {formatCurrency(comandaTotal(comanda))}
          </p>
          <p className="text-sm text-ink-muted mt-1">Mesa {comanda.tableNumber}{comanda.customerName ? ` · ${comanda.customerName}` : ''}</p>
        </div>
        <p className="text-sm text-ink-muted">Clique para continuar</p>
      </div>
    </div>
  )
}

// ─── COMANDA DETAIL VIEW ──────────────────────────────────────────
function ComandaDetail({
  comanda,
  accent,
  hasBackground,
  panelStyle,
  cardStyle,
  buttonShape,
  compact,
  onBack,
}: {
  comanda: Comanda
  accent: string
  hasBackground: boolean
  panelStyle: React.CSSProperties
  cardStyle: string
  buttonShape: string
  compact: boolean
  onBack: () => void
}) {
  const { addItem, removeItem, updateItemQty, updateItemNote, setDiscount, finalizeComanda, cancelComanda } = useComandaStore()
  const [search, setSearch] = useState('')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [noteTarget, setNoteTarget] = useState<string | null>(null)

  const filteredProducts = search.trim()
    ? MOCK_PRODUCTS.filter((p) => p.isActive && (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode === search
    ))
    : MOCK_PRODUCTS.filter((p) => p.isActive).slice(0, compact ? 20 : 16)

  const subtotal = comanda.items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const discountAmount = subtotal * (comanda.discount / 100)
  const total = subtotal - discountAmount

  const btnRadius = buttonShape === 'sharp' ? 'rounded-none' : buttonShape === 'pill' ? 'rounded-full' : 'rounded-lg'
  const cardRadius = buttonShape === 'sharp' ? 'rounded-none' : buttonShape === 'pill' ? 'rounded-2xl' : 'rounded-lg'

  const text = (bright = false) => hasBackground
    ? bright ? 'text-white' : 'text-white/60'
    : bright ? 'text-ink' : 'text-ink-muted'
  const divider = hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)'

  const handleFinalize = (method: PaymentMethod) => {
    finalizeComanda(comanda.id, method)
    setPaymentOpen(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <ComandaSuccessOverlay
        comanda={comanda}
        accent={accent}
        onClose={onBack}
      />
    )
  }

  return (
    <>
      {paymentOpen && (
        <PaymentModal
          comanda={comanda}
          accent={accent}
          onConfirm={handleFinalize}
          onClose={() => setPaymentOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Product grid */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ borderRight: divider, ...panelStyle }}
        >
          {/* Sub-header */}
          <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: divider }}>
            <button
              onClick={onBack}
              className={cn('flex items-center gap-1.5 text-sm transition-colors', text(),'hover:' + (hasBackground ? 'text-white' : 'text-ink'))}
            >
              <ChevronLeft size={16} />
              Mesas
            </button>
            <span className={cn('text-sm font-semibold', text(true))}>
              Mesa {comanda.tableNumber}{comanda.customerName ? ` · ${comanda.customerName}` : ''}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className={cn('text-[10px] font-mono', text())}>
                <Clock size={10} className="inline mr-1" />
                {timeAgo(comanda.openedAt)}
              </span>
              <button
                onClick={() => { cancelComanda(comanda.id); onBack() }}
                className={cn('text-xs px-2 py-1 rounded border transition-colors', hasBackground ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-500 hover:bg-red-50')}
              >
                Cancelar
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 shrink-0" style={{ borderBottom: divider }}>
            <Input
              placeholder="Adicionar item à comanda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconLeft={<Search size={14} />}
              autoFocus
              className={hasBackground ? 'bg-white/8 border-white/12 text-white placeholder:text-white/30 focus:border-white/30' : ''}
            />
          </div>

          {/* Products */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className={cn('grid gap-2', compact ? 'grid-cols-3 xl:grid-cols-5' : 'grid-cols-2 xl:grid-cols-4')}>
              {filteredProducts.map((product: Product) => {
                const inComanda = comanda.items.find((i) => i.product.id === product.id)
                return (
                  <button
                    key={product.id}
                    onClick={() => addItem(comanda.id, product)}
                    disabled={product.stock === 0}
                    className={cn(
                      'relative flex flex-col gap-1 text-left transition-all duration-150 active:scale-95 p-3',
                      cardRadius,
                      product.stock === 0 && 'opacity-40 pointer-events-none',
                      !inComanda && cardStyle === 'default' && 'border border-[var(--border)] bg-[var(--surface-1)] hover:shadow-sm',
                      !inComanda && cardStyle === 'glass' && 'border border-white/10 bg-white/6 hover:bg-white/10 backdrop-blur-sm',
                      !inComanda && cardStyle === 'solid' && 'bg-black/40 hover:bg-black/55',
                    )}
                    style={inComanda ? { background: `${accent}22`, border: `1px solid ${accent}55` } : undefined}
                  >
                    {inComanda && (
                      <span
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                        style={{ background: accent }}
                      >
                        {inComanda.quantity}
                      </span>
                    )}
                    <p className={cn('text-xs font-semibold line-clamp-2 leading-tight pr-4', text(true))}>
                      {product.name}
                    </p>
                    <p className="text-sm font-mono font-bold" style={{ color: accent }}>
                      {formatCurrency(product.price)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Comanda sidebar */}
        <div className="w-80 flex flex-col shrink-0" style={panelStyle}>
          {/* Items header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: divider }}>
            <div className="flex items-center gap-2">
              <UtensilsCrossed size={15} className={text()} />
              <span className={cn('text-sm font-semibold', text(true))}>Comanda</span>
              {comanda.items.length > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: accent }}
                >
                  {comanda.items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto">
            {comanda.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <UtensilsCrossed size={28} className={cn(text(), 'opacity-30')} />
                <p className={cn('text-xs', text())}>Nenhum item na comanda</p>
              </div>
            ) : (
              <div className={cn('divide-y', hasBackground ? 'divide-white/6' : 'divide-border')}>
                {comanda.items.map((item) => (
                  <div key={item.product.id} className="px-4 py-3 space-y-1.5">
                    <div className="flex gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-medium truncate', text(true))}>{item.product.name}</p>
                        <p className={cn('text-[10px] font-mono', text())}>{formatCurrency(item.product.price)} / un</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateItemQty(comanda.id, item.product.id, item.quantity - 1)}
                            className={cn('w-5 h-5 rounded flex items-center justify-center transition-colors', hasBackground ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-surface-2 text-ink hover:bg-surface-3')}
                          >
                            <Minus size={10} />
                          </button>
                          <span className={cn('w-6 text-center text-xs font-mono font-bold', text(true))}>{item.quantity}</span>
                          <button
                            onClick={() => updateItemQty(comanda.id, item.product.id, item.quantity + 1)}
                            className={cn('w-5 h-5 rounded flex items-center justify-center transition-colors', hasBackground ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-surface-2 text-ink hover:bg-surface-3')}
                          >
                            <Plus size={10} />
                          </button>
                          <button
                            onClick={() => removeItem(comanda.id, item.product.id)}
                            className={cn('w-5 h-5 rounded flex items-center justify-center transition-colors ml-1', hasBackground ? 'text-white/25 hover:text-red-400' : 'text-ink-subtle hover:text-red-500')}
                          >
                            <X size={10} />
                          </button>
                        </div>
                        <span className="text-xs font-mono font-bold" style={{ color: accent }}>
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                    {/* Note toggle */}
                    {noteTarget === item.product.id ? (
                      <input
                        autoFocus
                        value={item.note}
                        onChange={(e) => updateItemNote(comanda.id, item.product.id, e.target.value)}
                        onBlur={() => setNoteTarget(null)}
                        placeholder="Observação (ex: sem cebola)..."
                        className={cn(
                          'w-full text-[11px] px-2 py-1 rounded border outline-none',
                          hasBackground
                            ? 'bg-white/8 border-white/12 text-white placeholder:text-white/30 focus:border-white/30'
                            : 'bg-surface-1 border-border text-ink focus:border-accent',
                        )}
                      />
                    ) : (
                      <button
                        onClick={() => setNoteTarget(item.product.id)}
                        className={cn('text-[10px] transition-colors', text(), item.note ? 'underline' : 'hover:underline')}
                      >
                        {item.note || '+ obs'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary + Actions */}
          <div className="p-4 space-y-3 shrink-0" style={{ borderTop: divider }}>
            {/* Discount */}
            <div className="flex items-center gap-2">
              <Tag size={13} className={text()} />
              <span className={cn('text-xs flex-1', text())}>Desconto</span>
              <div className="flex items-center gap-1">
                {[-5, null, 5].map((delta, idx) =>
                  delta === null ? (
                    <span key="val" className={cn('text-xs font-mono font-bold w-8 text-center', text(true))}>{comanda.discount}%</span>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => setDiscount(comanda.id, Math.min(50, Math.max(0, comanda.discount + delta)))}
                      className={cn('w-6 h-6 rounded flex items-center justify-center text-xs transition-colors', hasBackground ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-surface-2 text-ink hover:bg-surface-3')}
                    >
                      {delta < 0 ? '-' : '+'}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className={cn('flex justify-between', text())}>
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {comanda.discount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Desconto ({comanda.discount}%)</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1" style={{ borderTop: divider }}>
                <span className={text(true)}>Total</span>
                <span className="font-mono" style={{ color: accent }}>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Finalize */}
            <button
              onClick={() => setPaymentOpen(true)}
              disabled={comanda.items.length === 0}
              className={cn('w-full py-3 text-sm font-semibold text-white transition-all active:scale-[0.98]', btnRadius, 'disabled:opacity-40 disabled:pointer-events-none')}
              style={{ background: accent }}
            >
              Fechar Comanda — {formatCurrency(total)}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── TABLE GRID (main comanda view) ──────────────────────────────
export function ComandaMode({
  accent,
  hasBackground,
  panelStyle,
  cardStyle,
  buttonShape,
  compact,
}: {
  accent: string
  hasBackground: boolean
  panelStyle: React.CSSProperties
  cardStyle: string
  buttonShape: string
  compact: boolean
}) {
  const { comandas, tableCount, openComanda } = useComandaStore()
  const { entries: waitlist, addEntry, seatEntry, cancelEntry } = useWaitlistStore()
  const [openModal, setOpenModal] = useState<number | null>(null)   // table number to open
  const [activeComanda, setActiveComanda] = useState<Comanda | null>(null)
  const [sidebarTab, setSidebarTab] = useState<'history' | 'waitlist'>('history')
  const [waitlistForm, setWaitlistForm] = useState(false)
  const [wlName, setWlName] = useState('')
  const [wlParty, setWlParty] = useState(2)
  const [wlPhone, setWlPhone] = useState('')
  const [seatTarget, setSeatTarget] = useState<string | null>(null)   // waitlist entry id
  const [seatTable, setSeatTable] = useState('')

  const text = (bright = false) => hasBackground
    ? bright ? 'text-white' : 'text-white/60'
    : bright ? 'text-ink' : 'text-ink-muted'

  const divider = hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)'
  const btnRadius = buttonShape === 'sharp' ? 'rounded-none' : buttonShape === 'pill' ? 'rounded-full' : 'rounded-lg'

  // Sync activeComanda when store updates
  useEffect(() => {
    if (activeComanda) {
      const fresh = comandas.find((c) => c.id === activeComanda.id)
      if (!fresh || fresh.status !== 'open') {
        setActiveComanda(null)
      } else {
        setActiveComanda(fresh)
      }
    }
  }, [comandas, activeComanda])

  const openComandasByTable = (tableNumber: number) =>
    comandas.find((c) => c.tableNumber === tableNumber && c.status === 'open')

  const handleTableClick = (tableNumber: number) => {
    const existing = openComandasByTable(tableNumber)
    if (existing) {
      setActiveComanda(existing)
    } else {
      setOpenModal(tableNumber)
    }
  }

  const handleOpenComanda = (name: string) => {
    if (openModal === null) return
    const comanda = openComanda(openModal, name)
    setOpenModal(null)
    setActiveComanda(comanda)
  }

  // Stats
  const openCount  = comandas.filter((c) => c.status === 'open').length
  const paidToday  = comandas.filter((c) => {
    if (c.status !== 'paid' || !c.closedAt) return false
    return new Date(c.closedAt).toDateString() === new Date().toDateString()
  })
  const revenueToday = paidToday.reduce((s, c) => s + comandaTotal(c), 0)

  if (activeComanda) {
    return (
      <ComandaDetail
        comanda={activeComanda}
        accent={accent}
        hasBackground={hasBackground}
        panelStyle={panelStyle}
        cardStyle={cardStyle}
        buttonShape={buttonShape}
        compact={compact}
        onBack={() => setActiveComanda(null)}
      />
    )
  }

  const handleAddWaitlist = () => {
    if (!wlName.trim()) return
    addEntry(wlName.trim(), wlParty, wlPhone.trim())
    setWlName(''); setWlParty(2); setWlPhone(''); setWaitlistForm(false)
    setSidebarTab('waitlist')
  }

  return (
    <>
      {openModal !== null && (
        <OpenComandaModal
          tableNumber={openModal}
          onConfirm={handleOpenComanda}
          onClose={() => setOpenModal(null)}
        />
      )}

      {/* Add to waitlist modal */}
      {waitlistForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="w-80 rounded-2xl p-6 space-y-4"
            style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-ink">Adicionar à Fila</h3>
                <p className="text-xs text-ink-muted mt-0.5">Lista de espera</p>
              </div>
              <button onClick={() => setWaitlistForm(false)} className="p-1.5 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-2">
                <X size={14} />
              </button>
            </div>
            <Input
              label="Nome"
              placeholder="Ex: João Silva"
              value={wlName}
              onChange={(e) => setWlName(e.target.value)}
              autoFocus
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-muted">Nº de pessoas</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWlParty(Math.max(1, wlParty - 1))}
                  className="w-8 h-8 rounded-lg bg-surface-2 text-ink hover:bg-surface-3 flex items-center justify-center transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span className="flex-1 text-center font-mono font-bold text-ink text-lg">{wlParty}</span>
                <button
                  onClick={() => setWlParty(Math.min(20, wlParty + 1))}
                  className="w-8 h-8 rounded-lg bg-surface-2 text-ink hover:bg-surface-3 flex items-center justify-center transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
            <Input
              label="Telefone (opcional)"
              placeholder="(11) 99999-9999"
              value={wlPhone}
              onChange={(e) => setWlPhone(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setWaitlistForm(false)}
                className="flex-1 h-10 rounded-lg text-sm font-medium text-ink-muted border border-border hover:bg-surface-2 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddWaitlist}
                disabled={!wlName.trim()}
                className="flex-1 h-10 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
                style={{ background: accent }}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Table grid */}
        <div className="flex-1 flex flex-col overflow-hidden" style={panelStyle}>
          {/* Stats bar */}
          <div className="flex items-center gap-6 px-6 py-3 shrink-0" style={{ borderBottom: divider }}>
            <div>
              <p className={cn('text-[10px] font-mono uppercase tracking-wider', text())}>Mesas abertas</p>
              <p className={cn('text-lg font-bold font-mono', text(true))} style={openCount > 0 ? { color: accent } : undefined}>{openCount}</p>
            </div>
            <div style={{ width: 1, height: 32, background: hasBackground ? 'rgba(255,255,255,0.1)' : 'var(--border)' }} />
            <div>
              <p className={cn('text-[10px] font-mono uppercase tracking-wider', text())}>Fechadas hoje</p>
              <p className={cn('text-lg font-bold font-mono', text(true))}>{paidToday.length}</p>
            </div>
            <div style={{ width: 1, height: 32, background: hasBackground ? 'rgba(255,255,255,0.1)' : 'var(--border)' }} />
            <div>
              <p className={cn('text-[10px] font-mono uppercase tracking-wider', text())}>Faturamento hoje</p>
              <p className="text-lg font-bold font-mono" style={{ color: accent }}>{formatCurrency(revenueToday)}</p>
            </div>
          </div>

          {/* Tables grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: tableCount }, (_, i) => i + 1).map((tableNumber) => {
                const openComandaForTable = openComandasByTable(tableNumber)
                const isOpen = !!openComandaForTable
                const tableTotal = openComandaForTable ? comandaTotal(openComandaForTable) : 0
                const itemCount = openComandaForTable?.items.reduce((s, i) => s + i.quantity, 0) ?? 0

                return (
                  <button
                    key={tableNumber}
                    onClick={() => handleTableClick(tableNumber)}
                    className={cn(
                      'relative flex flex-col items-center justify-center gap-1 py-5 transition-all duration-150 active:scale-95',
                      btnRadius,
                    )}
                    style={isOpen
                      ? { background: `${accent}22`, border: `2px solid ${accent}66`, boxShadow: `0 0 0 1px ${accent}33` }
                      : hasBackground
                        ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }
                        : { background: 'var(--surface-1)', border: '1px solid var(--border)' }
                    }
                  >
                    {isOpen && (
                      <span
                        className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                        style={{ background: accent }}
                      />
                    )}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                      style={isOpen ? { background: `${accent}33` } : { background: hasBackground ? 'rgba(255,255,255,0.08)' : 'var(--surface-2)' }}
                    >
                      <Users size={18} style={isOpen ? { color: accent } : undefined} className={!isOpen ? text() : ''} />
                    </div>
                    <span className={cn('text-sm font-bold', isOpen ? '' : text(true))} style={isOpen ? { color: accent } : undefined}>
                      Mesa {tableNumber}
                    </span>
                    {isOpen ? (
                      <>
                        <span className={cn('text-[10px] font-mono', text())}>{itemCount} itens</span>
                        <span className="text-xs font-mono font-bold" style={{ color: accent }}>{formatCurrency(tableTotal)}</span>
                        {openComandaForTable?.customerName && (
                          <span className={cn('text-[9px] truncate max-w-[5rem]', text())}>{openComandaForTable.customerName}</span>
                        )}
                      </>
                    ) : (
                      <span className={cn('text-[10px]', text())}>Livre</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar — tabs: Histórico | Fila de Espera */}
        <div className="w-64 flex flex-col shrink-0" style={{ borderLeft: divider, ...panelStyle }}>
          {/* Tab header */}
          <div className="flex shrink-0" style={{ borderBottom: divider }}>
            {(['history', 'waitlist'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold transition-colors',
                  sidebarTab === tab
                    ? hasBackground ? 'text-white border-b-2' : 'text-ink border-b-2'
                    : hasBackground ? 'text-white/40 hover:text-white/70' : 'text-ink-subtle hover:text-ink-muted',
                )}
                style={sidebarTab === tab ? { borderBottomColor: accent } : {}}
              >
                {tab === 'history' ? <Clock size={11} /> : <ListOrdered size={11} />}
                {tab === 'history' ? 'Histórico' : 'Fila de Espera'}
                {tab === 'waitlist' && waitlist.filter(e => e.status === 'waiting').length > 0 && (
                  <span
                    className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                    style={{ background: accent }}
                  >
                    {waitlist.filter(e => e.status === 'waiting').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab: History */}
          {sidebarTab === 'history' && (
            <div className="flex-1 overflow-y-auto">
              {paidToday.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
                  <p className={cn('text-xs text-center', text())}>Nenhuma comanda fechada hoje</p>
                </div>
              ) : (
                <div className={cn('divide-y', hasBackground ? 'divide-white/6' : 'divide-border')}>
                  {[...paidToday].reverse().map((c) => (
                    <div key={c.id} className="px-4 py-3 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className={cn('text-xs font-semibold', text(true))}>Mesa {c.tableNumber}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{formatCurrency(comandaTotal(c))}</span>
                      </div>
                      {c.customerName && <p className={cn('text-[10px]', text())}>{c.customerName}</p>}
                      <p className={cn('text-[10px] font-mono', text())}>{c.closedAt ? timeAgo(c.closedAt) : ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Waitlist */}
          {sidebarTab === 'waitlist' && (
            <>
              {/* Add button */}
              <div className="px-3 py-2 shrink-0" style={{ borderBottom: divider }}>
                <button
                  onClick={() => setWaitlistForm(true)}
                  className={cn(
                    'w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-colors',
                    hasBackground ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-surface-2 text-ink hover:bg-surface-3',
                  )}
                >
                  <UserPlus size={12} />
                  Adicionar à Fila
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {waitlist.filter(e => e.status === 'waiting').length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
                    <ListOrdered size={22} className={cn(text(), 'opacity-30')} />
                    <p className={cn('text-xs text-center', text())}>Fila vazia</p>
                  </div>
                ) : (
                  <div className={cn('divide-y', hasBackground ? 'divide-white/6' : 'divide-border')}>
                    {waitlist
                      .filter(e => e.status === 'waiting')
                      .map((entry, idx) => (
                        <div key={entry.id} className="px-3 py-3 space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span
                              className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white shrink-0 mt-0.5"
                              style={{ background: accent }}
                            >
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-xs font-semibold truncate', text(true))}>{entry.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn('text-[10px] flex items-center gap-0.5', text())}>
                                  <Users size={9} />
                                  {entry.partySize} pessoas
                                </span>
                                <span className={cn('text-[10px] font-mono', text())}>
                                  {timeAgo(entry.waitingSince)}
                                </span>
                              </div>
                              {entry.phone && (
                                <span className={cn('text-[10px] flex items-center gap-0.5 mt-0.5', text())}>
                                  <Phone size={9} />
                                  {entry.phone}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Seat assign */}
                          {seatTarget === entry.id ? (
                            <div className="flex gap-1.5 mt-1">
                              <input
                                autoFocus
                                type="number"
                                placeholder="Mesa nº"
                                value={seatTable}
                                onChange={(e) => setSeatTable(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && seatTable) {
                                    seatEntry(entry.id, parseInt(seatTable))
                                    setSeatTarget(null)
                                    setSeatTable('')
                                  }
                                  if (e.key === 'Escape') { setSeatTarget(null); setSeatTable('') }
                                }}
                                className={cn(
                                  'flex-1 text-[11px] px-2 py-1 rounded border outline-none w-0',
                                  hasBackground
                                    ? 'bg-white/8 border-white/12 text-white placeholder:text-white/30 focus:border-white/30'
                                    : 'bg-surface-1 border-border text-ink focus:border-accent',
                                )}
                              />
                              <button
                                onClick={() => {
                                  if (seatTable) {
                                    seatEntry(entry.id, parseInt(seatTable))
                                    setSeatTarget(null)
                                    setSeatTable('')
                                  }
                                }}
                                className="text-[10px] px-2 py-1 rounded font-semibold text-white transition-colors"
                                style={{ background: accent }}
                              >
                                OK
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setSeatTarget(entry.id)}
                                className={cn(
                                  'flex-1 text-[10px] py-1 rounded font-semibold transition-colors text-white',
                                )}
                                style={{ background: accent }}
                              >
                                Sentar
                              </button>
                              <button
                                onClick={() => cancelEntry(entry.id)}
                                className={cn(
                                  'flex-1 text-[10px] py-1 rounded font-semibold transition-colors',
                                  hasBackground ? 'bg-white/8 text-white/60 hover:bg-red-500/20 hover:text-red-400' : 'bg-surface-2 text-ink-muted hover:bg-red-50 hover:text-red-500',
                                )}
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
