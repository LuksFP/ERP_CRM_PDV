import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotifType = 'pdv_offline' | 'tenant_created' | 'subscription_cancelled' | 'trial_expiring' | 'payment_failed' | 'support_ticket' | 'system'

export interface AdminNotification {
  id: string
  type: NotifType
  title: string
  message: string
  tenantName?: string
  tenantId?: string
  timestamp: string
  read: boolean
}

interface NotificationsStore {
  notifications: AdminNotification[]
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
}

const MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif_1',
    type: 'pdv_offline',
    title: 'PDV Offline',
    message: '2 terminais sem sincronizar há mais de 4h',
    tenantName: 'Mercado Bom Preço',
    tenantId: 'tenant_002',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
  },
  {
    id: 'notif_2',
    type: 'trial_expiring',
    title: 'Trial Expirando',
    message: 'Período trial termina em 3 dias',
    tenantName: 'Padaria Trigo de Ouro',
    tenantId: 'tenant_003',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
  },
  {
    id: 'notif_3',
    type: 'tenant_created',
    title: 'Novo Tenant',
    message: 'Novo cliente cadastrado no plano Starter',
    tenantName: 'Boutique Elegance',
    tenantId: 'tenant_007',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: 'notif_4',
    type: 'payment_failed',
    title: 'Pagamento Falhou',
    message: 'Cobrança recusada — cartão expirado',
    tenantName: 'Eletro Plus',
    tenantId: 'tenant_006',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
  {
    id: 'notif_5',
    type: 'subscription_cancelled',
    title: 'Assinatura Cancelada',
    message: 'Tenant solicitou cancelamento',
    tenantName: 'Moda Feminina',
    tenantId: 'tenant_005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
]

export const useNotificationsStore = create<NotificationsStore>()(
  persist(
    (set) => ({
      notifications: MOCK_NOTIFICATIONS,
      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      dismiss: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),
    }),
    { name: 'admin-notifications-v1' },
  ),
)
