import { useState } from 'react'
import {
  Building2, Palette, Users2, MapPin, CreditCard, Bell,
} from 'lucide-react'
import { useTenantConfig } from '@/shared/hooks/useTenantConfig'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useAuthStore } from '@/modules/auth/store'
import { MOCK_USERS, MOCK_BRANCHES } from '@/mock/configs'
import { formatRelative, roleLabels, moduleLabels, segmentLabels } from '@/shared/utils/formatters'
import { UsageLimitBar } from '@/shared/components/UsageLimitBar'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Tabs } from '@/shared/components/Tabs'
import { cn } from '@/shared/utils/cn'

const PRESET_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#C026D3', '#1D4ED8']

function TabBusiness() {
  const config = useTenantConfig()
  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle">Informações da Empresa</p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nome da empresa" defaultValue={config.branding.name} />
          <Input label="Slug" defaultValue={config.branding.slug} hint="Identificador único" />
          <Input label="Segmento" defaultValue={segmentLabels[config.segment]} disabled />
          <Input label="CNPJ" placeholder="00.000.000/0001-00" />
        </div>
      </div>
      <Button size="sm">Salvar Alterações</Button>
    </div>
  )
}

function TabBranding() {
  const config = useTenantConfig()
  const updateConfig = useAuthStore((s) => s.updateConfig)
  const [primary, setPrimary] = useState(config.branding.primaryColor)
  const [accent, setAccent] = useState(config.branding.accentColor)

  const handleSave = () => {
    updateConfig({ branding: { ...config.branding, primaryColor: primary, accentColor: accent } })
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle">Cor Principal</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setPrimary(c)}
              className={cn('w-9 h-9 rounded-lg transition-all', primary === c && 'ring-2 ring-offset-2 ring-current scale-110')}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)}
            className="w-12 h-9 rounded border border-border p-1 bg-surface-1 cursor-pointer" />
          <Input value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-28 font-mono" />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle">Cor de Destaque</p>
        <div className="flex items-center gap-3">
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)}
            className="w-12 h-9 rounded border border-border p-1 bg-surface-1 cursor-pointer" />
          <Input value={accent} onChange={(e) => setAccent(e.target.value)} className="w-28 font-mono" />
        </div>
      </div>

      {/* Live preview */}
      <div className="p-4 rounded-lg border border-border space-y-2">
        <p className="text-xs text-ink-subtle">Preview</p>
        <button
          className="px-4 py-2 rounded text-sm font-semibold transition-all"
          style={{ background: primary, color: 'white', boxShadow: `0 2px 12px ${primary}40` }}
        >
          Botão principal
        </button>
        <div className="h-2 rounded-full" style={{ background: `linear-gradient(to right, ${primary}, ${accent})` }} />
      </div>

      <Button size="sm" onClick={handleSave}>Aplicar Cores</Button>
    </div>
  )
}

function TabTeam() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle">Usuários Ativos</p>
        <UsageLimitBar resource="users" label="" className="w-40" />
      </div>
      <div className="bg-surface-0 border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-1">
              {['NOME', 'E-MAIL', 'FUNÇÃO', 'FILIAL', 'ÚLTIMO ACESSO', 'STATUS'].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-ink-subtle">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((user, i) => (
              <tr key={user.id} className={cn('border-b border-border/50 hover:bg-surface-1 transition-colors', i % 2 === 0 ? 'bg-surface-0' : 'bg-surface-0/50')}>
                <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                <td className="px-4 py-3 text-ink-muted">{user.email}</td>
                <td className="px-4 py-3"><Badge variant="accent">{roleLabels[user.role]}</Badge></td>
                <td className="px-4 py-3 text-ink-muted">{user.branchName ?? '—'}</td>
                <td className="px-4 py-3 text-ink-muted text-xs">{formatRelative(user.lastLoginAt)}</td>
                <td className="px-4 py-3">
                  <Badge variant={user.status === 'active' ? 'success' : 'neutral'}>
                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button size="sm" leftIcon={<Users2 size={14} />}>Convidar Usuário</Button>
    </div>
  )
}

function TabBranches() {
  return (
    <div className="space-y-4">
      <UsageLimitBar resource="branches" label="Filiais" className="w-56" />
      <div className="space-y-3">
        {MOCK_BRANCHES.map((branch) => (
          <div key={branch.id} className="bg-surface-0 border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-[var(--accent)]" />
                <span className="font-semibold text-ink">{branch.name}</span>
                {branch.isMain && <Badge variant="accent">Principal</Badge>}
              </div>
              <span className="text-xs text-ink-muted">{branch.userCount} usuários</span>
            </div>
            <p className="text-sm text-ink-muted">{branch.address}</p>
            {/* PDVs */}
            <div className="space-y-1.5">
              {branch.pdvs.map((pdv) => (
                <div key={pdv.id} className="flex items-center gap-2 text-xs">
                  <div className={cn('w-1.5 h-1.5 rounded-full', pdv.status === 'online' ? 'bg-emerald-500' : pdv.status === 'delayed' ? 'bg-amber-500' : 'bg-red-500')} />
                  <span className="font-mono text-ink">PDV-{String(pdv.number).padStart(2, '0')}</span>
                  <span className="text-ink-muted">{pdv.currentOperator ?? 'Sem operador'}</span>
                  <span className="ml-auto font-mono text-ink-subtle">v{pdv.appVersion}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Button size="sm" leftIcon={<MapPin size={14} />} variant="outline">Nova Filial</Button>
    </div>
  )
}

function TabPlan() {
  const config = useTenantConfig()
  const { plan, modules } = config

  return (
    <div className="space-y-5 max-w-lg">
      <div className="p-4 bg-[var(--accent-dim)] border border-[var(--accent)]/20 rounded-lg">
        <p className="text-xs font-mono uppercase tracking-widest text-[var(--accent)] mb-1">Plano Atual</p>
        <p className="text-2xl font-bold text-ink">{plan.name}</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle">Utilização</p>
        <UsageLimitBar resource="users" label="Usuários" />
        <UsageLimitBar resource="pdvs" label="PDVs" />
        <UsageLimitBar resource="branches" label="Filiais" />
        <UsageLimitBar resource="products" label="Produtos (SKU)" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle">Módulos</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(moduleLabels) as (keyof typeof moduleLabels)[]).map((mod) => {
            const enabled = modules.enabled.includes(mod)
            const locked = modules.locked.includes(mod)
            return (
              <div key={mod} className={cn('flex items-center gap-2 p-2.5 rounded-lg border text-sm', enabled ? 'border-[var(--accent)]/30 bg-[var(--accent-dim)]' : locked ? 'border-border bg-surface-1 opacity-60' : 'border-border bg-surface-1 opacity-40')}>
                <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', enabled ? 'bg-emerald-500' : locked ? 'bg-amber-500' : 'bg-surface-3')} />
                <span className={cn('text-xs', enabled ? 'text-ink font-medium' : 'text-ink-muted')}>{moduleLabels[mod]}</span>
              </div>
            )
          })}
        </div>
      </div>

      <Button leftIcon={<CreditCard size={14} />} variant="primary" size="sm">
        Fazer Upgrade
      </Button>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [tab, setTab] = useState('business')
  const { isOwner } = usePermissions()

  const tabs = [
    { id: 'business', label: 'Empresa',    icon: <Building2 size={14} /> },
    { id: 'branding', label: 'Visual',     icon: <Palette size={14} /> },
    { id: 'team',     label: 'Equipe',     icon: <Users2 size={14} /> },
    { id: 'branches', label: 'Filiais',    icon: <MapPin size={14} /> },
    { id: 'plan',     label: 'Plano',      icon: <CreditCard size={14} /> },
    { id: 'notify',   label: 'Notificações', icon: <Bell size={14} /> },
  ].filter((t) => isOwner || ['team', 'notify'].includes(t.id))

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Configurações</h1>
        <p className="text-sm text-ink-muted mt-0.5">Gerencie sua empresa e preferências</p>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="pt-2">
        {tab === 'business' && <TabBusiness />}
        {tab === 'branding' && <TabBranding />}
        {tab === 'team'     && <TabTeam />}
        {tab === 'branches' && <TabBranches />}
        {tab === 'plan'     && <TabPlan />}
        {tab === 'notify'   && (
          <div className="text-sm text-ink-muted">Configurações de notificações em breve.</div>
        )}
      </div>
    </div>
  )
}
