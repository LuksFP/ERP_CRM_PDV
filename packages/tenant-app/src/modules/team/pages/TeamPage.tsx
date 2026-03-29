import { useState, useMemo } from 'react'
import {
  Search, UserPlus, MoreVertical, Mail, Phone,
  CheckCircle2, XCircle, ShieldCheck, ChevronDown,
} from 'lucide-react'
import { MOCK_USERS } from '@/mock/configs'
import { roleLabels, formatRelative } from '@/shared/utils/formatters'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { EmptyState } from '@/shared/components/EmptyState'
import { cn } from '@/shared/utils/cn'
import type { TenantUser, TenantRole } from '@/shared/types'

// Flatten the tree for display
function flattenUsers(users: TenantUser[]): TenantUser[] {
  const result: TenantUser[] = []
  for (const u of users) {
    result.push(u)
    if (u.children) result.push(...flattenUsers(u.children))
  }
  return result
}

const ALL_USERS = flattenUsers(MOCK_USERS)

const ROLE_COLORS: Record<TenantRole, string> = {
  owner:       'bg-[var(--accent-dim)] text-[var(--accent)] border-[rgba(226,163,54,0.2)]',
  manager:     'bg-[rgba(92,184,112,0.12)] text-[var(--green)] border-[rgba(92,184,112,0.2)]',
  financial:   'bg-[rgba(91,130,255,0.12)] text-[#7B9EFF] border-[rgba(91,130,255,0.2)]',
  seller:      'bg-[rgba(130,200,240,0.12)] text-[#7BC4E8] border-[rgba(130,200,240,0.2)]',
  stock_clerk: 'bg-[rgba(180,140,255,0.12)] text-[#C4A5FF] border-[rgba(180,140,255,0.2)]',
  cashier:     'bg-surface-3 text-ink-muted border-border',
}

const ROLE_FILTER_OPTIONS: Array<{ value: TenantRole | 'all'; label: string }> = [
  { value: 'all', label: 'Todos os perfis' },
  { value: 'owner', label: 'Proprietário' },
  { value: 'manager', label: 'Gerente' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'seller', label: 'Vendedor' },
  { value: 'stock_clerk', label: 'Estoquista' },
  { value: 'cashier', label: 'Operador de Caixa' },
]

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div
      className="shrink-0 flex items-center justify-center font-bold"
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'var(--accent-dim)',
        border: '1px solid rgba(226,163,54,0.18)',
        color: 'var(--accent)',
        fontSize: size * 0.38,
        fontFamily: 'Geist',
        fontWeight: 700,
      }}
    >
      {initial}
    </div>
  )
}

export default function TeamPage() {
  const { hasRole, isOwner } = usePermissions()
  const canManage = hasRole('manager')

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<TenantRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return ALL_USERS.filter((u) => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [search, roleFilter, statusFilter])

  const stats = {
    total: ALL_USERS.length,
    active: ALL_USERS.filter((u) => u.status === 'active').length,
    inactive: ALL_USERS.filter((u) => u.status === 'inactive').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-ink">Equipe</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {stats.total} membros · {stats.active} ativos
          </p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => {}}>
            <UserPlus size={14} className="mr-1.5" />
            Convidar membro
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'var(--accent)' },
          { label: 'Ativos', value: stats.active, color: 'var(--green)' },
          { label: 'Inativos', value: stats.inactive, color: 'var(--fg-muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-surface-1 border border-border rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="text-2xl font-bold" style={{ color, fontFamily: 'Geist Mono' }}>{value}</span>
            <span className="text-sm text-ink-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            iconLeft={<Search size={14} />}
          />
        </div>

        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as TenantRole | 'all')}
            className={cn(
              'appearance-none h-9 pl-3 pr-8 text-sm bg-surface-1 border border-border rounded-[6px]',
              'text-ink-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]',
              'transition-colors cursor-pointer hover:border-border-hover',
            )}
          >
            {ROLE_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className={cn(
              'appearance-none h-9 pl-3 pr-8 text-sm bg-surface-1 border border-border rounded-[6px]',
              'text-ink-muted focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]',
              'transition-colors cursor-pointer hover:border-border-hover',
            )}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={20} />}
          title="Nenhum membro encontrado"
          description="Tente ajustar os filtros de busca."
          action={{ label: 'Limpar filtros', onClick: () => { setSearch(''); setRoleFilter('all'); setStatusFilter('all') } }}
        />
      ) : (
        <div className="bg-surface-1 border border-border rounded-lg overflow-hidden">
          {/* Table head */}
          <div
            className="grid text-[10px] font-mono uppercase tracking-widest text-ink-subtle px-4 border-b border-border"
            style={{ gridTemplateColumns: '1fr 160px 160px 120px 80px', height: 36, alignItems: 'center' }}
          >
            <span>Membro</span>
            <span>Perfil</span>
            <span>Filial</span>
            <span>Último acesso</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.map((user) => (
            <div
              key={user.id}
              className="grid items-center px-4 py-3 border-b border-border last:border-0 hover:bg-surface-2 transition-colors group"
              style={{ gridTemplateColumns: '1fr 160px 160px 120px 80px' }}
            >
              {/* Name + email */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={user.name} size={32} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                    {user.status === 'active'
                      ? <CheckCircle2 size={12} className="shrink-0 text-[var(--green)]" />
                      : <XCircle size={12} className="shrink-0 text-ink-subtle" />
                    }
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mail size={10} className="text-ink-subtle shrink-0" />
                    <span className="text-xs text-ink-muted truncate">{user.email}</span>
                    {user.phone && (
                      <>
                        <Phone size={10} className="text-ink-subtle shrink-0 ml-1" />
                        <span className="text-xs text-ink-muted">{user.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Role badge */}
              <div>
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border',
                  ROLE_COLORS[user.role],
                )}>
                  {user.role === 'owner' && <ShieldCheck size={10} />}
                  {roleLabels[user.role]}
                </span>
              </div>

              {/* Branch */}
              <div className="text-sm text-ink-muted truncate">
                {user.branchName ?? <span className="text-ink-subtle text-xs italic">Todas as filiais</span>}
              </div>

              {/* Last login */}
              <div className="text-xs text-ink-muted">
                {formatRelative(user.lastLoginAt)}
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                {canManage && user.role !== 'owner' && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-surface-3 text-ink-muted hover:text-ink transition-all"
                    >
                      <MoreVertical size={14} />
                    </button>
                    {openMenu === user.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                        <div className="absolute right-0 top-full mt-1 w-40 bg-surface-0 border border-border rounded-lg shadow-lg z-20 overflow-hidden py-1">
                          <button className="w-full px-3 py-1.5 text-sm text-ink-muted hover:text-ink hover:bg-surface-2 text-left transition-colors">
                            Editar perfil
                          </button>
                          <button className="w-full px-3 py-1.5 text-sm text-ink-muted hover:text-ink hover:bg-surface-2 text-left transition-colors">
                            {user.status === 'active' ? 'Desativar' : 'Reativar'}
                          </button>
                          {isOwner && (
                            <button className="w-full px-3 py-1.5 text-sm text-[var(--red)] hover:bg-surface-2 text-left transition-colors">
                              Remover
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
