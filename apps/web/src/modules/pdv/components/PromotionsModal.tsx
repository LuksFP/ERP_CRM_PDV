import { useState } from 'react'
import { X, Plus, Zap, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Input } from '@/shared/components/Input'
import { usePromotionsStore } from '../store/promotionsStore'
import type { PromotionTarget } from '../store/promotionsStore'
import { MOCK_PRODUCTS } from '@/mock/configs'

interface Props {
  accent: string
  onClose: () => void
}

// Unique categories from products
const CATEGORIES = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category))).sort()

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function isLive(p: { startsAt: string; endsAt: string; active: boolean }) {
  if (!p.active) return false
  const now = Date.now()
  return now >= new Date(p.startsAt).getTime() && now <= new Date(p.endsAt).getTime()
}

export function PromotionsModal({ accent, onClose }: Props) {
  const { promotions, addPromotion, togglePromotion, removePromotion } = usePromotionsStore()

  const [showForm, setShowForm] = useState(false)
  const [name, setName]         = useState('')
  const [discount, setDiscount] = useState('10')
  const [target, setTarget]     = useState<PromotionTarget>('all')
  const [targetValue, setTargetValue] = useState('')
  const [startDate, setStartDate]     = useState(() => {
    const d = new Date(); d.setSeconds(0, 0); return d.toISOString().slice(0, 16)
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date(); d.setHours(d.getHours() + 2, 0, 0, 0); return d.toISOString().slice(0, 16)
  })

  const handleAdd = () => {
    if (!name.trim() || !discount) return
    addPromotion({
      name: name.trim(),
      discount: parseFloat(discount),
      target,
      targetValue: target !== 'all' ? targetValue : undefined,
      startsAt: new Date(startDate).toISOString(),
      endsAt:   new Date(endDate).toISOString(),
    })
    setName(''); setDiscount('10'); setTarget('all'); setTargetValue('')
    setShowForm(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-[500px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <Zap size={15} style={{ color: accent }} />
            <div>
              <h3 className="font-semibold text-ink text-sm">Promoções Relâmpago</h3>
              <p className="text-[10px] text-ink-muted mt-0.5">Descontos automáticos por tempo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
              style={{ background: accent }}
            >
              <Plus size={12} />
              Nova Promoção
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-2">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="px-5 py-4 space-y-3 shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-1)' }}>
            <Input label="Nome da promoção" placeholder="Ex: Sexta Flash -20%" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Desconto (%)" type="number" min="1" max="90" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-muted">Aplicar em</label>
                <select
                  value={target}
                  onChange={(e) => { setTarget(e.target.value as PromotionTarget); setTargetValue('') }}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-surface-0 text-sm text-ink outline-none focus:border-accent"
                >
                  <option value="all">Todos os produtos</option>
                  <option value="category">Categoria</option>
                  <option value="product">Produto específico</option>
                </select>
              </div>
            </div>

            {target === 'category' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-muted">Categoria</label>
                <select
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-surface-0 text-sm text-ink outline-none focus:border-accent"
                >
                  <option value="">Selecione...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {target === 'product' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-muted">Produto</label>
                <select
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-surface-0 text-sm text-ink outline-none focus:border-accent"
                >
                  <option value="">Selecione...</option>
                  {MOCK_PRODUCTS.filter(p => p.isActive).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-muted">Início</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-surface-0 text-sm text-ink outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-ink-muted">Fim</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-surface-0 text-sm text-ink outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 h-9 rounded-lg text-sm font-medium text-ink-muted border border-border hover:bg-surface-2 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={!name.trim() || !discount}
                className="flex-1 h-9 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40"
                style={{ background: accent }}
              >
                Criar Promoção
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {promotions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-16">
              <Zap size={28} className="text-ink-subtle opacity-25" />
              <p className="text-xs text-ink-subtle">Nenhuma promoção cadastrada</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {promotions.map((p) => {
                const live = isLive(p)
                return (
                  <div key={p.id} className={cn('px-5 py-3.5 flex items-start gap-3', live && 'bg-yellow-500/4')}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                        {live && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse" style={{ background: `${accent}22`, color: accent }}>
                            ATIVO
                          </span>
                        )}
                        {!p.active && (
                          <span className="text-[9px] text-ink-subtle border border-border px-1.5 py-0.5 rounded-full">
                            pausado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-ink-muted">
                        <span className="flex items-center gap-1 font-bold" style={{ color: accent }}>
                          <Tag size={9} />
                          -{p.discount}%
                        </span>
                        <span>
                          {p.target === 'all' ? 'Todos os produtos'
                            : p.target === 'category' ? `Categoria: ${p.targetValue}`
                            : `Produto: ${MOCK_PRODUCTS.find(x => x.id === p.targetValue)?.name ?? p.targetValue}`
                          }
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-ink-subtle mt-0.5">
                        {timeLabel(p.startsAt)} → {timeLabel(p.endsAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePromotion(p.id)}
                        className="p-1.5 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors"
                        title={p.active ? 'Pausar' : 'Ativar'}
                      >
                        {p.active ? <ToggleRight size={16} style={{ color: accent }} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => removePromotion(p.id)}
                        className="p-1.5 rounded-lg text-ink-subtle hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remover"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
