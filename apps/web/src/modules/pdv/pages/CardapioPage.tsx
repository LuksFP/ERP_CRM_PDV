/**
 * Public digital menu page — accessible at /cardapio
 * No auth required. Customers can scan a QR code to browse the menu.
 */
import { useState } from 'react'
import { Search, ShoppingCart, Tag, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/formatters'
import { MOCK_PRODUCTS } from '@/mock/configs'
import type { Product } from '@/shared/types'

// Group products by category
function groupByCategory(products: Product[]) {
  const map = new Map<string, Product[]>()
  for (const p of products) {
    if (!map.has(p.category)) map.set(p.category, [])
    map.get(p.category)!.push(p)
  }
  return map
}

export default function CardapioPage() {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Map<string, number>>(new Map())
  const [showCart, setShowCart] = useState(false)

  const active = MOCK_PRODUCTS.filter((p) => p.isActive && p.stock > 0)
  const filtered = search.trim()
    ? active.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()),
      )
    : active
  const grouped = groupByCategory(filtered)

  const cartTotal = Array.from(cart.entries()).reduce((s, [id, qty]) => {
    const p = active.find((x) => x.id === id)
    return s + (p ? p.price * qty : 0)
  }, 0)
  const cartCount = Array.from(cart.values()).reduce((s, v) => s + v, 0)

  const toggle = (id: string) => {
    setCart((prev) => {
      const next = new Map(prev)
      if (next.has(id)) next.delete(id)
      else next.set(id, 1)
      return next
    })
  }

  const adjust = (id: string, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev)
      const cur = next.get(id) ?? 0
      const nv = cur + delta
      if (nv <= 0) next.delete(id)
      else next.set(id, nv)
      return next
    })
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0f0f', color: '#f5f5f5' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-xl"
        style={{ background: 'rgba(15,15,15,0.92)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-base font-bold" style={{ color: '#f5f5f5' }}>
              Cardápio Digital
            </h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Peça pelo app ou informe ao atendente
            </p>
          </div>
          {cartCount > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: '#16a34a', color: '#fff' }}
            >
              <ShoppingCart size={15} />
              {formatCurrency(cartTotal)}
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[10px] font-bold flex items-center justify-center" style={{ color: '#16a34a' }}>
                {cartCount}
              </span>
            </button>
          )}
        </div>
        {/* Search */}
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar no cardápio..."
              className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#f5f5f5',
              }}
            />
          </div>
        </div>
      </header>

      {/* Menu content */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-8 pb-24">
        {grouped.size === 0 && (
          <div className="text-center py-20 opacity-40">
            <p className="text-sm">Nenhum item encontrado</p>
          </div>
        )}

        {Array.from(grouped.entries()).map(([category, products]) => (
          <section key={category}>
            <div className="flex items-center gap-2 mb-3">
              <Tag size={12} style={{ color: '#16a34a' }} />
              <h2 className="text-xs font-mono font-semibold tracking-widest uppercase" style={{ color: '#16a34a' }}>
                {category}
              </h2>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <div className="space-y-2">
              {products.map((p) => {
                const qty = cart.get(p.id) ?? 0
                const inCart = qty > 0
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{
                      background: inCart ? 'rgba(22,163,74,0.10)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${inCart ? 'rgba(22,163,74,0.30)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#f5f5f5' }}>
                        {p.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {p.unit === 'kg' ? 'por kg' : `por ${p.unit}`}
                        {p.stock <= p.minStock && p.stock > 0 && (
                          <span className="ml-2 text-amber-400">Poucas unidades</span>
                        )}
                      </p>
                    </div>

                    {/* Price + controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-mono font-bold" style={{ color: '#16a34a' }}>
                        {formatCurrency(p.price)}
                      </span>
                      {inCart ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => adjust(p.id, -1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                            style={{ background: 'rgba(255,255,255,0.10)', color: '#f5f5f5' }}
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-sm font-mono font-bold" style={{ color: '#f5f5f5' }}>
                            {qty}
                          </span>
                          <button
                            onClick={() => adjust(p.id, 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                            style={{ background: '#16a34a', color: '#fff' }}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggle(p.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-lg font-bold transition-colors"
                          style={{ background: 'rgba(22,163,74,0.20)', color: '#16a34a' }}
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </main>

      {/* Cart sheet */}
      {showCart && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowCart(false)}
        >
          <div
            className="w-full max-w-2xl rounded-t-2xl overflow-hidden"
            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.10)', maxHeight: '70vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="font-semibold text-sm" style={{ color: '#f5f5f5' }}>Meu Pedido</h3>
              <button onClick={() => setShowCart(false)} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }}>×</button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 130px)' }}>
              {Array.from(cart.entries()).map(([id, qty]) => {
                const p = active.find((x) => x.id === id)
                if (!p) return null
                return (
                  <div key={id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="flex-1 text-sm" style={{ color: '#f5f5f5' }}>{qty}× {p.name}</span>
                    <span className="text-sm font-mono font-bold" style={{ color: '#16a34a' }}>
                      {formatCurrency(p.price * qty)}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex justify-between font-bold text-base" style={{ color: '#f5f5f5' }}>
                <span>Total</span>
                <span className="font-mono" style={{ color: '#16a34a' }}>{formatCurrency(cartTotal)}</span>
              </div>
              <button
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: '#16a34a' }}
                onClick={() => {
                  setShowCart(false)
                  setCart(new Map())
                }}
              >
                <CheckCircle2 size={15} />
                Confirmar Pedido
              </button>
              <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Apresente ao atendente ou aguarde o garçom
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
