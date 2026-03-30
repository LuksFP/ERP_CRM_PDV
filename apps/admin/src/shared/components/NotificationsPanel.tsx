import { useEffect, useRef } from 'react'
import { X, Bell, AlertTriangle, UserPlus, XCircle, Clock, CreditCard, Headphones, CheckCheck, ExternalLink } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useNotificationsStore, type NotifType } from '../store/notifications'
import { Link } from '@tanstack/react-router'

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'agora'
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

const TYPE_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  pdv_offline:             { icon: AlertTriangle,  color: 'var(--red)',    bg: 'rgba(212,100,74,0.12)' },
  tenant_created:          { icon: UserPlus,       color: 'var(--green)',  bg: 'rgba(77,184,100,0.12)' },
  subscription_cancelled:  { icon: XCircle,        color: 'var(--red)',    bg: 'rgba(212,100,74,0.12)' },
  trial_expiring:          { icon: Clock,          color: 'var(--yellow)', bg: 'rgba(212,168,74,0.12)' },
  payment_failed:          { icon: CreditCard,     color: 'var(--red)',    bg: 'rgba(212,100,74,0.12)' },
  support_ticket:          { icon: Headphones,     color: 'var(--accent)', bg: 'var(--accent-dim)' },
  system:                  { icon: Bell,           color: 'var(--fg-dim)', bg: 'var(--surface-3)' },
}

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const { notifications, markRead, markAllRead, dismiss } = useNotificationsStore()
  const ref = useRef<HTMLDivElement>(null)
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 z-50 w-80 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border-hover)', maxHeight: 440 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Bell className="h-3.5 w-3.5" style={{ color: 'var(--fg-dim)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>Notificações</span>
          {unread > 0 && (
            <span className="flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--accent)' }}>
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button onClick={markAllRead} title="Marcar todas como lidas" className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded transition-colors hover:bg-surface-3" style={{ color: 'var(--fg-dim)' }}>
              <CheckCheck className="h-3 w-3" />
              Ler tudo
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded transition-colors hover:bg-surface-3" style={{ color: 'var(--fg-dim)' }}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Bell className="h-8 w-8 opacity-20" style={{ color: 'var(--fg-dim)' }} />
            <p className="text-sm" style={{ color: 'var(--fg-dim)' }}>Sem notificações</p>
          </div>
        ) : (
          notifications.map((n) => {
            const { icon: Icon, color, bg } = TYPE_META[n.type]
            return (
              <div
                key={n.id}
                className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-3 cursor-pointer"
                onClick={() => markRead(n.id)}
                style={{ background: n.read ? undefined : 'rgba(var(--accent-rgb,226,163,54),0.04)' }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5" style={{ background: bg }}>
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-xs font-semibold leading-tight', n.read ? 'opacity-70' : '')} style={{ color: 'var(--fg)' }}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono shrink-0" style={{ color: 'var(--fg-dim)' }}>{formatRelative(n.timestamp)}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(n.id) }}
                        className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--fg-dim)' }}
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--fg-muted)' }}>{n.message}</p>
                  {n.tenantName && (
                    <div className="flex items-center gap-1 mt-1">
                      <Link
                        to="/tenants/$tenantId"
                        params={{ tenantId: n.tenantId ?? '' }}
                        className="text-[10px] font-mono hover:underline flex items-center gap-0.5"
                        style={{ color: 'var(--accent)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {n.tenantName}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  )}
                </div>
                {!n.read && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--accent)' }} />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
