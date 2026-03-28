import { useState } from 'react'
import { Palette, Square, RotateCcw, Check } from 'lucide-react'
import { useBrandStore, PRESET_COLORS, RADIUS_OPTIONS, applyBrand } from '@/shared/store/brand'
import type { ButtonRadius } from '@/shared/store/brand'

// ─── SECTION HEADER ──────────────────────────────────────────────
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg)', margin: 0 }}>{title}</h2>
      {description && (
        <p style={{ fontSize: 13, color: 'var(--fg-dim)', marginTop: 4 }}>{description}</p>
      )}
    </div>
  )
}

// ─── CARD ─────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── COLOR SWATCH ─────────────────────────────────────────────────
function ColorSwatch({ color, label, selected, onClick }: {
  color: string
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: color,
        border: selected ? '2px solid var(--fg)' : '2px solid transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.1s, border-color 0.1s',
        transform: selected ? 'scale(1.1)' : 'scale(1)',
        boxShadow: selected ? `0 0 0 2px var(--bg), 0 0 0 4px ${color}` : 'none',
        padding: 0,
      }}
    >
      {selected && <Check size={14} color={isLightColor(color) ? '#000' : '#fff'} strokeWidth={3} />}
    </button>
  )
}

function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const num = parseInt(full, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

// ─── RADIUS CARD ─────────────────────────────────────────────────
function RadiusCard({ label, value, selected, onClick }: {
  label: string
  value: ButtonRadius
  selected: boolean
  onClick: () => void
}) {
  const previewRadius = value === 'square' ? 2 : value === 'rounded' ? 6 : 999
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '14px 12px',
        borderRadius: 8,
        border: selected ? '1px solid var(--accent)' : '1px solid var(--border)',
        background: selected ? 'var(--accent-dim)' : 'var(--surface-2)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      {/* Preview shape */}
      <div style={{
        width: 48,
        height: 22,
        borderRadius: previewRadius,
        background: selected ? 'var(--accent)' : 'var(--surface-3)',
        transition: 'background 0.15s',
      }} />
      <span style={{
        fontSize: 11,
        fontWeight: selected ? 600 : 400,
        color: selected ? 'var(--accent)' : 'var(--fg-dim)',
      }}>
        {label}
      </span>
    </button>
  )
}

// ─── PREVIEW PANEL ───────────────────────────────────────────────
function PreviewPanel() {
  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 20,
    }}>
      <p style={{ fontSize: 11, fontFamily: 'Geist Mono', color: 'var(--fg-dim)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>
        Preview
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Primary button */}
        <button style={{
          padding: '8px 16px',
          borderRadius: 'var(--btn-radius)',
          background: 'var(--accent)',
          color: isLightColor(document.documentElement.style.getPropertyValue('--accent') || '#E8A830') ? '#000' : '#fff',
          border: 'none',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          width: '100%',
          fontFamily: 'Geist, sans-serif',
        }}>
          Botão primário
        </button>
        {/* Secondary button */}
        <button style={{
          padding: '8px 16px',
          borderRadius: 'var(--btn-radius)',
          background: 'var(--surface-3)',
          color: 'var(--fg)',
          border: '1px solid var(--border)',
          fontWeight: 500,
          fontSize: 13,
          cursor: 'pointer',
          width: '100%',
          fontFamily: 'Geist, sans-serif',
        }}>
          Botão secundário
        </button>
        {/* Badge */}
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{
            padding: '3px 10px',
            borderRadius: 'calc(var(--btn-radius) / 1)',
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            fontSize: 11,
            fontWeight: 600,
          }}>
            Ativo
          </span>
          <span style={{
            padding: '3px 10px',
            borderRadius: 'calc(var(--btn-radius) / 1)',
            background: 'rgba(77,184,100,0.1)',
            color: 'var(--green)',
            fontSize: 11,
            fontWeight: 600,
          }}>
            Online
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────
export default function PersonalizarPage() {
  const { config, setAccentColor, setButtonRadius, reset } = useBrandStore()
  const [customHex, setCustomHex] = useState(config.accentColor)
  const [hexError, setHexError] = useState(false)

  function handleCustomHex(val: string) {
    setCustomHex(val)
    const match = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val)
    if (match) {
      setHexError(false)
      setAccentColor(val)
      applyBrand({ ...config, accentColor: val })
    } else {
      setHexError(true)
    }
  }

  function handlePreset(color: string) {
    setCustomHex(color)
    setHexError(false)
    setAccentColor(color)
    applyBrand({ ...config, accentColor: color })
  }

  function handleRadius(radius: ButtonRadius) {
    setButtonRadius(radius)
    applyBrand({ ...config, buttonRadius: radius })
  }

  function handleReset() {
    reset()
    setCustomHex('#E8A830')
    setHexError(false)
    applyBrand({ accentColor: '#E8A830', buttonRadius: 'rounded' })
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Palette size={16} color="var(--accent)" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', margin: 0 }}>
              Identidade Visual
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--fg-dim)', margin: 0 }}>
            Personalize as cores e o estilo dos botões para combinar com a marca da sua empresa.
          </p>
        </div>
        <button
          onClick={handleReset}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px',
            borderRadius: 'var(--btn-radius)',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--fg-dim)',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'Geist, sans-serif',
          }}
        >
          <RotateCcw size={13} />
          Restaurar padrão
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Accent color */}
          <Card>
            <SectionHeader
              title="Cor de destaque"
              description="Usada em botões, badges, links ativos e outros elementos interativos."
            />

            {/* Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {PRESET_COLORS.map(p => (
                <ColorSwatch
                  key={p.value}
                  color={p.value}
                  label={p.label}
                  selected={config.accentColor === p.value}
                  onClick={() => handlePreset(p.value)}
                />
              ))}
            </div>

            {/* Custom hex input */}
            <div>
              <p style={{ fontSize: 11, fontFamily: 'Geist Mono', color: 'var(--fg-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                Cor personalizada
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Color preview */}
                <div style={{
                  width: 36, height: 36,
                  borderRadius: 6,
                  background: hexError ? 'var(--surface-3)' : config.accentColor,
                  border: '1px solid var(--border)',
                  flexShrink: 0,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <input
                    type="color"
                    value={customHex.match(/^#[A-Fa-f0-9]{6}$/) ? customHex : '#E8A830'}
                    onChange={e => handleCustomHex(e.target.value)}
                    style={{
                      position: 'absolute', inset: 0,
                      width: '200%', height: '200%',
                      opacity: 0, cursor: 'pointer',
                    }}
                  />
                </div>
                <input
                  type="text"
                  value={customHex}
                  onChange={e => handleCustomHex(e.target.value)}
                  placeholder="#E8A830"
                  maxLength={7}
                  style={{
                    flex: 1,
                    height: 36,
                    padding: '0 12px',
                    borderRadius: 'var(--btn-radius)',
                    border: `1px solid ${hexError ? 'var(--red)' : 'var(--border)'}`,
                    background: 'var(--surface-2)',
                    color: hexError ? 'var(--red)' : 'var(--fg)',
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
              {hexError && (
                <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>
                  Formato inválido — use #RRGGBB
                </p>
              )}
            </div>
          </Card>

          {/* Button radius */}
          <Card>
            <SectionHeader
              title="Estilo dos botões"
              description="Define o arredondamento de bordas de botões e elementos interativos."
            />
            <div style={{ display: 'flex', gap: 10 }}>
              {RADIUS_OPTIONS.map(opt => (
                <RadiusCard
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                  selected={config.buttonRadius === opt.value}
                  onClick={() => handleRadius(opt.value)}
                />
              ))}
            </div>
          </Card>

        </div>

        {/* Right column — preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <SectionHeader
              title="Pré-visualização"
              description="Veja como os elementos ficarão com as configurações atuais."
            />
            <PreviewPanel />

            {/* Color info */}
            <div style={{
              marginTop: 16,
              padding: '12px 14px',
              background: 'var(--surface-2)',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: 11, fontFamily: 'Geist Mono', color: 'var(--fg-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                Valores atuais
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Cor de destaque</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: config.accentColor, border: '1px solid var(--border)' }} />
                    <span style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'var(--fg)' }}>{config.accentColor.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Estilo dos botões</span>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'var(--fg)' }}>
                    {RADIUS_OPTIONS.find(r => r.value === config.buttonRadius)?.label ?? config.buttonRadius}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Border radius</span>
                  <span style={{ fontFamily: 'Geist Mono', fontSize: 11, color: 'var(--fg)' }}>
                    {RADIUS_OPTIONS.find(r => r.value === config.buttonRadius)?.px}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tip */}
          <div style={{
            padding: '12px 14px',
            background: 'var(--accent-dim)',
            borderRadius: 8,
            border: '1px solid var(--accent)',
            display: 'flex',
            gap: 10,
          }}>
            <Square size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'var(--fg-muted)', margin: 0, lineHeight: 1.6 }}>
              As configurações são salvas automaticamente e aplicadas em toda a interface do painel administrativo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
