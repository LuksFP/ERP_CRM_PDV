import { useState } from 'react'
import { Sun, Moon, ShoppingCart, Package, Users, DollarSign } from 'lucide-react'
import type { WizardData } from './index'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { cn } from '@/shared/utils/cn'

interface Props {
  data: Partial<WizardData>
  onUpdate: (d: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

const PRESET_COLORS = [
  '#E2A336', '#5CB870', '#3B82F6', '#8B5CF6',
  '#EC4899', '#EF4444', '#0891B2', '#D97706',
]

// ─── MINI TENANT PREVIEW ─────────────────────────────────────────
function TenantPreview({
  primaryColor,
  accentColor,
  theme,
  name,
}: {
  primaryColor: string
  accentColor: string
  theme: 'dark' | 'light'
  name: string
}) {
  const isDark = theme === 'dark'
  const styles = {
    bg: isDark ? '#0C0A09' : '#FAF8F5',
    surface: isDark ? '#1A1714' : '#FFFFFF',
    surface2: isDark ? '#231F1A' : '#F5F2ED',
    text: isDark ? '#E8E0D4' : '#1A1714',
    textMuted: isDark ? '#A89F91' : '#6B6358',
    border: isDark ? 'rgba(214,198,172,0.07)' : 'rgba(60,50,38,0.08)',
  }

  return (
    <div
      className="rounded-card overflow-hidden border"
      style={{ backgroundColor: styles.bg, borderColor: styles.border, fontSize: '10px' }}
    >
      {/* Sidebar */}
      <div className="flex h-full">
        <div
          className="w-28 flex flex-col"
          style={{ backgroundColor: styles.surface, borderRight: `1px solid ${styles.border}` }}
        >
          {/* Logo */}
          <div
            className="px-2 py-2 border-b flex items-center gap-1.5"
            style={{ borderColor: styles.border }}
          >
            <div
              className="h-4 w-4 rounded flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingCart className="h-2.5 w-2.5 text-white" />
            </div>
            <span
              className="font-semibold truncate"
              style={{ color: styles.text }}
            >
              {name.slice(0, 12) || 'Seu ERP'}
            </span>
          </div>
          {/* Nav items */}
          {['Dashboard', 'PDV', 'Estoque', 'CRM'].map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-1.5 px-2 py-1.5 mx-1 my-0.5 rounded"
              style={{
                backgroundColor: i === 0 ? `${primaryColor}20` : 'transparent',
                color: i === 0 ? primaryColor : styles.textMuted,
              }}
            >
              <div
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: i === 0 ? primaryColor : styles.textMuted, opacity: 0.6 }}
              />
              {item}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-2" style={{ backgroundColor: styles.bg }}>
          {/* Header */}
          <div
            className="flex items-center justify-between mb-2 pb-1.5 border-b"
            style={{ borderColor: styles.border }}
          >
            <span style={{ color: styles.text, fontWeight: 600 }}>Dashboard</span>
            <button
              className="px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: primaryColor, fontSize: '9px' }}
            >
              + Novo
            </button>
          </div>
          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Vendas', value: 'R$ 4.280', icon: <DollarSign className="h-2.5 w-2.5" /> },
              { label: 'Produtos', value: '1.240', icon: <Package className="h-2.5 w-2.5" /> },
              { label: 'Clientes', value: '380', icon: <Users className="h-2.5 w-2.5" /> },
              { label: 'PDVs', value: '3 Online', icon: <ShoppingCart className="h-2.5 w-2.5" /> },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="rounded p-1.5"
                style={{ backgroundColor: styles.surface2, border: `1px solid ${styles.border}` }}
              >
                <div className="flex items-center gap-1 mb-0.5" style={{ color: styles.textMuted }}>
                  {icon}
                  <span>{label}</span>
                </div>
                <span style={{ color: styles.text, fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
          {/* Accent button */}
          <div className="mt-2">
            <button
              className="w-full py-1 rounded text-white"
              style={{ backgroundColor: accentColor, fontSize: '9px' }}
            >
              Ver Relatório Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StepBranding({ data, onUpdate, onNext, onPrev }: Props) {
  const [primaryColor, setPrimaryColor] = useState(data.primaryColor ?? '#E2A336')
  const [accentColor, setAccentColor] = useState(data.accentColor ?? '#5CB870')
  const [theme, setTheme] = useState<'dark' | 'light'>(data.defaultTheme ?? 'dark')

  const update = (partial: Partial<WizardData>) => {
    if (partial.primaryColor !== undefined) setPrimaryColor(partial.primaryColor)
    if (partial.accentColor !== undefined) setAccentColor(partial.accentColor)
    if (partial.defaultTheme !== undefined) setTheme(partial.defaultTheme)
    onUpdate(partial)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-fg mb-0.5">Branding</h3>
        <p className="text-xs text-fg-muted">
          Personalize a aparência do ERP do cliente. A preview atualiza em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: controls */}
        <div className="flex flex-col gap-4">
          {/* Primary color */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Cor Primária
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => update({ primaryColor: e.target.value })}
                className="h-9 w-12 rounded-input cursor-pointer bg-surface-2 border border-[var(--border)] p-0.5"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => update({ primaryColor: e.target.value })}
                className="h-9 flex-1 rounded-input bg-surface-2 border border-[var(--border)] px-3 text-sm font-mono text-fg outline-none focus:border-accent"
                maxLength={7}
              />
            </div>
            <div className="flex gap-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => update({ primaryColor: c })}
                  className={cn(
                    'h-5 w-5 rounded-sm border-2 transition-all',
                    primaryColor === c ? 'border-fg scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Cor de Acento
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => update({ accentColor: e.target.value })}
                className="h-9 w-12 rounded-input cursor-pointer bg-surface-2 border border-[var(--border)] p-0.5"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => update({ accentColor: e.target.value })}
                className="h-9 flex-1 rounded-input bg-surface-2 border border-[var(--border)] px-3 text-sm font-mono text-fg outline-none focus:border-accent"
                maxLength={7}
              />
            </div>
          </div>

          {/* Theme toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Tema Padrão
            </label>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update({ defaultTheme: t })}
                  className={cn(
                    'flex items-center gap-2 flex-1 h-9 px-3 rounded-input border text-sm transition-all',
                    theme === t
                      ? 'border-accent bg-accent-dim text-accent'
                      : 'border-[var(--border)] bg-surface-2 text-fg-muted hover:border-[var(--border-hover)]'
                  )}
                >
                  {t === 'dark' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                  {t === 'dark' ? 'Escuro' : 'Claro'}
                </button>
              ))}
            </div>
          </div>

          {/* Logo upload placeholder */}
          <div>
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide block mb-2">
              Logo (opcional)
            </label>
            <div className="h-16 rounded-input border-2 border-dashed border-[var(--border)] flex items-center justify-center bg-surface-2 cursor-pointer hover:border-[var(--border-hover)] transition-colors">
              <p className="text-xs text-fg-dim text-center">
                Clique ou arraste<br />
                <span className="text-2xs">PNG/SVG, máx 2MB</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div>
          <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-2">
            Preview ao vivo
          </p>
          <TenantPreview
            primaryColor={primaryColor}
            accentColor={accentColor}
            theme={theme}
            name={data.name ?? ''}
          />
          <p className="text-xs text-fg-dim mt-2 text-center">
            Como o cliente verá o ERP dele
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onPrev}>
          Voltar
        </Button>
        <Button variant="primary" onClick={onNext}>
          Próximo
        </Button>
      </div>
    </div>
  )
}
