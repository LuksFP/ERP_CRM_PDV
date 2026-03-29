import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminRole } from '@/modules/auth/store'

// ─── GRANULAR PERMISSIONS ─────────────────────────────────────────
export interface GranularPermissions {
  agenda: {
    view: boolean
    createTask: boolean
    markDone: boolean
    delegateTask: boolean
    deleteTask: boolean
    createEvent: boolean
  }
  serviceOrders: {
    view: boolean
    create: boolean
    comment: boolean
    changeStatus: boolean
    resolve: boolean
    assign: boolean
  }
  tenants: {
    view: boolean
    viewDetails: boolean
  }
  dashboard: {
    view: boolean
  }
}

// ─── PERMISSION LABELS (for UI) ────────────────────────────────────
export const PERMISSION_LABELS: Record<string, Record<string, string>> = {
  agenda: {
    view:         'Ver agenda',
    createTask:   'Criar tarefas',
    markDone:     'Marcar como concluído',
    delegateTask: 'Delegar tarefas',
    deleteTask:   'Excluir tarefas',
    createEvent:  'Criar eventos',
  },
  serviceOrders: {
    view:         'Ver ordens de serviço',
    create:       'Abrir nova OS',
    comment:      'Comentar em OS',
    changeStatus: 'Mudar status da OS',
    resolve:      'Resolver OS',
    assign:       'Reatribuir responsável',
  },
  tenants: {
    view:        'Ver lista de tenants',
    viewDetails: 'Ver detalhes do tenant',
  },
  dashboard: {
    view: 'Ver dashboard',
  },
}

export const SECTION_LABELS: Record<keyof GranularPermissions, string> = {
  agenda:        'Agenda',
  serviceOrders: 'Ordens de Serviço',
  tenants:       'Tenants',
  dashboard:     'Dashboard',
}

// ─── DEFAULTS BY ROLE ─────────────────────────────────────────────
export const DEFAULT_PERMISSIONS: Record<AdminRole, GranularPermissions> = {
  superadmin: {
    agenda:        { view: true,  createTask: true,  markDone: true,  delegateTask: true,  deleteTask: true,  createEvent: true  },
    serviceOrders: { view: true,  create: true,  comment: true,  changeStatus: true,  resolve: true,  assign: true  },
    tenants:       { view: true,  viewDetails: true  },
    dashboard:     { view: true  },
  },
  support: {
    agenda:        { view: true,  createTask: true,  markDone: true,  delegateTask: false, deleteTask: false, createEvent: true  },
    serviceOrders: { view: true,  create: true,  comment: true,  changeStatus: true,  resolve: true,  assign: false },
    tenants:       { view: true,  viewDetails: true  },
    dashboard:     { view: true  },
  },
  technician: {
    agenda:        { view: true,  createTask: true,  markDone: true,  delegateTask: false, deleteTask: false, createEvent: false },
    serviceOrders: { view: true,  create: false, comment: true,  changeStatus: true,  resolve: true,  assign: false },
    tenants:       { view: false, viewDetails: false },
    dashboard:     { view: false },
  },
  sales: {
    agenda:        { view: false, createTask: false, markDone: false, delegateTask: false, deleteTask: false, createEvent: false },
    serviceOrders: { view: false, create: false, comment: false, changeStatus: false, resolve: false, assign: false },
    tenants:       { view: true,  viewDetails: false },
    dashboard:     { view: true  },
  },
}

// ─── TEAM MEMBER ──────────────────────────────────────────────────
export interface TeamMember {
  id: string
  name: string
  email: string
  role: AdminRole
  permissions: GranularPermissions
  status: 'active' | 'inactive'
  createdAt: string
}

// ─── STORE ────────────────────────────────────────────────────────
interface TeamStore {
  members: TeamMember[]
  addMember: (m: Omit<TeamMember, 'id' | 'createdAt'>) => void
  updateMember: (id: string, patch: Partial<TeamMember>) => void
  setPermission: <S extends keyof GranularPermissions>(
    id: string, section: S, key: keyof GranularPermissions[S], value: boolean
  ) => void
  toggleStatus: (id: string) => void
  removeMember: (id: string) => void
}

const INITIAL_MEMBERS: TeamMember[] = [
  { id: 'admin_001', name: 'Admin Geral',      email: 'admin@erp.com',    role: 'superadmin',  permissions: DEFAULT_PERMISSIONS.superadmin,  status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'admin_002', name: 'Suporte Técnico',  email: 'suporte@erp.com',  role: 'support',     permissions: DEFAULT_PERMISSIONS.support,     status: 'active', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'admin_003', name: 'Vendas Team',      email: 'vendas@erp.com',   role: 'sales',       permissions: DEFAULT_PERMISSIONS.sales,       status: 'active', createdAt: '2024-02-15T00:00:00Z' },
  { id: 'admin_004', name: 'Técnico João',     email: 'tecnico@erp.com',  role: 'technician',  permissions: DEFAULT_PERMISSIONS.technician,  status: 'active', createdAt: '2024-03-01T00:00:00Z' },
]

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      members: INITIAL_MEMBERS,

      addMember: (m) =>
        set((s) => ({
          members: [...s.members, { ...m, id: `admin_${Date.now()}`, createdAt: new Date().toISOString() }],
        })),

      updateMember: (id, patch) =>
        set((s) => ({ members: s.members.map(m => m.id === id ? { ...m, ...patch } : m) })),

      setPermission: (id, section, key, value) =>
        set((s) => ({
          members: s.members.map(m =>
            m.id !== id ? m : {
              ...m,
              permissions: {
                ...m.permissions,
                [section]: { ...m.permissions[section], [key]: value },
              },
            }
          ),
        })),

      toggleStatus: (id) =>
        set((s) => ({
          members: s.members.map(m =>
            m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m
          ),
        })),

      removeMember: (id) =>
        set((s) => ({ members: s.members.filter(m => m.id !== id) })),
    }),
    { name: 'admin-team' }
  )
)

// Hook: get current user's granular permissions from team store
export function useGranularPermissions(): GranularPermissions | null {
  // imported lazily to avoid circular dep — call inside components only
  return null
}
