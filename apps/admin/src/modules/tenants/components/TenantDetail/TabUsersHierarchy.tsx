import { useState } from 'react'
import { Plus, Users, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { MOCK_TENANT_USERS } from '@/mock/data'
import type { Tenant, TenantRole } from '@/shared/types'
import { roleLabels } from '@/shared/utils/format'
import { UserTree } from '../UserTree'
import { UsageBar } from '../UsageBar'
import { Button } from '@/shared/components/Button'
import { Tooltip } from '@/shared/components/Tooltip'
import { Spinner } from '@/shared/components/Spinner'
import { EmptyState } from '@/shared/components/EmptyState'

interface Props { tenant: Tenant }


export function TabUsersHierarchy({ tenant }: Props) {
  const [roleFilter, setRoleFilter] = useState<TenantRole | 'all'>('all')
  const atLimit = tenant.usage.users >= tenant.plan.limits.maxUsers

  const { data: users, isLoading } = useQuery({
    queryKey: ['tenant-users', tenant.id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
      return MOCK_TENANT_USERS[tenant.id] ?? []
    },
  })

  const roles: Array<TenantRole | 'all'> = ['all', 'owner', 'manager', 'cashier', 'stock_clerk', 'seller', 'financial']

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-48">
            <UsageBar
              label="Usuários"
              current={tenant.usage.users}
              limit={tenant.plan.limits.maxUsers}
            />
          </div>
        </div>

        <Tooltip
          content={atLimit ? 'Limite do plano atingido. Faça upgrade.' : 'Criar novo usuário'}
          side="top"
        >
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            disabled={atLimit}
          >
            Criar usuário
          </Button>
        </Tooltip>
      </div>

      {/* Role filter */}
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-2.5 h-7 rounded text-xs transition-colors ${
              roleFilter === role
                ? 'bg-accent-dim text-accent border border-accent/20'
                : 'bg-surface-2 text-fg-muted border border-[var(--border)] hover:border-[var(--border-hover)]'
            }`}
          >
            {role === 'all' ? 'Todos' : roleLabels[role]}
          </button>
        ))}
      </div>

      {/* User tree */}
      <div className="bg-surface-1 border border-[var(--border)] rounded-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-fg-dim" />
            <span className="text-xs font-mono uppercase tracking-wide text-fg-dim">
              Hierarquia de usuários
            </span>
          </div>
          <span className="text-xs text-fg-dim font-mono">
            {tenant.usage.users}/{tenant.plan.limits.maxUsers === 9999 ? '∞' : tenant.plan.limits.maxUsers} usuários
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Spinner />
          </div>
        ) : !users?.length ? (
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title="Nenhum usuário encontrado"
          />
        ) : (
          <div className="py-2">
            <UserTree users={users} />
          </div>
        )}
      </div>
    </div>
  )
}
