import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Search, Plus, Minus, Trash2, CreditCard, Banknote,
  Smartphone, CheckCircle2, ShoppingCart, X, Tag, Settings2,
  ShoppingBag, UtensilsCrossed, Monitor, Zap, History, FlaskConical,
  ChevronRight, Lock, Mic, MicOff, TrendingDown, Gift, QrCode, Star,
  Download, Sparkles,
} from 'lucide-react'
import { MOCK_PRODUCTS } from '@/mock/configs'
import { formatCurrency } from '@/shared/utils/formatters'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Badge } from '@/shared/components/Badge'
import { cn } from '@/shared/utils/cn'
import { useTenantConfig } from '@/shared/hooks/useTenantConfig'
import { usePDVThemeStore, SEGMENT_GRADIENTS } from '../store/pdvTheme'
import { usePDVCartStore } from '../store/pdvCartStore'
import { useSalesHistoryStore, getTodaySales, getSalesTotals } from '../store/salesHistoryStore'
import { usePDVShortcutsStore } from '../store/pdvShortcutsStore'
import { usePDVSounds } from '../hooks/usePDVSounds'
import { useLoyaltyStore, POINTS_PER_REAL, POINTS_TO_DISCOUNT, DISCOUNT_PER_100_POINTS } from '../store/loyaltyStore'
import { useInventoryStore } from '../store/inventoryStore'
import { usePromotionsStore } from '../store/promotionsStore'
import { PDVSettingsPanel } from '../components/PDVSettingsPanel'
import { ComandaMode } from '../components/ComandaMode'
import { VirtualNumpad } from '../components/VirtualNumpad'
import { CashCloseModal } from '../components/CashCloseModal'
import { PixQRCode } from '../components/PixQRCode'
import { ThermalReceipt } from '../components/ThermalReceipt'
import { StockForecastModal } from '../components/StockForecastModal'
import { PromotionsModal } from '../components/PromotionsModal'
import type { Product, PaymentMethod } from '@/shared/types'
import type { CartItem } from '../store/pdvCartStore'

// ─── VOICE SEARCH HOOK ────────────────────────────────────────────
interface SpeechRecognitionInstance {
  lang: string; interimResults: boolean; maxAlternatives: number
  onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void
  onend: () => void; onerror: () => void
  start: () => void; stop: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance
type AnyWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor
  webkitSpeechRecognition?: SpeechRecognitionCtor
}

function useVoiceSearch(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const start = useCallback(() => {
    const SR = (window as AnyWindow).SpeechRecognition ?? (window as AnyWindow).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'pt-BR'
    r.interimResults = false
    r.maxAlternatives = 1
    r.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? ''
      if (text) onResult(text)
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    recognitionRef.current = r
    r.start()
    setListening(true)
  }, [onResult])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const supported = !!((window as AnyWindow).SpeechRecognition ?? (window as AnyWindow).webkitSpeechRecognition)
  return { listening, start, stop, supported }
}

// ─── CARDÁPIO QR MODAL ────────────────────────────────────────────
function CardapioQRModal({ onClose }: { onClose: () => void }) {
  const url = `${window.location.origin}/cardapio`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=200x200&bgcolor=ffffff&color=000000&margin=8&format=svg`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-80 rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <QrCode size={15} className="text-ink-muted" />
            <h3 className="font-semibold text-ink text-sm">Cardápio Digital</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-2">
            <X size={14} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-3 px-5 py-6">
          <div className="rounded-xl overflow-hidden border-4 border-white shadow-sm bg-white">
            <img src={qrUrl} alt="QR Cardápio" width={200} height={200} style={{ display: 'block' }} />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-ink">Escaneie para ver o cardápio</p>
            <p className="text-[10px] text-ink-muted mt-0.5 font-mono break-all">{url}</p>
          </div>
          <button
            onClick={() => window.open('/cardapio', '_blank', 'noopener')}
            className="w-full py-2 rounded-xl text-sm font-semibold text-ink border border-border hover:bg-surface-2 transition-colors"
          >
            Abrir Cardápio
          </button>
        </div>
      </div>
    </div>
  )
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'cash',        label: 'Dinheiro',  icon: <Banknote size={18} /> },
  { id: 'card_debit',  label: 'Débito',    icon: <CreditCard size={18} /> },
  { id: 'card_credit', label: 'Crédito',   icon: <CreditCard size={18} /> },
  { id: 'pix',         label: 'Pix',       icon: <Smartphone size={18} /> },
]

// ─── SHAPE CLASSES ────────────────────────────────────────────────
function shapeClass(shape: string, base = 'rounded-lg') {
  if (shape === 'sharp') return 'rounded-none'
  if (shape === 'pill')  return 'rounded-full'
  return base
}

// ─── SALE SUCCESS OVERLAY ─────────────────────────────────────────
function SaleSuccessOverlay({
  total, onClose, onPrint, accent,
}: {
  total: number
  onClose: () => void
  onPrint: () => void
  accent: string
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-up">
      <div className="bg-surface-0 border border-border rounded-2xl p-10 text-center space-y-4 animate-bounce-in shadow-2xl">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ background: `${accent}22` }}>
          <CheckCircle2 size={44} style={{ color: accent }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-ink">Venda Concluída!</h2>
          <p className="text-3xl font-mono font-bold mt-2" style={{ color: accent }}>{formatCurrency(total)}</p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button variant="ghost" onClick={onPrint}>Imprimir Cupom</Button>
          <Button variant="primary" onClick={onClose}>Nova Venda</Button>
        </div>
      </div>
    </div>
  )
}

// ─── AVULSO MODAL ─────────────────────────────────────────────────
function AvulsoModal({
  open, onClose, onAdd, accent, btnRadius, hasBackground,
}: {
  open: boolean
  onClose: () => void
  onAdd: (name: string, price: number, qty: number) => void
  accent: string
  btnRadius: string
  hasBackground: boolean
}) {
  const [name, setName]   = useState('')
  const [price, setPrice] = useState('')
  const [qty, setQty]     = useState('1')

  useEffect(() => {
    if (!open) return
    setName(''); setPrice(''); setQty('1')
  }, [open])

  if (!open) return null

  const handleAdd = () => {
    const p = parseFloat(price.replace(',', '.'))
    const q = parseInt(qty) || 1
    if (!name.trim() || isNaN(p) || p <= 0) return
    onAdd(name.trim(), p, q)
    onClose()
  }

  const inputCls = hasBackground
    ? 'bg-white/8 border-white/12 text-white placeholder:text-white/30 focus:border-white/30'
    : ''

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-80 rounded-xl p-5 space-y-4 shadow-2xl"
        style={hasBackground
          ? { background: 'rgba(14,12,10,0.92)', border: '1px solid rgba(255,255,255,0.12)' }
          : { background: 'var(--surface-0)', border: '1px solid var(--border)' }
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={15} style={{ color: accent }} />
            <span className={cn('font-semibold text-sm', hasBackground ? 'text-white' : 'text-ink')}>Item Avulso</span>
          </div>
          <button onClick={onClose} className={hasBackground ? 'text-white/40 hover:text-white' : 'text-ink-subtle hover:text-ink'}>
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <Input
            label="Descrição"
            placeholder="Nome do produto/serviço"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Preço (R$)"
              type="number"
              placeholder="0,00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputCls}
            />
            <Input
              label="Qtd"
              type="number"
              placeholder="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!name.trim() || !price}
          className={cn('w-full py-2.5 text-sm font-semibold text-white transition-all', btnRadius, 'disabled:opacity-40')}
          style={{ background: accent }}
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  )
}

// ─── HISTORY PANEL ────────────────────────────────────────────────
function HistoryPanel({
  open, onClose, onExport, accent, hasBackground, panelStyle,
}: {
  open: boolean
  onClose: () => void
  onExport: () => void
  accent: string
  hasBackground: boolean
  panelStyle: React.CSSProperties
}) {
  const { sales } = useSalesHistoryStore()
  const todaySales = getTodaySales(sales)
  const { total, count, byMethod } = getSalesTotals(todaySales)

  const methodLabel: Record<string, string> = {
    cash: 'Dinheiro', card_debit: 'Débito', card_credit: 'Crédito', pix: 'Pix',
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div
        className="w-80 h-full flex flex-col overflow-hidden shadow-2xl animate-slide-in"
        style={hasBackground
          ? { background: 'rgba(10,9,8,0.96)', borderLeft: '1px solid rgba(255,255,255,0.1)', ...panelStyle }
          : { background: 'var(--surface-0)', borderLeft: '1px solid var(--border)' }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <History size={15} style={{ color: accent }} />
            <span className={cn('font-semibold text-sm', hasBackground ? 'text-white' : 'text-ink')}>Histórico do Dia</span>
          </div>
          <div className="flex items-center gap-1">
            {todaySales.length > 0 && (
              <button
                onClick={onExport}
                title="Exportar CSV"
                className={cn('p-1.5 rounded-lg transition-colors', hasBackground ? 'text-white/40 hover:text-white' : 'text-ink-subtle hover:text-ink')}
              >
                <Download size={14} />
              </button>
            )}
            <button onClick={onClose} className={cn('p-1.5 rounded-lg transition-colors', hasBackground ? 'text-white/40 hover:text-white' : 'text-ink-subtle hover:text-ink')}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="px-4 py-3 shrink-0 space-y-2"
          style={{ borderBottom: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)' }}
        >
          <div className={cn('flex justify-between text-xs', hasBackground ? 'text-white/50' : 'text-ink-muted')}>
            <span>Vendas hoje</span>
            <span className="font-mono font-bold" style={{ color: accent }}>{count}</span>
          </div>
          <div className={cn('flex justify-between text-sm font-bold', hasBackground ? 'text-white' : 'text-ink')}>
            <span>Total</span>
            <span className="font-mono" style={{ color: accent }}>{formatCurrency(total)}</span>
          </div>
          {Object.entries(byMethod).map(([method, val]) => (
            <div key={method} className={cn('flex justify-between text-xs', hasBackground ? 'text-white/40' : 'text-ink-subtle')}>
              <span>{methodLabel[method] ?? method}</span>
              <span className="font-mono">{formatCurrency(val ?? 0)}</span>
            </div>
          ))}
        </div>

        {/* Sales list */}
        <div className="flex-1 overflow-y-auto">
          {todaySales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <History size={28} className={hasBackground ? 'text-white/15' : 'text-ink-subtle opacity-20'} />
              <p className={cn('text-xs', hasBackground ? 'text-white/30' : 'text-ink-subtle')}>Nenhuma venda hoje</p>
            </div>
          ) : (
            <div className={cn('divide-y', hasBackground ? 'divide-white/5' : 'divide-border')}>
              {[...todaySales].reverse().map((sale) => (
                <div key={sale.id} className="px-4 py-3 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={cn('text-xs font-mono', hasBackground ? 'text-white/40' : 'text-ink-subtle')}>
                        {new Date(sale.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className={cn('text-xs', hasBackground ? 'text-white/50' : 'text-ink-muted')}>
                        {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'} · {methodLabel[sale.paymentMethod] ?? sale.paymentMethod}
                      </p>
                    </div>
                    <span className="text-sm font-mono font-bold" style={{ color: accent }}>
                      {formatCurrency(sale.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────
function ProductCard({
  product, cartItem, justAdded, onAdd, accent, cardStyle, buttonShape, compact, promoDiscount, liveStock,
}: {
  product: Product
  cartItem: CartItem | undefined
  justAdded: boolean
  onAdd: () => void
  accent: string
  cardStyle: string
  buttonShape: string
  compact: boolean
  promoDiscount?: number   // percentage from active promotion
  liveStock?: number       // from inventoryStore
}) {
  const stock = liveStock ?? product.stock
  const isLow = stock <= product.minStock && stock > 0
  const isOut = stock === 0
  const radius = buttonShape === 'sharp' ? 'rounded-none' : buttonShape === 'pill' ? 'rounded-2xl' : 'rounded-lg'
  const promoPrice = promoDiscount ? product.price * (1 - promoDiscount / 100) : null

  return (
    <button
      onClick={onAdd}
      disabled={isOut}
      className={cn(
        'relative flex flex-col gap-1 text-left transition-all duration-200 active:scale-95',
        compact ? 'p-2' : 'p-3',
        radius,
        isOut && 'opacity-40 pointer-events-none',
        cardStyle === 'default' && !justAdded && !cartItem && 'border border-[var(--border)] bg-[var(--surface-1)] hover:shadow-sm',
        cardStyle === 'glass'   && !justAdded && !cartItem && 'border border-white/10 bg-white/6 hover:bg-white/10 backdrop-blur-sm',
        cardStyle === 'solid'   && !justAdded && !cartItem && 'bg-black/40 hover:bg-black/55',
      )}
      style={{
        ...(justAdded || cartItem
          ? {
              background: `${accent}22`,
              border: `1px solid ${accent}66`,
              boxShadow: justAdded ? `0 0 0 2px ${accent}44` : undefined,
            }
          : {}),
      }}
    >
      {/* Promo badge */}
      {promoDiscount && (
        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1 py-0.5 rounded bg-yellow-400 text-black leading-none">
          -{promoDiscount}%
        </span>
      )}
      {cartItem && (
        <span
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: accent, color: '#fff' }}
        >
          {cartItem.quantity}
        </span>
      )}
      <p className={cn('font-semibold text-ink line-clamp-2 leading-tight pr-4', compact ? 'text-[10px]' : 'text-xs', promoDiscount && 'pt-3')}>
        {product.name}
      </p>
      <div className="flex items-baseline gap-1.5">
        <p className={cn('font-mono font-bold', compact ? 'text-xs' : 'text-sm')} style={{ color: accent }}>
          {formatCurrency(promoPrice ?? product.price)}
        </p>
        {promoPrice && (
          <span className="text-[10px] font-mono line-through text-ink-subtle">
            {formatCurrency(product.price)}
          </span>
        )}
      </div>
      {!compact && (
        <span className={cn('text-[10px] font-mono', isLow ? 'text-amber-400' : isOut ? 'text-red-400' : 'text-ink-subtle')}>
          {stock} {product.unit}
        </span>
      )}
    </button>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function PDVPage() {
  const config              = useTenantConfig()
  const { theme, setTheme } = usePDVThemeStore()
  const {
    cart,
    globalDiscount,
    paymentMethod,
    cashReceived,
    processingPayment,
    addToCart: storeAddToCart,
    addCustomItem,
    updateQty,
    updateItemDiscount,
    removeItem,
    clearCart: storeClearCart,
    setGlobalDiscount,
    setPaymentMethod,
    setCashReceived,
    setProcessingPayment,
  } = usePDVCartStore()

  const { addSale }                         = useSalesHistoryStore()
  const { shortcuts }                       = usePDVShortcutsStore()
  const { playAdd, playSuccess } = usePDVSounds()
  const { activePhone, setActivePhone, lookupCustomer, addPoints } = useLoyaltyStore()
  const { seed: seedInventory, deduct: deductStock, getStock } = useInventoryStore()
  const { getActiveForProduct } = usePromotionsStore()

  // Seed inventory from MOCK_PRODUCTS on mount
  useEffect(() => { seedInventory() }, [seedInventory])

  const [search, setSearch]                   = useState('')
  const [saleSuccess, setSaleSuccess]         = useState(false)
  const [saleTotal, setSaleTotal]             = useState(0)
  const [lastAdded, setLastAdded]             = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen]       = useState(false)
  const [avulsoOpen, setAvulsoOpen]           = useState(false)
  const [historyOpen, setHistoryOpen]         = useState(false)
  const [itemDiscountTarget, setItemDiscountTarget] = useState<string | null>(null)
  const [itemDiscountValue, setItemDiscountValue]   = useState('')
  const [cashCloseOpen, setCashCloseOpen]           = useState(false)
  const [receiptData, setReceiptData]               = useState<Parameters<typeof ThermalReceipt>[0] | null>(null)
  const [stockForecastOpen, setStockForecastOpen]   = useState(false)
  const [cardapioQROpen, setCardapioQROpen]         = useState(false)
  const [promotionsOpen, setPromotionsOpen]         = useState(false)
  const [loyaltyEarned, setLoyaltyEarned]           = useState<{ points: number; total: number } | null>(null)
  const [activeCategory, setActiveCategory]         = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const { listening: voiceListening, start: startVoice, stop: stopVoice, supported: voiceSupported } =
    useVoiceSearch((text) => setSearch(text))
  const loyaltyCustomer = activePhone ? lookupCustomer(activePhone) : undefined

  const accent = theme.accentOverride || config.branding.accentColor

  // ── Keyboard shortcuts ──────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') (e.target as HTMLElement).blur()
        return
      }
      const key = e.key
      if (key === shortcuts.focusSearch) {
        e.preventDefault(); searchRef.current?.focus()
      } else if (key === shortcuts.clearCart) {
        e.preventDefault(); if (cart.length > 0) storeClearCart()
      } else if (key === shortcuts.finalize) {
        e.preventDefault(); if (cart.length > 0 && !processingPayment) handlePayment()
      } else if (key === shortcuts.openAvulso) {
        e.preventDefault(); setAvulsoOpen((v) => !v)
      } else if (key === shortcuts.openHistory) {
        e.preventDefault(); setHistoryOpen((v) => !v)
      } else if (key === 'Escape') {
        setAvulsoOpen(false)
        setHistoryOpen(false)
        setSettingsOpen(false)
        setItemDiscountTarget(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, processingPayment, shortcuts])

  // ── Background CSS ──────────────────────────────────────────────
  let bgCss: string | undefined
  if (theme.backgroundPreset !== 'none') {
    if (theme.backgroundPreset === 'custom' && theme.backgroundImageUrl) {
      bgCss = undefined
    } else if (theme.backgroundPreset !== 'custom') {
      bgCss = SEGMENT_GRADIENTS[theme.backgroundPreset]?.gradient
    }
  }
  const hasBackground = theme.backgroundPreset !== 'none' &&
    (theme.backgroundPreset !== 'custom' || !!theme.backgroundImageUrl)

  // ── Products filter ─────────────────────────────────────────────
  const allCategories = Array.from(new Set(MOCK_PRODUCTS.filter(p => p.isActive).map(p => p.category))).sort()

  const filteredProducts = (() => {
    let base = MOCK_PRODUCTS.filter((p) => p.isActive)
    if (activeCategory) base = base.filter((p) => p.category === activeCategory)
    if (search.trim()) {
      base = base.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode === search ||
        p.sku.toLowerCase().includes(search.toLowerCase())
      )
    } else if (!activeCategory) {
      base = base.slice(0, theme.compactMode ? 20 : 12)
    }
    return base
  })()

  // ── Cart calculations ────────────────────────────────────────────
  const subtotal = cart.reduce((sum, item) => {
    const t = item.product.price * item.quantity
    return sum + (t - t * (item.discount / 100))
  }, 0)
  const discountAmount = subtotal * (globalDiscount / 100)
  const total = subtotal - discountAmount

  const addToCart = (product: Product) => {
    storeAddToCart(product)
    playAdd()
    setLastAdded(product.id)
    setTimeout(() => setLastAdded(null), 600)
  }

  const clearCart = () => {
    storeClearCart()
    searchRef.current?.focus()
  }

  const handlePayment = async () => {
    if (cart.length === 0) return
    setProcessingPayment(true)
    await new Promise((r) => setTimeout(r, 1200))
    setProcessingPayment(false)

    const cashVal = paymentMethod === 'cash' && cashReceived
      ? parseFloat(cashReceived.replace(',', '.'))
      : undefined
    const changeVal = cashVal !== undefined ? cashVal - total : undefined

    const ts = new Date().toISOString()
    addSale({
      items: cart,
      subtotal,
      globalDiscount,
      total,
      paymentMethod,
      cashReceived: cashVal,
      change: changeVal,
      isTraining: theme.trainingMode,
      timestamp: ts,
      pdvId: 'PDV-01',
    })

    // Deduct stock for each item sold (skip training mode)
    if (!theme.trainingMode) {
      for (const item of cart) {
        deductStock(item.product.id, item.quantity)
      }
    }

    setReceiptData({
      items: cart,
      subtotal,
      globalDiscount,
      total,
      paymentMethod,
      cashReceived: cashVal,
      change: changeVal,
      pdvId: 'PDV-01',
      isTraining: theme.trainingMode,
      storeName: 'Minha Loja',
      timestamp: ts,
      onClose: () => setReceiptData(null),
    })

    // Award loyalty points
    if (activePhone && !theme.trainingMode) {
      const customer = addPoints(activePhone, total)
      setLoyaltyEarned({ points: customer.points, total: Math.floor(total * POINTS_PER_REAL) })
    }

    playSuccess()
    setSaleTotal(total)
    setSaleSuccess(true)
  }

  // CSV export of today's sales
  const exportCSV = (sales: Parameters<typeof getTodaySales>[0]) => {
    const today = getTodaySales(sales)
    const rows = [
      ['ID', 'Hora', 'Itens', 'Subtotal', 'Desconto%', 'Total', 'Pagamento', 'Treinamento'].join(','),
      ...today.map((s) => [
        s.id,
        new Date(s.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        s.items.map((i) => `${i.quantity}x ${i.product.name}`).join(' | '),
        s.subtotal.toFixed(2),
        s.globalDiscount,
        s.total.toFixed(2),
        s.paymentMethod,
        s.isTraining ? 'sim' : 'não',
      ].join(',')),
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `vendas_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Item discount inline edit
  const commitItemDiscount = (productId: string) => {
    const val = parseFloat(itemDiscountValue)
    if (!isNaN(val)) updateItemDiscount(productId, val)
    setItemDiscountTarget(null)
    setItemDiscountValue('')
  }

  const change = paymentMethod === 'cash' && cashReceived
    ? parseFloat(cashReceived.replace(',', '.')) - total
    : null

  // ── Panel style for glass/solid modes ──────────────────────────
  const panelStyle = hasBackground ? {
    glass: { background: 'rgba(12,10,9,0.60)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)' },
    solid: { background: 'rgba(12,10,9,0.80)' },
    default: {},
  }[theme.cardStyle] : {}

  const btnRadius = shapeClass(theme.buttonShape)

  return (
    <div className="h-full flex flex-col gap-0 -m-6 animate-fade-up relative overflow-hidden">

      {/* ── Background layer ─────────────────── */}
      {hasBackground && (
        <div className="absolute inset-0 z-0">
          {theme.backgroundPreset === 'custom' && theme.backgroundImageUrl
            ? (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${theme.backgroundImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )
            : (
              <div className="absolute inset-0" style={{ background: bgCss }} />
            )
          }
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${theme.backgroundOverlay / 100})` }} />
        </div>
      )}

      {/* ── Training mode banner ──────────────── */}
      {theme.trainingMode && (
        <div className="relative z-20 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold bg-amber-500/20 border-b border-amber-500/40 text-amber-300">
          <FlaskConical size={13} />
          MODO TREINAMENTO — As vendas não serão contabilizadas
        </div>
      )}

      {/* ── Success overlay ───────────────────── */}
      {saleSuccess && (
        <SaleSuccessOverlay
          total={saleTotal}
          accent={accent}
          onClose={() => { setSaleSuccess(false); clearCart(); setLoyaltyEarned(null) }}
          onPrint={() => { /* receipt is already rendered below */ setSaleSuccess(false); clearCart() }}
        />
      )}

      {/* ── Thermal receipt ───────────────────── */}
      {receiptData && <ThermalReceipt {...receiptData} />}

      {/* ── Promotions modal ─────────────────── */}
      {promotionsOpen && (
        <PromotionsModal accent={accent} onClose={() => setPromotionsOpen(false)} />
      )}

      {/* ── Stock forecast modal ──────────────── */}
      {stockForecastOpen && (
        <StockForecastModal
          accent={accent}
          onClose={() => setStockForecastOpen(false)}
        />
      )}

      {/* ── Cardápio QR modal ─────────────────── */}
      {cardapioQROpen && (
        <CardapioQRModal onClose={() => setCardapioQROpen(false)} />
      )}

      {/* ── Settings panel ────────────────────── */}
      <PDVSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        tenantAccent={config.branding.accentColor}
        segment={config.segment}
      />

      {/* ── Avulso modal ──────────────────────── */}
      <AvulsoModal
        open={avulsoOpen}
        onClose={() => setAvulsoOpen(false)}
        onAdd={(name, price, qty) => {
          addCustomItem(name, price, qty)
          playAdd()
        }}
        accent={accent}
        btnRadius={btnRadius}
        hasBackground={hasBackground}
      />

      {/* ── Cash close modal ─────────────────── */}
      <CashCloseModal
        open={cashCloseOpen}
        onClose={() => setCashCloseOpen(false)}
        accent={accent}
        hasBackground={hasBackground}
      />

      {/* ── History panel ─────────────────────── */}
      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onExport={() => exportCSV(useSalesHistoryStore.getState().sales)}
        accent={accent}
        hasBackground={hasBackground}
        panelStyle={panelStyle}
      />

      {/* ── PDV Header ───────────────────────── */}
      <div
        className="relative z-10 flex items-center gap-4 px-6 py-3 shrink-0"
        style={hasBackground
          ? { background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }
          : { background: 'var(--surface-0)', borderBottom: '1px solid var(--border)' }
        }
      >
        <ShoppingCart size={18} style={{ color: accent }} />
        <h1 className={cn('font-bold', hasBackground ? 'text-white' : 'text-ink')}>
          PDV — Ponto de Venda
        </h1>

        {/* Mode toggle */}
        <div
          className={cn('flex rounded-lg overflow-hidden border text-xs font-medium', hasBackground ? 'border-white/15' : 'border-border')}
        >
          {([
            { mode: 'caixa',   label: 'Caixa',   Icon: ShoppingBag },
            { mode: 'comanda', label: 'Comanda',  Icon: UtensilsCrossed },
          ] as const).map(({ mode, label, Icon }) => (
            <button
              key={mode}
              onClick={() => setTheme({ pdvMode: mode })}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 transition-colors',
                theme.pdvMode === mode
                  ? 'text-white'
                  : hasBackground ? 'text-white/40 hover:text-white/70' : 'text-ink-muted hover:text-ink',
              )}
              style={theme.pdvMode === mode ? { background: accent } : undefined}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="success">PDV-01 Online</Badge>
          <span className={cn('text-xs font-mono', hasBackground ? 'text-white/50' : 'text-ink-subtle')}>
            {new Date().toLocaleTimeString('pt-BR')}
          </span>
          <button
            onClick={() => setHistoryOpen(true)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              hasBackground
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-ink-subtle hover:text-ink hover:bg-surface-2',
            )}
            title="Histórico do dia"
          >
            <History size={15} />
          </button>
          <button
            onClick={() => setCashCloseOpen(true)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              hasBackground
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-ink-subtle hover:text-ink hover:bg-surface-2',
            )}
            title="Fechamento de caixa"
          >
            <Lock size={15} />
          </button>
          <button
            onClick={() => setPromotionsOpen(true)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              hasBackground
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-ink-subtle hover:text-ink hover:bg-surface-2',
            )}
            title="Promoções relâmpago"
          >
            <Sparkles size={15} />
          </button>
          <button
            onClick={() => setStockForecastOpen(true)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              hasBackground
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-ink-subtle hover:text-ink hover:bg-surface-2',
            )}
            title="Previsão de estoque"
          >
            <TrendingDown size={15} />
          </button>
          <button
            onClick={() => setCardapioQROpen(true)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              hasBackground
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-ink-subtle hover:text-ink hover:bg-surface-2',
            )}
            title="QR Code do cardápio"
          >
            <QrCode size={15} />
          </button>
          <button
            onClick={() => window.open('/display', '_blank', 'noopener')}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              hasBackground
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-ink-subtle hover:text-ink hover:bg-surface-2',
            )}
            title="Tela do Cliente"
          >
            <Monitor size={15} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              hasBackground
                ? 'text-white/40 hover:text-white hover:bg-white/10'
                : 'text-ink-subtle hover:text-ink hover:bg-surface-2',
            )}
            title="Personalizar PDV"
          >
            <Settings2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────── */}
      <div className="relative z-10 flex flex-1 overflow-hidden">

        {/* Comanda mode */}
        {theme.pdvMode === 'comanda' && (
          <ComandaMode
            accent={accent}
            hasBackground={hasBackground}
            panelStyle={panelStyle}
            cardStyle={theme.cardStyle}
            buttonShape={theme.buttonShape}
            compact={theme.compactMode}
          />
        )}

        {/* Product grid (caixa mode) */}
        {theme.pdvMode === 'caixa' && (
        <>
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            borderRight: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)',
            ...panelStyle,
          }}
        >
          {/* Search bar + Avulso */}
          <div
            className="p-4 shrink-0 flex gap-2"
            style={{ borderBottom: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)' }}
          >
            <div className="flex-1">
              <Input
                ref={searchRef}
                placeholder="Buscar produto, código de barras ou SKU... (F2)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                iconLeft={<Search size={14} />}
                autoFocus
                className={hasBackground ? 'bg-white/8 border-white/12 text-white placeholder:text-white/30 focus:border-white/30' : ''}
              />
            </div>
            {voiceSupported && (
              <button
                onClick={() => voiceListening ? stopVoice() : startVoice()}
                title="Busca por voz"
                className={cn(
                  'flex items-center justify-center w-10 h-10 border transition-all shrink-0',
                  btnRadius,
                  voiceListening
                    ? 'border-red-500 text-red-400 bg-red-500/15 animate-pulse'
                    : hasBackground
                      ? 'border-white/15 text-white/60 hover:bg-white/10 hover:text-white'
                      : 'border-border text-ink-muted hover:bg-surface-2 hover:text-ink',
                )}
              >
                {voiceListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            )}
            <button
              onClick={() => setAvulsoOpen(true)}
              title="Item avulso"
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border transition-colors shrink-0',
                btnRadius,
                hasBackground
                  ? 'border-white/15 text-white/60 hover:bg-white/10 hover:text-white'
                  : 'border-border text-ink-muted hover:bg-surface-2 hover:text-ink',
              )}
            >
              <Zap size={13} />
              Avulso
            </button>
          </div>

          {/* Category filter chips */}
          <div
            className="flex items-center gap-1.5 px-4 py-2 shrink-0 overflow-x-auto scrollbar-none"
            style={{ borderBottom: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)' }}
          >
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all shrink-0',
                !activeCategory
                  ? 'text-white'
                  : hasBackground
                    ? 'text-white/50 hover:text-white bg-white/8 border border-white/10'
                    : 'text-ink-muted hover:text-ink bg-surface-1 border border-border',
              )}
              style={!activeCategory ? { background: accent } : undefined}
            >
              Todos
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all shrink-0',
                  activeCategory === cat
                    ? 'text-white'
                    : hasBackground
                      ? 'text-white/50 hover:text-white bg-white/8 border border-white/10'
                      : 'text-ink-muted hover:text-ink bg-surface-1 border border-border',
                )}
                style={activeCategory === cat ? { background: accent } : undefined}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className={cn(
              'grid gap-2',
              theme.compactMode
                ? 'grid-cols-3 sm:grid-cols-4 xl:grid-cols-5'
                : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4',
            )}>
              {filteredProducts.map((product) => {
                const promo = getActiveForProduct(product.id, product.category)
                return (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartItem={cart.find((i) => i.product.id === product.id)}
                  justAdded={lastAdded === product.id}
                  onAdd={() => addToCart(product)}
                  accent={accent}
                  cardStyle={theme.cardStyle}
                  buttonShape={theme.buttonShape}
                  compact={theme.compactMode}
                  promoDiscount={promo?.discount}
                  liveStock={getStock(product.id)}
                />
                )
              })}
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div
            className="px-4 py-1.5 shrink-0 flex gap-4 flex-wrap"
            style={{ borderTop: hasBackground ? '1px solid rgba(255,255,255,0.05)' : '1px solid var(--border)' }}
          >
            {([
              [shortcuts.focusSearch, 'Buscar'],
              [shortcuts.openAvulso, 'Avulso'],
              [shortcuts.clearCart, 'Limpar'],
              [shortcuts.finalize, 'Pagar'],
              ['Esc', 'Fechar'],
            ] as [string, string][]).map(([key, label]) => (
              <span key={key} className={cn('flex items-center gap-1 text-[10px]', hasBackground ? 'text-white/20' : 'text-ink-subtle opacity-50')}>
                <kbd className={cn(
                  'px-1 py-0.5 rounded text-[9px] font-mono font-bold border',
                  hasBackground ? 'border-white/20 bg-white/8' : 'border-border bg-surface-2',
                )}>{key}</kbd>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Cart & payment */}
        <div
          className="w-80 flex flex-col shrink-0"
          style={panelStyle}
        >
          {/* Cart header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={15} className={hasBackground ? 'text-white/50' : 'text-ink-muted'} />
              <span className={cn('text-sm font-semibold', hasBackground ? 'text-white' : 'text-ink')}>Carrinho</span>
              {cart.length > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: accent }}
                >
                  {cart.length}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className={cn('p-1 rounded transition-colors', hasBackground ? 'text-white/30 hover:text-red-400' : 'text-ink-subtle hover:text-red-500')} title="Limpar carrinho (F5)">
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <ShoppingCart size={32} className={hasBackground ? 'text-white/15' : 'text-ink-subtle opacity-20'} />
                <p className={cn('text-xs', hasBackground ? 'text-white/30' : 'text-ink-subtle')}>Adicione produtos ao carrinho</p>
              </div>
            ) : (
              <div className={cn('divide-y', hasBackground ? 'divide-white/6' : 'divide-border')}>
                {cart.map((item) => (
                  <div key={item.product.id} className="px-4 py-2.5 flex gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-medium truncate', hasBackground ? 'text-white/80' : 'text-ink')}>{item.product.name}</p>
                      <p className={cn('text-[10px] font-mono', hasBackground ? 'text-white/35' : 'text-ink-subtle')}>{formatCurrency(item.product.price)} / un</p>
                      {/* Per-item discount */}
                      {itemDiscountTarget === item.product.id ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number"
                            min={0}
                            max={99}
                            value={itemDiscountValue}
                            onChange={(e) => setItemDiscountValue(e.target.value)}
                            onBlur={() => commitItemDiscount(item.product.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitItemDiscount(item.product.id)
                              if (e.key === 'Escape') { setItemDiscountTarget(null); setItemDiscountValue('') }
                            }}
                            className={cn(
                              'w-14 text-xs font-mono px-1.5 py-0.5 rounded border focus:outline-none',
                              hasBackground
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-surface-1 border-border text-ink',
                            )}
                            autoFocus
                            placeholder="0"
                          />
                          <span className={cn('text-[10px]', hasBackground ? 'text-white/40' : 'text-ink-subtle')}>%</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setItemDiscountTarget(item.product.id)
                            setItemDiscountValue(String(item.discount))
                          }}
                          className={cn(
                            'flex items-center gap-0.5 mt-0.5 text-[10px] transition-colors',
                            item.discount > 0
                              ? 'text-amber-400'
                              : hasBackground ? 'text-white/20 hover:text-white/40' : 'text-ink-subtle opacity-50 hover:opacity-100',
                          )}
                        >
                          <Tag size={9} />
                          {item.discount > 0 ? `${item.discount}% desc.` : 'desconto'}
                          <ChevronRight size={9} />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1">
                        {[
                          { delta: -1, icon: <Minus size={10} /> },
                          null,
                          { delta: 1,  icon: <Plus size={10} /> },
                        ].map((btn, idx) =>
                          btn === null ? (
                            <span key="qty" className={cn('w-6 text-center text-xs font-mono font-bold', hasBackground ? 'text-white' : 'text-ink')}>{item.quantity}</span>
                          ) : (
                            <button
                              key={idx}
                              onClick={() => updateQty(item.product.id, btn.delta)}
                              className={cn('w-5 h-5 rounded flex items-center justify-center transition-colors', hasBackground ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-surface-2 text-ink hover:bg-surface-3')}
                            >
                              {btn.icon}
                            </button>
                          ),
                        )}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className={cn('w-5 h-5 rounded flex items-center justify-center transition-colors ml-1', hasBackground ? 'text-white/25 hover:text-red-400' : 'text-ink-subtle hover:text-red-500')}
                        >
                          <X size={10} />
                        </button>
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: accent }}>
                        {item.discount > 0
                          ? formatCurrency(item.product.price * item.quantity * (1 - item.discount / 100))
                          : formatCurrency(item.product.price * item.quantity)
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary + Payment */}
          <div
            className="p-4 space-y-4 shrink-0"
            style={{ borderTop: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)' }}
          >
            {/* Loyalty */}
            <div className={cn('rounded-xl p-3 space-y-2', hasBackground ? 'bg-white/5 border border-white/8' : 'bg-surface-1 border border-border')}>
              <div className="flex items-center gap-1.5">
                <Gift size={11} style={{ color: accent }} />
                <span className={cn('text-[10px] font-semibold', hasBackground ? 'text-white/60' : 'text-ink-muted')}>
                  Fidelidade
                </span>
                {loyaltyCustomer && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] font-mono font-bold" style={{ color: accent }}>
                    <Star size={9} />
                    {loyaltyCustomer.points} pts
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="tel"
                  placeholder="Telefone do cliente"
                  value={activePhone}
                  onChange={(e) => setActivePhone(e.target.value)}
                  className={cn(
                    'flex-1 h-8 px-2 text-[11px] rounded-lg border outline-none',
                    hasBackground
                      ? 'bg-white/8 border-white/12 text-white placeholder:text-white/25 focus:border-white/30'
                      : 'bg-surface-0 border-border text-ink focus:border-accent',
                  )}
                />
              </div>
              {loyaltyCustomer && (
                <div className={cn('text-[10px] space-y-0.5', hasBackground ? 'text-white/40' : 'text-ink-subtle')}>
                  <p>{loyaltyCustomer.name ?? loyaltyCustomer.phone} · {loyaltyCustomer.visits} visita{loyaltyCustomer.visits !== 1 ? 's' : ''}</p>
                  <p>
                    Esta compra gera <span style={{ color: accent }} className="font-bold">+{Math.floor(total * POINTS_PER_REAL)} pts</span>
                    {loyaltyCustomer.points >= POINTS_TO_DISCOUNT && (
                      <span className="ml-1 text-emerald-400">· {Math.floor(loyaltyCustomer.points / POINTS_TO_DISCOUNT) * DISCOUNT_PER_100_POINTS} créditos disponíveis</span>
                    )}
                  </p>
                </div>
              )}
              {loyaltyEarned && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold animate-fade-up">
                  <CheckCircle2 size={10} />
                  +{loyaltyEarned.total} pontos adicionados!
                </div>
              )}
            </div>

            {/* Global discount */}
            <div className="flex items-center gap-2">
              <Tag size={13} className={hasBackground ? 'text-white/30' : 'text-ink-subtle'} />
              <span className={cn('text-xs flex-1', hasBackground ? 'text-white/50' : 'text-ink-muted')}>Desconto global</span>
              <div className="flex items-center gap-1">
                {[-5, null, 5].map((delta, idx) =>
                  delta === null ? (
                    <span key="val" className={cn('text-xs font-mono font-bold w-8 text-center', hasBackground ? 'text-white' : 'text-ink')}>{globalDiscount}%</span>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => setGlobalDiscount(Math.min(50, Math.max(0, globalDiscount + delta)))}
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
              <div className={cn('flex justify-between', hasBackground ? 'text-white/50' : 'text-ink-muted')}>
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {globalDiscount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Desconto ({globalDiscount}%)</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div
                className="flex justify-between font-bold text-lg pt-1 mt-1"
                style={{ borderTop: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)' }}
              >
                <span className={hasBackground ? 'text-white' : 'text-ink'}>Total</span>
                <span className="font-mono" style={{ color: accent }}>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-2 gap-1.5">
              {PAYMENT_METHODS.map((pm) => {
                const active = paymentMethod === pm.id
                return (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium transition-all border',
                      btnRadius,
                    )}
                    style={active
                      ? { background: accent, color: '#fff', border: `1px solid ${accent}` }
                      : hasBackground
                        ? { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.10)' }
                        : undefined
                    }
                  >
                    {pm.icon}
                    {pm.label}
                  </button>
                )
              })}
            </div>

            {/* PIX QR Code */}
            {paymentMethod === 'pix' && total > 0 && (
              <div className="flex justify-center py-2">
                <PixQRCode total={total} size={160} />
              </div>
            )}

            {/* Cash received */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <div className={cn(
                  'flex items-center gap-2 px-3 h-10 rounded-lg border',
                  hasBackground ? 'bg-white/8 border-white/12' : 'bg-surface-1 border-border',
                )}>
                  <span className={cn('text-xs shrink-0', hasBackground ? 'text-white/40' : 'text-ink-subtle')}>R$</span>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className={cn('flex-1 bg-transparent text-sm font-mono focus:outline-none', hasBackground ? 'text-white placeholder:text-white/25' : 'text-ink')}
                  />
                </div>
                <VirtualNumpad
                  value={cashReceived || '0'}
                  onChange={setCashReceived}
                  hasBackground={hasBackground}
                  btnRadius={btnRadius}
                />
                {change !== null && change >= 0 && (
                  <div className="flex justify-between text-sm pt-1">
                    <span className={hasBackground ? 'text-white/50' : 'text-ink-muted'}>Troco</span>
                    <span className="font-mono font-bold text-emerald-400">{formatCurrency(change)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Checkout button */}
            <button
              onClick={handlePayment}
              disabled={cart.length === 0 || processingPayment}
              className={cn(
                'w-full py-3 text-sm font-semibold text-white transition-all active:scale-[0.98]',
                btnRadius,
                'disabled:opacity-40 disabled:pointer-events-none',
              )}
              style={{ background: cart.length === 0 ? 'rgba(255,255,255,0.1)' : accent }}
              title="Finalizar venda (F10)"
            >
              {processingPayment ? 'Processando...' : `Finalizar — ${formatCurrency(total)}`}
            </button>

            {/* Training mode indicator */}
            {theme.trainingMode && (
              <p className="text-center text-[10px] text-amber-400/70 flex items-center justify-center gap-1">
                <FlaskConical size={10} /> Venda de treino — não registrada
              </p>
            )}
          </div>
        </div>
        </>
        )}

      </div>
    </div>
  )
}
