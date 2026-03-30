import { useState, useRef, useEffect } from 'react'
import {
  Search, Plus, Minus, Trash2, CreditCard, Banknote,
  Smartphone, CheckCircle2, ShoppingCart, X, Tag, Settings2,
} from 'lucide-react'
import { MOCK_PRODUCTS } from '@/mock/configs'
import { formatCurrency } from '@/shared/utils/formatters'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Badge } from '@/shared/components/Badge'
import { cn } from '@/shared/utils/cn'
import { useTenantConfig } from '@/shared/hooks/useTenantConfig'
import { usePDVThemeStore, SEGMENT_GRADIENTS } from '../store/pdvTheme'
import { PDVSettingsPanel } from '../components/PDVSettingsPanel'
import type { Product, PaymentMethod } from '@/shared/types'

interface CartItem {
  product: Product
  quantity: number
  discount: number
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
function SaleSuccessOverlay({ total, onClose, accent }: { total: number; onClose: () => void; accent: string }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
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
        <p className="text-sm text-ink-muted">Clique para nova venda</p>
        <Button variant="primary" onClick={onClose}>Nova Venda</Button>
      </div>
    </div>
  )
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────
function ProductCard({
  product, cartItem, justAdded, onAdd, accent, cardStyle, buttonShape, compact,
}: {
  product: Product
  cartItem: CartItem | undefined
  justAdded: boolean
  onAdd: () => void
  accent: string
  cardStyle: string
  buttonShape: string
  compact: boolean
}) {
  const isLow = product.stock <= product.minStock
  const radius = buttonShape === 'sharp' ? 'rounded-none' : buttonShape === 'pill' ? 'rounded-2xl' : 'rounded-lg'

  return (
    <button
      onClick={onAdd}
      disabled={product.stock === 0}
      className={cn(
        'relative flex flex-col gap-1 text-left transition-all duration-200 active:scale-95',
        compact ? 'p-2' : 'p-3',
        radius,
        product.stock === 0 && 'opacity-40 pointer-events-none',
        // Card style
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
      {cartItem && (
        <span
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: accent, color: '#fff' }}
        >
          {cartItem.quantity}
        </span>
      )}
      <p className={cn('font-semibold text-ink line-clamp-2 leading-tight pr-4', compact ? 'text-[10px]' : 'text-xs')}>
        {product.name}
      </p>
      <p className={cn('font-mono font-bold', compact ? 'text-xs' : 'text-sm')} style={{ color: accent }}>
        {formatCurrency(product.price)}
      </p>
      {!compact && (
        <span className={cn('text-[10px] font-mono', isLow ? 'text-amber-400' : 'text-ink-subtle')}>
          {product.stock} {product.unit}
        </span>
      )}
    </button>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function PDVPage() {
  const config      = useTenantConfig()
  const { theme }   = usePDVThemeStore()

  const [cart, setCart]                   = useState<CartItem[]>([])
  const [search, setSearch]               = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [cashReceived, setCashReceived]   = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [saleSuccess, setSaleSuccess]     = useState(false)
  const [saleTotal, setSaleTotal]         = useState(0)
  const [lastAdded, setLastAdded]         = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen]   = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const accent = theme.accentOverride || config.branding.accentColor

  // ── Background CSS ──────────────────────────────────────────────
  let bgCss: string | undefined
  if (theme.backgroundPreset !== 'none') {
    if (theme.backgroundPreset === 'custom' && theme.backgroundImageUrl) {
      bgCss = undefined // handled separately as background-image
    } else if (theme.backgroundPreset !== 'custom') {
      bgCss = SEGMENT_GRADIENTS[theme.backgroundPreset]?.gradient
    }
  }
  const hasBackground = theme.backgroundPreset !== 'none' &&
    (theme.backgroundPreset !== 'custom' || !!theme.backgroundImageUrl)

  // ── Products filter ─────────────────────────────────────────────
  const filteredProducts = search.trim()
    ? MOCK_PRODUCTS.filter(
        (p) => p.isActive && (
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.barcode === search ||
          p.sku.toLowerCase().includes(search.toLowerCase())
        ),
      )
    : MOCK_PRODUCTS.filter((p) => p.isActive).slice(0, theme.compactMode ? 20 : 12)

  // ── Cart calculations ────────────────────────────────────────────
  const subtotal = cart.reduce((sum, item) => {
    const t = item.product.price * item.quantity
    return sum + (t - t * (item.discount / 100))
  }, 0)
  const discountAmount = subtotal * (globalDiscount / 100)
  const total = subtotal - discountAmount

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1, discount: 0 }]
    })
    setLastAdded(product.id)
    setTimeout(() => setLastAdded(null), 600)
  }

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
          .filter((i) => i.quantity > 0),
    )
  }

  const removeItem = (productId: string) => setCart((prev) => prev.filter((i) => i.product.id !== productId))

  const clearCart = () => {
    setCart([])
    setGlobalDiscount(0)
    setCashReceived('')
    searchRef.current?.focus()
  }

  const handlePayment = async () => {
    if (cart.length === 0) return
    setProcessingPayment(true)
    await new Promise((r) => setTimeout(r, 1200))
    setProcessingPayment(false)
    setSaleTotal(total)
    setSaleSuccess(true)
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
          {/* Overlay */}
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${theme.backgroundOverlay / 100})` }} />
        </div>
      )}

      {/* ── Success overlay ───────────────────── */}
      {saleSuccess && (
        <SaleSuccessOverlay
          total={saleTotal}
          accent={accent}
          onClose={() => { setSaleSuccess(false); clearCart() }}
        />
      )}

      {/* ── Settings panel ────────────────────── */}
      <PDVSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        tenantAccent={config.branding.accentColor}
        segment={config.segment}
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
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="success">PDV-01 Online</Badge>
          <span className={cn('text-xs font-mono', hasBackground ? 'text-white/50' : 'text-ink-subtle')}>
            {new Date().toLocaleTimeString('pt-BR')}
          </span>
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

        {/* Product grid */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            borderRight: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)',
            ...panelStyle,
          }}
        >
          {/* Search bar */}
          <div
            className="p-4 shrink-0"
            style={{ borderBottom: hasBackground ? '1px solid rgba(255,255,255,0.07)' : '1px solid var(--border)' }}
          >
            <Input
              ref={searchRef}
              placeholder="Buscar produto, código de barras ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconLeft={<Search size={14} />}
              autoFocus
              className={hasBackground ? 'bg-white/8 border-white/12 text-white placeholder:text-white/30 focus:border-white/30' : ''}
            />
          </div>

          {/* Products grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className={cn(
              'grid gap-2',
              theme.compactMode
                ? 'grid-cols-3 sm:grid-cols-4 xl:grid-cols-5'
                : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4',
            )}>
              {filteredProducts.map((product) => (
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
                />
              ))}
            </div>
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
              <button onClick={clearCart} className={cn('p-1 rounded transition-colors', hasBackground ? 'text-white/30 hover:text-red-400' : 'text-ink-subtle hover:text-red-500')}>
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
                  <div key={item.product.id} className="px-4 py-3 flex gap-3">
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-medium truncate', hasBackground ? 'text-white/80' : 'text-ink')}>{item.product.name}</p>
                      <p className={cn('text-[10px] font-mono', hasBackground ? 'text-white/35' : 'text-ink-subtle')}>{formatCurrency(item.product.price)} / un</p>
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
                        {formatCurrency(item.product.price * item.quantity)}
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
                      onClick={() => setGlobalDiscount((v) => Math.min(50, Math.max(0, v + delta)))}
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

            {/* Cash received */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Input
                  label="Valor recebido"
                  type="number"
                  placeholder="0,00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className={hasBackground ? 'bg-white/8 border-white/12 text-white placeholder:text-white/30' : ''}
                />
                {change !== null && change >= 0 && (
                  <div className="flex justify-between text-sm">
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
            >
              {processingPayment ? 'Processando...' : `Finalizar — ${formatCurrency(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
