import { useState, useRef, useEffect } from 'react'
import {
  Search, Plus, Minus, Trash2, CreditCard, Banknote,
  Smartphone, CheckCircle2, ShoppingCart, X, Tag,
} from 'lucide-react'
import { MOCK_PRODUCTS } from '@/mock/configs'
import { formatCurrency } from '@/shared/utils/formatters'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Badge } from '@/shared/components/Badge'
import { cn } from '@/shared/utils/cn'
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

// Completed sale animation overlay
function SaleSuccessOverlay({ total, onClose }: { total: number; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-up">
      <div className="bg-surface-0 border border-border rounded-2xl p-10 text-center space-y-4 animate-bounce-in shadow-2xl">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 size={44} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-ink">Venda Concluída!</h2>
          <p className="text-3xl font-mono font-bold text-[var(--accent)] mt-2">{formatCurrency(total)}</p>
        </div>
        <p className="text-sm text-ink-muted">Clique para nova venda</p>
        <Button variant="primary" onClick={onClose}>Nova Venda</Button>
      </div>
    </div>
  )
}

export default function PDVPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [cashReceived, setCashReceived] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [saleSuccess, setSaleSuccess] = useState(false)
  const [saleTotal, setSaleTotal] = useState(0)
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filteredProducts = search.trim()
    ? MOCK_PRODUCTS.filter(
        (p) =>
          p.isActive &&
          (p.name.toLowerCase().includes(search.toLowerCase()) ||
           p.barcode === search ||
           p.sku.toLowerCase().includes(search.toLowerCase()))
      )
    : MOCK_PRODUCTS.filter((p) => p.isActive).slice(0, 12)

  const subtotal = cart.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity
    const itemDiscount = itemTotal * (item.discount / 100)
    return sum + (itemTotal - itemDiscount)
  }, 0)

  const discountAmount = subtotal * (globalDiscount / 100)
  const total = subtotal - discountAmount

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, quantity: 1, discount: 0 }]
    })
    setLastAdded(product.id)
    setTimeout(() => setLastAdded(null), 600)
  }

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }

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

  return (
    <div className="h-full flex flex-col gap-0 -m-6 animate-fade-up">
      {saleSuccess && (
        <SaleSuccessOverlay total={saleTotal} onClose={() => { setSaleSuccess(false); clearCart() }} />
      )}

      {/* PDV Header */}
      <div className="flex items-center gap-4 px-6 py-3 bg-surface-0 border-b border-border shrink-0">
        <ShoppingCart size={18} className="text-[var(--accent)]" />
        <h1 className="font-bold text-ink">PDV — Ponto de Venda</h1>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="success">PDV-01 Online</Badge>
          <span className="text-xs text-ink-subtle font-mono">
            {new Date().toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Product grid */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
          {/* Search */}
          <div className="p-4 border-b border-border">
            <Input
              ref={searchRef}
              placeholder="Buscar produto, código de barras ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              iconLeft={<Search size={14} />}
              autoFocus
            />
          </div>

          {/* Products */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((i) => i.product.id === product.id)
                const isLow = product.stock <= product.minStock
                const justAdded = lastAdded === product.id
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className={cn(
                      'relative flex flex-col gap-1 p-3 text-left rounded-lg border transition-all duration-200',
                      'hover:border-[var(--accent)] hover:shadow-sm active:scale-95',
                      justAdded && 'border-[var(--accent)] bg-[var(--accent-dim)] scale-[1.02]',
                      cartItem
                        ? 'border-[var(--accent)]/50 bg-[var(--accent-dim)]'
                        : 'border-border bg-surface-1',
                      product.stock === 0 && 'opacity-40 pointer-events-none'
                    )}
                  >
                    {cartItem && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-[10px] font-bold flex items-center justify-center">
                        {cartItem.quantity}
                      </span>
                    )}
                    <p className="text-xs font-semibold text-ink line-clamp-2 leading-tight pr-4">
                      {product.name}
                    </p>
                    <p className="text-sm font-mono font-bold text-[var(--accent)]">
                      {formatCurrency(product.price)}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className={cn('text-[10px] font-mono', isLow ? 'text-amber-500' : 'text-ink-subtle')}>
                        {product.stock} {product.unit}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Cart & payment */}
        <div className="w-80 flex flex-col bg-surface-0 shrink-0">
          {/* Cart header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingCart size={15} className="text-ink-muted" />
              <span className="text-sm font-semibold text-ink">Carrinho</span>
              {cart.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-[10px] font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="p-1 rounded text-ink-subtle hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-ink-subtle">
                <ShoppingCart size={32} className="opacity-20" />
                <p className="text-xs">Adicione produtos ao carrinho</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {cart.map((item) => (
                  <div key={item.product.id} className="px-4 py-3 flex gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{item.product.name}</p>
                      <p className="text-[10px] text-ink-subtle font-mono">{formatCurrency(item.product.price)} / un</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.product.id, -1)}
                          className="w-5 h-5 rounded flex items-center justify-center bg-surface-2 text-ink hover:bg-surface-3 transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-ink">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.product.id, 1)}
                          className="w-5 h-5 rounded flex items-center justify-center bg-surface-2 text-ink hover:bg-surface-3 transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="w-5 h-5 rounded flex items-center justify-center text-ink-subtle hover:text-red-500 transition-colors ml-1"
                        >
                          <X size={10} />
                        </button>
                      </div>
                      <span className="text-xs font-mono font-bold text-[var(--accent)]">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary + Payment */}
          <div className="border-t border-border p-4 space-y-4">
            {/* Discount */}
            <div className="flex items-center gap-2">
              <Tag size={13} className="text-ink-subtle shrink-0" />
              <span className="text-xs text-ink-muted flex-1">Desconto global</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setGlobalDiscount(Math.max(0, globalDiscount - 5))}
                  className="w-6 h-6 rounded bg-surface-2 flex items-center justify-center text-ink hover:bg-surface-3 text-xs"
                >-</button>
                <span className="text-xs font-mono font-bold text-ink w-8 text-center">{globalDiscount}%</span>
                <button
                  onClick={() => setGlobalDiscount(Math.min(50, globalDiscount + 5))}
                  className="w-6 h-6 rounded bg-surface-2 flex items-center justify-center text-ink hover:bg-surface-3 text-xs"
                >+</button>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {globalDiscount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Desconto ({globalDiscount}%)</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-ink text-lg pt-1 border-t border-border mt-1">
                <span>Total</span>
                <span className="font-mono text-[var(--accent)]">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-2 gap-1.5">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all border',
                    paymentMethod === pm.id
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)] shadow-sm'
                      : 'bg-surface-1 text-ink-muted border-border hover:border-[var(--accent)]/50'
                  )}
                >
                  {pm.icon}
                  {pm.label}
                </button>
              ))}
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
                />
                {change !== null && change >= 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-ink-muted">Troco</span>
                    <span className="font-mono font-bold text-emerald-500">{formatCurrency(change)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Checkout */}
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={cart.length === 0}
              loading={processingPayment}
            >
              {processingPayment ? 'Processando...' : `Finalizar — ${formatCurrency(total)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
