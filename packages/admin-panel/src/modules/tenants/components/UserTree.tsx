import { useState } from 'react'
import { ChevronRight, ChevronDown, MoreHorizontal, KeyRound, UserX, MoveRight } from 'lucide-react'
import type { TenantUser, TenantRole } from '@/shared/types'
import { roleLabels, formatRelativeTime } from '@/shared/utils/format'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'

interface UserNodeProps {
  user: TenantUser
  depth?: number
}

const roleVariants: Record<TenantRole, 'default' | 'success' | 'info' | 'neutral' | 'warning'> = {
  owner: 'default',
  manager: 'info',
  cashier: 'neutral',
  stock_clerk: 'neutral',
  seller: 'success',
  financial: 'warning',
}

function UserNode({ user, depth = 0 }: UserNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const hasChildren = (user.children?.length ?? 0) > 0

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-2 py-2 px-3 rounded-btn hover:bg-surface-2 transition-colors',
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {/* Expand/collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'h-4 w-4 flex items-center justify-center text-fg-dim',
            !hasChildren && 'invisible'
          )}
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        {/* Avatar */}
        <div className="h-6 w-6 rounded-full bg-surface-3 flex items-center justify-center shrink-0">
          <span className="text-2xs font-semibold text-fg-muted">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-medium text-fg truncate">{user.name}</span>
          <Badge variant={roleVariants[user.role]} size="sm">
            {roleLabels[user.role]}
          </Badge>
          {user.branchName && (
            <span className="text-2xs text-fg-dim truncate">— {user.branchName}</span>
          )}
          {user.status === 'inactive' && (
            <Badge variant="danger" size="sm">Inativo</Badge>
          )}
        </div>

        {/* Last login */}
        <span className="text-2xs text-fg-dim hidden group-hover:inline-block">
          {formatRelativeTime(user.lastLoginAt)}
        </span>

        {/* Actions */}
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            icon={<MoreHorizontal className="h-3.5 w-3.5" />}
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-surface-2 border border-[var(--border)] rounded-card shadow-lg py-1">
                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-fg-muted hover:text-fg hover:bg-surface-3">
                  <KeyRound className="h-3.5 w-3.5" />
                  Resetar senha
                </button>
                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-fg-muted hover:text-fg hover:bg-surface-3">
                  <MoveRight className="h-3.5 w-3.5" />
                  Transferir filial
                </button>
                <div className="h-px bg-[var(--border)] my-1" />
                <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red hover:bg-red/5">
                  <UserX className="h-3.5 w-3.5" />
                  Desativar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {user.children?.map((child) => (
            <UserNode key={child.id} user={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

interface UserTreeProps {
  users: TenantUser[]
}

export function UserTree({ users }: UserTreeProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {users.map((user) => (
        <UserNode key={user.id} user={user} />
      ))}
    </div>
  )
}
