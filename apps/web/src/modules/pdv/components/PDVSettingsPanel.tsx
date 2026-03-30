import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, RotateCcw, Palette, Image, SlidersHorizontal, Layers, ShoppingBag, UtensilsCrossed, Volume2, VolumeX, FlaskConical, Keyboard } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { usePDVThemeStore, SEGMENT_GRADIENTS } from '../store/pdvTheme'
import { usePDVShortcutsStore, SHORTCUT_LABELS, DEFAULT_SHORTCUTS } from '../store/pdvShortcutsStore'
import type { CardStyle, ButtonShape, PDVMode } from '../store/pdvTheme'
import type { SegmentType } from '@/shared/types'

interface PDVSettingsPanelProps {
  open: boolean
  onClose: () => void
  tenantAccent: string
  segment: SegmentType
}

// ─── Seção do painel ────────────────────────────────────────────
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/8 pb-5 last:border-0">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-white/40">{icon}</span>
        <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">{title}</p>
      </div>
      {children}
    </div>
  )
}

// ─── Toggle option pill ─────────────────────────────────────────
function OptionPill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs font-medium rounded-lg transition-all border',
        active
          ? 'bg-white/15 border-white/30 text-white'
          : 'bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70',
      )}
    >
      {children}
    </button>
  )
}

export function PDVSettingsPanel({ open, onClose, tenantAccent, segment }: PDVSettingsPanelProps) {
  const { theme, setTheme, resetTheme }           = usePDVThemeStore()
  const { shortcuts, setShortcut, resetShortcuts } = usePDVShortcutsStore()
  const [capturingKey, setCapturingKey]            = useState<keyof typeof SHORTCUT_LABELS | null>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (capturingKey) {
        e.preventDefault()
        e.stopPropagation()
        if (e.key !== 'Escape') {
          setShortcut(capturingKey, e.key)
        }
        setCapturingKey(null)
        return
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler, { capture: true })
    return () => window.removeEventListener('keydown', handler, { capture: true })
  }, [open, onClose, capturingKey, setShortcut])

  if (!open) return null

  const effectiveAccent = theme.accentOverride || tenantAccent

  return createPortal(
    <>
      {/* Backdrop click-away */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-72 flex flex-col overflow-hidden"
        style={{
          background: 'rgba(10,10,18,0.96)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-24px 0 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
          <div>
            <p className="text-sm font-semibold text-white">Personalizar PDV</p>
            <p className="text-[10px] text-white/40 mt-0.5">Tema salvo automaticamente</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetTheme}
              title="Restaurar padrão"
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* ── Modo PDV ─────────────────────────── */}
          <Section icon={<ShoppingBag size={13} />} title="Modo de Operação">
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'caixa',   label: 'Caixa Rápido', desc: 'Venda direta, sem mesas', Icon: ShoppingBag },
                { id: 'comanda', label: 'Comanda',        desc: 'Mesas e comandas', Icon: UtensilsCrossed },
              ] as { id: PDVMode; label: string; desc: string; Icon: React.ElementType }[]).map(({ id, label, desc, Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme({ pdvMode: id })}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border text-center transition-all',
                    theme.pdvMode === id
                      ? 'bg-white/15 border-white/30 text-white'
                      : 'bg-white/5 border-white/8 text-white/50 hover:bg-white/10 hover:text-white/70',
                  )}
                >
                  <Icon size={18} />
                  <span className="text-xs font-semibold">{label}</span>
                  <span className="text-[9px] opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* ── Background ───────────────────────── */}
          <Section icon={<Image size={13} />} title="Background">
            {/* Presets grid */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {/* None */}
              <button
                onClick={() => setTheme({ backgroundPreset: 'none' })}
                className={cn(
                  'h-14 rounded-lg border text-[10px] text-white/50 font-mono transition-all',
                  theme.backgroundPreset === 'none'
                    ? 'border-white/40 bg-white/10 text-white'
                    : 'border-white/8 bg-white/4 hover:border-white/20',
                )}
              >
                Nenhum
              </button>

              {/* Segment presets */}
              {(Object.entries(SEGMENT_GRADIENTS) as [SegmentType, typeof SEGMENT_GRADIENTS[SegmentType]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setTheme({ backgroundPreset: key })}
                  className={cn(
                    'h-14 rounded-lg border relative overflow-hidden transition-all',
                    theme.backgroundPreset === key
                      ? 'border-white/50 ring-1 ring-white/30'
                      : 'border-white/8 hover:border-white/25',
                    key === segment && 'ring-1 ring-[var(--accent)]/50',
                  )}
                  style={{ background: val.gradient }}
                  title={val.label}
                >
                  <span className="absolute bottom-1 right-1.5 text-[9px] opacity-70">{val.emoji}</span>
                  {key === segment && (
                    <span className="absolute top-1 left-1.5 text-[8px] font-mono text-white/60 bg-black/40 px-1 rounded">seu</span>
                  )}
                </button>
              ))}

              {/* Custom */}
              <button
                onClick={() => setTheme({ backgroundPreset: 'custom' })}
                className={cn(
                  'h-14 rounded-lg border text-[10px] font-mono col-span-3 transition-all flex items-center justify-center gap-1.5',
                  theme.backgroundPreset === 'custom'
                    ? 'border-white/40 bg-white/10 text-white'
                    : 'border-dashed border-white/15 text-white/30 hover:border-white/25 hover:text-white/50',
                )}
              >
                <Image size={11} />
                URL de imagem personalizada
              </button>
            </div>

            {/* Custom URL input */}
            {theme.backgroundPreset === 'custom' && (
              <input
                value={theme.backgroundImageUrl}
                onChange={(e) => setTheme({ backgroundImageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full h-8 px-3 rounded-lg bg-white/6 border border-white/12 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 mb-3"
              />
            )}

            {/* Overlay slider */}
            {theme.backgroundPreset !== 'none' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-white/40 font-mono">Escurecimento</span>
                  <span className="text-[10px] font-mono text-white/60">{theme.backgroundOverlay}%</span>
                </div>
                <input
                  type="range"
                  min={0} max={90} step={5}
                  value={theme.backgroundOverlay}
                  onChange={(e) => setTheme({ backgroundOverlay: Number(e.target.value) })}
                  className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-white cursor-pointer"
                />
              </div>
            )}
          </Section>

          {/* ── Cards ────────────────────────────── */}
          <Section icon={<Layers size={13} />} title="Estilo dos Cards">
            <div className="flex gap-2">
              {([
                { id: 'default', label: 'Padrão' },
                { id: 'glass',   label: 'Glass' },
                { id: 'solid',   label: 'Sólido' },
              ] as { id: CardStyle; label: string }[]).map((opt) => (
                <OptionPill key={opt.id} active={theme.cardStyle === opt.id} onClick={() => setTheme({ cardStyle: opt.id })}>
                  {opt.label}
                </OptionPill>
              ))}
            </div>
            {/* Mini preview */}
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {['Produto A', 'Produto B'].map((name) => (
                <div
                  key={name}
                  className={cn(
                    'p-2.5 rounded transition-all',
                    theme.buttonShape === 'sharp' && 'rounded-none',
                    theme.buttonShape === 'pill' && 'rounded-xl',
                    theme.cardStyle === 'default' && 'bg-[var(--surface-1)] border border-[var(--border)]',
                    theme.cardStyle === 'glass'   && 'bg-white/8 border border-white/15 backdrop-blur-sm',
                    theme.cardStyle === 'solid'   && 'bg-black/50 border-0',
                  )}
                >
                  <p className="text-[11px] font-semibold text-white/80 truncate">{name}</p>
                  <p className="text-[11px] font-mono font-bold mt-0.5" style={{ color: effectiveAccent }}>R$ 9,90</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Botões ───────────────────────────── */}
          <Section icon={<SlidersHorizontal size={13} />} title="Formato dos Botões">
            <div className="flex gap-2 mb-3">
              {([
                { id: 'rounded', label: 'Arredondado' },
                { id: 'sharp',   label: 'Quadrado' },
                { id: 'pill',    label: 'Pill' },
              ] as { id: ButtonShape; label: string }[]).map((opt) => (
                <OptionPill key={opt.id} active={theme.buttonShape === opt.id} onClick={() => setTheme({ buttonShape: opt.id })}>
                  {opt.label}
                </OptionPill>
              ))}
            </div>
            {/* Button preview */}
            <button
              className={cn(
                'w-full py-2 text-xs font-semibold text-white transition-all',
                theme.buttonShape === 'rounded' && 'rounded-lg',
                theme.buttonShape === 'sharp'   && 'rounded-none',
                theme.buttonShape === 'pill'    && 'rounded-full',
              )}
              style={{ background: effectiveAccent }}
            >
              Finalizar — R$ 0,00
            </button>
          </Section>

          {/* ── Cor de acento ────────────────────── */}
          <Section icon={<Palette size={13} />} title="Cor de Acento">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-lg border border-white/20 shrink-0"
                style={{ background: tenantAccent }}
                title="Cor do seu plano"
              />
              <div className="flex-1">
                <p className="text-[10px] text-white/40 font-mono">Cor do tenant</p>
                <p className="text-[10px] font-mono text-white/60">{tenantAccent}</p>
              </div>
              {theme.accentOverride && (
                <button
                  onClick={() => setTheme({ accentOverride: '' })}
                  className="text-[10px] text-white/40 hover:text-white/70 underline"
                >
                  Resetar
                </button>
              )}
            </div>
            {/* Preset accent colors */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                '#E2A336', '#5CB870', '#3B82F6', '#EF4444',
                '#8B5CF6', '#EC4899', '#0891B2', '#F97316',
                '#10B981', '#6366F1',
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => setTheme({ accentOverride: color })}
                  className={cn(
                    'w-7 h-7 rounded-lg border-2 transition-all',
                    theme.accentOverride === color ? 'border-white scale-110' : 'border-transparent hover:scale-105',
                  )}
                  style={{ background: color }}
                />
              ))}
            </div>
            {/* Custom hex input */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg border border-white/20 shrink-0" style={{ background: effectiveAccent }} />
              <input
                type="text"
                value={theme.accentOverride || tenantAccent}
                onChange={(e) => setTheme({ accentOverride: e.target.value })}
                placeholder="#HEX"
                maxLength={7}
                className="flex-1 h-7 px-2 rounded-lg bg-white/6 border border-white/12 text-xs font-mono text-white placeholder:text-white/25 focus:outline-none focus:border-white/30"
              />
            </div>
          </Section>

          {/* ── Layout ───────────────────────────── */}
          <Section icon={<SlidersHorizontal size={13} />} title="Layout">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-xs text-white/70">Modo Compacto</p>
                <p className="text-[10px] text-white/35 mt-0.5">Cards menores, mais produtos visíveis</p>
              </div>
              <button
                onClick={() => setTheme({ compactMode: !theme.compactMode })}
                className={cn(
                  'relative w-9 h-5 rounded-full transition-colors shrink-0',
                  theme.compactMode ? 'bg-white/60' : 'bg-white/15',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow',
                    theme.compactMode ? 'translate-x-4' : 'translate-x-0.5',
                  )}
                />
              </button>
            </label>
          </Section>

          {/* ── Sons & Treinamento ────────────────── */}
          <Section icon={<Volume2 size={13} />} title="Sons & Modo">
            <div className="space-y-3">
              {/* Sound toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  {theme.soundEnabled ? <Volume2 size={14} className="text-white/50" /> : <VolumeX size={14} className="text-white/30" />}
                  <div>
                    <p className="text-xs text-white/70">Sons do PDV</p>
                    <p className="text-[10px] text-white/35 mt-0.5">Beep ao adicionar, som ao finalizar</p>
                  </div>
                </div>
                <button
                  onClick={() => setTheme({ soundEnabled: !theme.soundEnabled })}
                  className={cn(
                    'relative w-9 h-5 rounded-full transition-colors shrink-0',
                    theme.soundEnabled ? 'bg-white/60' : 'bg-white/15',
                  )}
                >
                  <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow', theme.soundEnabled ? 'translate-x-4' : 'translate-x-0.5')} />
                </button>
              </label>

              {/* Training mode toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <FlaskConical size={14} className={theme.trainingMode ? 'text-amber-400' : 'text-white/30'} />
                  <div>
                    <p className="text-xs text-white/70">Modo Treinamento</p>
                    <p className="text-[10px] text-white/35 mt-0.5">Vendas não são registradas</p>
                  </div>
                </div>
                <button
                  onClick={() => setTheme({ trainingMode: !theme.trainingMode })}
                  className={cn(
                    'relative w-9 h-5 rounded-full transition-colors shrink-0',
                    theme.trainingMode ? 'bg-amber-500/70' : 'bg-white/15',
                  )}
                >
                  <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow', theme.trainingMode ? 'translate-x-4' : 'translate-x-0.5')} />
                </button>
              </label>
            </div>
          </Section>

          {/* ── Atalhos de teclado ────────────────── */}
          <Section icon={<Keyboard size={13} />} title="Atalhos de Teclado">
            <div className="space-y-2">
              {(Object.entries(SHORTCUT_LABELS) as [keyof typeof SHORTCUT_LABELS, string][]).map(([action, label]) => (
                <div key={action} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/60 flex-1">{label}</span>
                  <button
                    onClick={() => setCapturingKey(capturingKey === action ? null : action)}
                    className={cn(
                      'min-w-[3.5rem] px-2 py-1 text-[11px] font-mono rounded-lg border transition-all text-center',
                      capturingKey === action
                        ? 'bg-white/20 border-white/50 text-white animate-pulse'
                        : 'bg-white/6 border-white/12 text-white/70 hover:bg-white/12 hover:border-white/25',
                    )}
                  >
                    {capturingKey === action ? '...' : shortcuts[action]}
                  </button>
                </div>
              ))}
              <button
                onClick={() => { resetShortcuts(); setCapturingKey(null) }}
                className="mt-2 text-[10px] text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={10} />
                Restaurar padrões ({Object.values(DEFAULT_SHORTCUTS).join(', ')})
              </button>
            </div>
            {capturingKey && (
              <p className="mt-2 text-[10px] text-amber-400/80 text-center">
                Pressione qualquer tecla para "{SHORTCUT_LABELS[capturingKey]}" · Esc para cancelar
              </p>
            )}
          </Section>
        </div>
      </div>
    </>,
    document.body,
  )
}
