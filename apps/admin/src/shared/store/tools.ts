import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ServiceOrdersConfig {
  columns: {
    tenant: boolean
    title: boolean
    priority: boolean
    status: boolean
    assignedTo: boolean
    timeOpen: boolean
  }
  defaultStatusTab: 'all' | 'open' | 'in_progress' | 'resolved'
  defaultPriorityFilter: 'all' | 'critical' | 'high' | 'medium' | 'low'
}

export interface AgendaConfig {
  showCalendar: boolean
  showUpcoming: boolean
  showQuickCreate: boolean
  defaultFilter: 'all' | 'today' | 'week' | 'done'
}

interface ToolsStore {
  serviceOrders: ServiceOrdersConfig
  agenda: AgendaConfig
  setServiceOrders: (patch: Partial<ServiceOrdersConfig>) => void
  toggleColumn: (col: keyof ServiceOrdersConfig['columns']) => void
  setAgenda: (patch: Partial<AgendaConfig>) => void
  resetServiceOrders: () => void
  resetAgenda: () => void
}

const DEFAULT_SO: ServiceOrdersConfig = {
  columns: { tenant: true, title: true, priority: true, status: true, assignedTo: true, timeOpen: true },
  defaultStatusTab: 'all',
  defaultPriorityFilter: 'all',
}

const DEFAULT_AGENDA: AgendaConfig = {
  showCalendar: true,
  showUpcoming: true,
  showQuickCreate: true,
  defaultFilter: 'all',
}

export const useToolsStore = create<ToolsStore>()(
  persist(
    (set) => ({
      serviceOrders: DEFAULT_SO,
      agenda: DEFAULT_AGENDA,

      setServiceOrders: (patch) =>
        set((s) => ({ serviceOrders: { ...s.serviceOrders, ...patch } })),

      toggleColumn: (col) =>
        set((s) => ({
          serviceOrders: {
            ...s.serviceOrders,
            columns: { ...s.serviceOrders.columns, [col]: !s.serviceOrders.columns[col] },
          },
        })),

      setAgenda: (patch) =>
        set((s) => ({ agenda: { ...s.agenda, ...patch } })),

      resetServiceOrders: () => set({ serviceOrders: DEFAULT_SO }),
      resetAgenda: () => set({ agenda: DEFAULT_AGENDA }),
    }),
    { name: 'admin-tools' }
  )
)
