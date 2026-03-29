import { useState } from 'react'
import { Save, Sun, Moon } from 'lucide-react'
import type { Tenant } from '@/shared/types'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'

interface Props { tenant: Tenant }

const PRESET_COLORS = [
  '#E2A336', '#5CB870', '#3B82F6', '#8B5CF6',
  '#EC4899', '#EF4444', '#0891B2', '#D97706',
]

function MiniPreview({ primary, accent, theme, name }: {
  primary: string
  accent: string
  theme: 'dark' | 'light'
  name: string
}) {
  const isDark = theme === 'dark'
  const bg = isDark ? '#0C0A09' : '#FAF8F5'
  const surface = isDark ? '#1A1714' : '#FFFFFF'
  const surface2 = isDark ? '#231F1A' : '#F5F2ED'
  const text = isDark ? '#E8E0D4' : '#1A1714'
  const muted = isDark ? '#A89F91' : '#6B6358'
  const border = isDark ? 'rgba(214,198,172,0.07)' : 'rgba(60,50,38,0.08)'

  return (
    <div
      className="rounded-card overflow-hidden border w-full"
      style={{ backgroundColor: bg, borderColor: border, fontSize: '11px' }}
    >
      {/* Topbar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ backgroundColor: surface, borderColor: border }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="h-4 w-4 rounded"
            style={{ backgroundColor: primary }}
          />
          <span style={{ color: text, fontWeight: 600 }}>{name.slice(0, 16)}</span>
        </div>
        <button
          className="px-2 py-0.5 rounded text-white text-xs"
          style={{ backgroundColor: primary }}
        >
          + Novo
        </button>
      </div>
      {/* Content */}
      <div className="p-3" style={{ backgroundColor: bg }}>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {['R$ 12.340', '245 prod.', '38 pedidos'].map((v, i) => (
            <div
              key={i}
              className="rounded p-2 text-center"
              style={{ backgroundColor: surface2, border: `1px solid ${border}` }}
            >
              <p style={{ color: text, fontWeight: 600 }}>{v}</p>
              <p style={{ color: muted, fontSize: '9px' }}>
                {['Vendas', 'Produtos', 'Pedidos'][i]}
              </p>
            </div>
          ))}
        </div>
        <button
          className="w-full py-1.5 rounded text-white"
          style={{ backgroundColor: accent }}
        >
          Ver Relatório
        </button>
      </div>
    </div>
  )
}

export function TabBranding({ tenant }: Props) {
  const [primary, setPrimary] = useState(tenant.branding.primaryColor)
  const [accent, setAccent] = useState(tenant.branding.accentColor)
  const [theme, setTheme] = useState<'dark' | 'light'>(tenant.branding.defaultTheme)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 800))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl grid grid-cols-2 gap-6">
      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="bg-surface-1 border border-[var(--border)] rounded-card p-5">
          <h2 className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-4">
            Configuração
          </h2>

          {/* Primary */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Cor Primária
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="h-9 w-12 rounded-input cursor-pointer bg-surface-2 border border-[var(--border)] p-0.5"
              />
              <input
                type="text"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="h-9 flex-1 rounded-input bg-surface-2 border border-[var(--border)] px-3 text-sm font-mono text-fg outline-none focus:border-accent"
                maxLength={7}
              />
            </div>
            <div className="flex gap-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPrimary(c)}
                  className={cn(
                    'h-5 w-5 rounded-sm border-2 transition-transform',
                    primary === c ? 'border-fg scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Accent */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Cor de Acento
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="h-9 w-12 rounded-input cursor-pointer bg-surface-2 border border-[var(--border)] p-0.5"
              />
              <input
                type="text"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="h-9 flex-1 rounded-input bg-surface-2 border border-[var(--border)] px-3 text-sm font-mono text-fg outline-none focus:border-accent"
                maxLength={7}
              />
            </div>
          </div>

          {/* Theme */}
          <div className="flex flex-col gap-1.5 mb-5">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Tema Padrão
            </label>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
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

          <Button
            variant="primary"
            size="sm"
            className="w-full justify-center"
            icon={<Save className="h-3.5 w-3.5" />}
            onClick={handleSave}
          >
            {saved ? 'Salvo!' : 'Salvar branding'}
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div>
        <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-2">
          Preview ao vivo
        </p>
        <MiniPreview
          primary={primary}
          accent={accent}
          theme={theme}
          name={tenant.name}
        />
        <p className="text-xs text-fg-dim mt-2 text-center">
          Como o cliente verá o ERP dele
        </p>
      </div>
    </div>
  )
}
