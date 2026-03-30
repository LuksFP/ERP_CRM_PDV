/**
 * PDV Display — tela do cliente / monitor secundário
 * Abre em outra janela/aba e sincroniza com o PDV via localStorage.
 * URL: /display
 */
import { useEffect, useState } from 'react'
import { CheckCircle2, ShoppingCart, Clock } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/formatters'
import { usePDVCartStore } from '../store/pdvCartStore'
import { usePDVThemeStore, SEGMENT_GRADIENTS } from '../store/pdvTheme'
import { useComandaStore } from '../store/comandaStore'
import type { CartItem } from '../store/pdvCartStore'

// Force re-hydrate from localStorage when storage event fires (cross-tab sync)
function useCrossTabSync() {
  const rehydrateCart    = usePDVCartStore.persist.rehydrate
  const rehydrateTheme   = usePDVThemeStore.persist.rehydrate
  const rehydrateComanda = useComandaStore.persist.rehydrate

  useEffect(() => {
    const handler = () => {
      rehydrateCart()
      rehydrateTheme()
      rehydrateComanda()
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [rehydrateCart, rehydrateTheme, rehydrateComanda])
}

// ─── CLOCK ────────────────────────────────────────────────────────
function Clock12() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('pt-BR'))
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('pt-BR')), 1000)
    return () => clearInterval(t)
  }, [])
  return <span>{time}</span>
}

// ─── CART ROW ─────────────────────────────────────────────────────
function CartRow({ item, accent }: { item: CartItem; accent: string }) {
  const lineTotal = item.product.price * item.quantity * (1 - item.discount / 100)
  return (
    <div className="flex items-center gap-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
        style={{ background: `${accent}33` }}
      >
        {item.quantity}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-white/90 text-base font-medium truncate">{item.product.name}</p>
        <p className="text-white/40 text-sm font-mono">{formatCurrency(item.product.price)} / un</p>
      </div>
      <span className="text-lg font-mono font-bold shrink-0" style={{ color: accent }}>
        {formatCurrency(lineTotal)}
      </span>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────
export default function PDVDisplayPage() {
  useCrossTabSync()

  const { cart, globalDiscount, pdvId } = usePDVCartStore()
  const { theme }  = usePDVThemeStore()
  const { comandas } = useComandaStore()
  const [prevTotal, setPrevTotal] = useState(0)
  const [pulse, setPulse] = useState(false)

  // Compute totals
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity * (1 - i.discount / 100), 0)
  const discountAmount = subtotal * (globalDiscount / 100)
  const total = subtotal - discountAmount

  // Pulse animation when total changes
  useEffect(() => {
    if (total !== prevTotal && total > 0) {
      setPrevTotal(total)
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 400)
      return () => clearTimeout(t)
    }
  }, [total, prevTotal])

  // Background
  const accent = theme.accentOverride || '#E8A830'
  let bgStyle: React.CSSProperties = { background: '#0a0a0f' }
  if (theme.backgroundPreset !== 'none') {
    if (theme.backgroundPreset === 'custom' && theme.backgroundImageUrl) {
      bgStyle = {
        backgroundImage: `url(${theme.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    } else if (theme.backgroundPreset !== 'custom') {
      bgStyle = { background: SEGMENT_GRADIENTS[theme.backgroundPreset]?.gradient ?? '#0a0a0f' }
    }
  }
  const overlay = theme.backgroundPreset !== 'none' ? theme.backgroundOverlay : 0

  // Active comandas (comanda mode)
  const openComandas = comandas.filter((c) => c.status === 'open')

  const isEmpty = theme.pdvMode === 'caixa' ? cart.length === 0 : openComandas.length === 0

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden select-none"
      style={bgStyle}
    >
      {/* Overlay */}
      {overlay > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `rgba(0,0,0,${overlay / 100})` }}
        />
      )}

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── Top bar ─────────────────────────── */}
        <div
          className="flex items-center justify-between px-10 py-5 shrink-0"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg"
              style={{ background: accent }}
            >
              E
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">ERP PDV</p>
              <p className="text-white/40 text-xs font-mono">{pdvId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/40 font-mono text-sm">
            <Clock className="w-4 h-4" />
            <Clock12 />
          </div>
        </div>

        {/* ── Content ─────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Caixa mode ──────────────────────── */}
          {theme.pdvMode === 'caixa' && (
            <div className="flex flex-1 items-stretch">

              {/* Cart items (left 60%) */}
              <div className="flex-1 flex flex-col px-10 py-8 overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                {isEmpty ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <div
                      className="w-24 h-24 rounded-3xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <ShoppingCart size={40} className="text-white/20" />
                    </div>
                    <div className="text-center">
                      <p className="text-white/60 text-xl font-medium">Aguardando atendimento</p>
                      <p className="text-white/30 text-base mt-1">Bem-vindo! Logo vamos atendê-lo.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <ShoppingCart size={22} style={{ color: accent }} />
                      <h2 className="text-white text-xl font-semibold">Sua Compra</h2>
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: accent }}
                      >
                        {cart.reduce((s, i) => s + i.quantity, 0)}
                      </span>
                    </div>
                    <div className="space-y-0">
                      {cart.map((item) => (
                        <CartRow key={item.product.id} item={item} accent={accent} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Total (right 40%) */}
              <div className="w-96 flex flex-col items-center justify-center px-10 gap-6">
                {!isEmpty ? (
                  <>
                    {globalDiscount > 0 && (
                      <div className="text-center">
                        <p className="text-white/40 text-sm font-mono">SUBTOTAL</p>
                        <p className="text-white/60 text-2xl font-mono">{formatCurrency(subtotal)}</p>
                        <p className="text-red-400 text-sm font-mono mt-1">- DESCONTO {globalDiscount}%</p>
                        <p className="text-red-400 text-sm font-mono">- {formatCurrency(discountAmount)}</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-white/40 text-sm font-mono tracking-widest mb-2">TOTAL</p>
                      <p
                        className="font-mono font-black transition-all duration-300"
                        style={{
                          color: accent,
                          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                          transform: pulse ? 'scale(1.04)' : 'scale(1)',
                        }}
                      >
                        {formatCurrency(total)}
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white/60"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                    >
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      Confira os itens acima
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-white/20 font-mono text-6xl font-black">{formatCurrency(0)}</p>
                    <p className="text-white/20 text-sm font-mono tracking-widest">AGUARDANDO</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Comanda mode ──────────────────── */}
          {theme.pdvMode === 'comanda' && (
            <div className="flex-1 px-10 py-8 overflow-y-auto">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full gap-6">
                  <div
                    className="w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <ShoppingCart size={40} className="text-white/20" />
                  </div>
                  <p className="text-white/40 text-xl font-medium">Nenhuma mesa aberta</p>
                </div>
              ) : (
                <>
                  <h2 className="text-white text-xl font-semibold mb-6">Mesas Abertas ({openComandas.length})</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {openComandas.map((c) => {
                      const tTotal = c.items.reduce((s, i) => s + i.product.price * i.quantity, 0) * (1 - c.discount / 100)
                      const itemCount = c.items.reduce((s, i) => s + i.quantity, 0)
                      return (
                        <div
                          key={c.id}
                          className="rounded-2xl p-5 space-y-2"
                          style={{ background: `${accent}18`, border: `1px solid ${accent}44` }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-lg">Mesa {c.tableNumber}</span>
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: accent }}
                            >
                              {itemCount}
                            </span>
                          </div>
                          {c.customerName && (
                            <p className="text-white/50 text-sm">{c.customerName}</p>
                          )}
                          <p className="text-xl font-mono font-bold" style={{ color: accent }}>
                            {formatCurrency(tTotal)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* ── Bottom bar ──────────────────────── */}
        <div
          className="flex items-center justify-center px-10 py-4 shrink-0"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-white/25 text-xs font-mono tracking-widest">
            TELA DO CLIENTE · {pdvId} · OBRIGADO PELA PREFERÊNCIA
          </p>
        </div>
      </div>
    </div>
  )
}
