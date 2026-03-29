import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Package, AlertTriangle, ShoppingCart,
  TrendingUp, Users, CheckCheck, Bell,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'

type NotifType = 'stock' | 'sale' | 'alert' | 'team' | 'financial'

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'stock',
    title: 'Estoque crítico',
    body: 'Paracetamol 750mg está com apenas 3 unidades em estoque.',
    time: '5 min atrás',
    read: false,
  },
  {
    id: 'n2',
    type: 'stock',
    title: 'Produto vencendo',
    body: 'Amoxicilina 250mg — lote LOT-2024-B vence em 3 dias.',
    time: '18 min atrás',
    read: false,
  },
  {
    id: 'n3',
    type: 'sale',
    title: 'Meta diária atingida',
    body: 'Vendas do dia superaram a meta de R$ 5.000. Parabéns!',
    time: '1 hora atrás',
    read: false,
  },
  {
    id: 'n4',
    type: 'alert',
    title: 'PDV Filial Norte offline',
    body: 'Terminal 1 da Filial Norte está sem sincronização há 4 horas.',
    time: '4 horas atrás',
    read: true,
  },
  {
    id: 'n5',
    type: 'team',
    title: 'Novo membro adicionado',
    body: 'Pedro Alves foi adicionado como Operador de Caixa na Filial Centro.',
    time: 'ontem',
    read: true,
  },
  {
    id: 'n6',
    type: 'financial',
    title: 'Conta a pagar vencendo',
    body: 'Boleto Fornecedor ABC — R$ 3.200,00 vence amanhã.',
    time: 'ontem',
    read: true,
  },
]

const TYPE_CONFIG: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  stock:     { icon: Package,       color: 'text-[var(--yellow)]', bg: 'bg-[rgba(212,168,74,0.12)]' },
  sale:      { icon: TrendingUp,    color: 'text-[var(--green)]',  bg: 'bg-[rgba(92,184,112,0.12)]' },
  alert:     { icon: AlertTriangle, color: 'text-[var(--red)]',    bg: 'bg-[rgba(212,100,74,0.12)]' },
  team:      { icon: Users,         color: 'text-[var(--accent)]', bg: 'bg-[var(--accent-dim)]' },
  financial: { icon: ShoppingCart,  color: 'text-[#7B9EFF]',       bg: 'bg-[rgba(91,130,255,0.12)]' },
}

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const unread = notifications.filter((n) => !n.read)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (!open) return null

  return createPortal(
    <>
      {/* Backdrop (click-away) */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel — positioned relative to header bell icon via fixed positioning */}
      <div
        className="fixed right-4 top-[57px] z-50 w-[360px] max-h-[calc(100vh-80px)] flex flex-col"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-ink-subtle" />
            <span className="text-sm font-semibold text-ink">Notificações</span>
            {unread.length > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold bg-[var(--accent)] text-white">
                {unread.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unread.length > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink px-2 py-1 rounded hover:bg-surface-2 transition-colors"
              >
                <CheckCheck size={12} />
                Marcar todas
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-surface-2 text-ink-subtle hover:text-ink transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center">
                <Bell size={18} className="text-ink-subtle" />
              </div>
              <p className="text-sm text-ink-muted">Tudo em dia! Sem notificações.</p>
            </div>
          ) : (
            <>
              {unread.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-ink-subtle">Não lidas</p>
                  {unread.map((n) => <NotifItem key={n.id} notif={n} onDismiss={dismiss} onMarkRead={(id) => setNotifications((prev) => prev.map((x) => x.id === id ? { ...x, read: true } : x))} />)}
                </div>
              )}
              {notifications.filter((n) => n.read).length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-ink-subtle border-t border-border mt-1">Anteriores</p>
                  {notifications.filter((n) => n.read).map((n) => <NotifItem key={n.id} notif={n} onDismiss={dismiss} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}

function NotifItem({
  notif,
  onDismiss,
  onMarkRead,
}: {
  notif: Notification
  onDismiss: (id: string) => void
  onMarkRead?: (id: string) => void
}) {
  const config = TYPE_CONFIG[notif.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-3 hover:bg-surface-2 transition-colors border-b border-border last:border-0 cursor-default',
        !notif.read && 'bg-[rgba(226,163,54,0.03)]',
      )}
      onClick={() => onMarkRead?.(notif.id)}
    >
      {/* Unread dot */}
      <div className="relative shrink-0 mt-0.5">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bg)}>
          <Icon size={14} className={config.color} />
        </div>
        {!notif.read && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-tight', notif.read ? 'text-ink-muted' : 'text-ink font-medium')}>
          {notif.title}
        </p>
        <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{notif.body}</p>
        <p className="text-[10px] text-ink-subtle mt-1 font-mono">{notif.time}</p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(notif.id) }}
        className="opacity-0 group-hover:opacity-100 self-start mt-0.5 p-0.5 rounded hover:bg-surface-3 text-ink-subtle hover:text-ink transition-all shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  )
}
