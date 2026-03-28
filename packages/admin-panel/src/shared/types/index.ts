// ─── ASYNC STATE ─────────────────────────────────────────────────
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

// ─── PLAN ────────────────────────────────────────────────────────
export type ModuleType =
  | 'stock'
  | 'pdv'
  | 'crm'
  | 'financial'
  | 'fiscal'
  | 'hr'
  | 'reports'
  | 'api'

export type SupportLevel = 'email' | 'chat' | 'priority'

export interface PlanLimits {
  maxUsers: number
  maxPDVs: number
  maxBranches: number
  maxProductsSKU: number
  modules: ModuleType[]
  customFieldsEnabled: boolean
  apiAccess: boolean
  supportLevel: SupportLevel
}

export interface Plan {
  id: string
  name: string
  slug: string
  priceMonthly: number
  description: string
  limits: PlanLimits
  tenantCount: number
  mrr: number
  isActive: boolean
  color: string
}

// ─── TENANT ──────────────────────────────────────────────────────
export type TenantStatus = 'active' | 'trial' | 'suspended' | 'cancelled'
export type SegmentType =
  | 'pharmacy'
  | 'supermarket'
  | 'bakery'
  | 'butcher'
  | 'restaurant'
  | 'clothing'
  | 'electronics'
  | 'other'

export interface TenantUsage {
  users: number
  pdvs: number
  branches: number
  productsSKU: number
}

export interface TenantBranding {
  logoUrl: string | null
  primaryColor: string
  accentColor: string
  defaultTheme: 'dark' | 'light'
}

export interface Tenant {
  id: string
  name: string
  slug: string
  cnpj: string | null
  cpf: string | null
  phone: string
  email: string
  segment: SegmentType
  status: TenantStatus
  planId: string
  plan: Plan
  usage: TenantUsage
  branding: TenantBranding
  mrr: number
  createdAt: string
  lastAccessAt: string | null
  lastPdvSyncAt: string | null
  trialEndsAt: string | null
}

// ─── USER (dentro do tenant) ────────────────────────────────────
export type TenantRole =
  | 'owner'
  | 'manager'
  | 'cashier'
  | 'stock_clerk'
  | 'seller'
  | 'financial'

export interface TenantUser {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string | null
  role: TenantRole
  branchId: string | null
  branchName: string | null
  status: 'active' | 'inactive'
  lastLoginAt: string | null
  createdAt: string
  children?: TenantUser[]
}

// ─── BRANCH & PDV ─────────────────────────────────────────────
export type PDVStatus = 'online' | 'offline' | 'maintenance'

export interface PDV {
  id: string
  branchId: string
  number: number
  status: PDVStatus
  lastSyncAt: string | null
  currentOperator: string | null
  appVersion: string
}

export interface Branch {
  id: string
  tenantId: string
  name: string
  isMain: boolean
  address: string
  managerId: string | null
  managerName: string | null
  pdvs: PDV[]
  createdAt: string
}

// ─── CUSTOM FIELDS ───────────────────────────────────────────────
export type CustomFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'boolean'
  | 'textarea'

export type CustomFieldEntity = 'product' | 'contact' | 'sale'

export interface CustomField {
  id: string
  tenantId: string
  entityType: CustomFieldEntity
  label: string
  key: string
  type: CustomFieldType
  required: boolean
  options: string[] | null
  createdAt: string
}

// ─── AUDIT LOG ───────────────────────────────────────────────────
export interface AuditLogEntry {
  id: string
  tenantId: string
  action: string
  performedBy: string
  performedByRole: 'admin' | TenantRole
  isImpersonation: boolean
  details: string
  ipAddress: string
  createdAt: string
}

// ─── ANALYTICS ───────────────────────────────────────────────────
export interface MRRDataPoint {
  month: string
  mrr: number
  growth: number
}

export interface SegmentDistribution {
  segment: SegmentType
  count: number
  mrr: number
}

export interface PlanDistribution {
  planName: string
  count: number
  mrr: number
}

export interface DashboardMetrics {
  totalMRR: number
  mrrGrowth: number
  activeTenants: number
  trialTenants: number
  suspendedTenants: number
  totalUsers: number
  pdvsOnline: number
  pdvsOffline: number
  churnRate: number
  upsellOpportunities: number
}

export interface ActivityEntry {
  id: string
  tenantName: string
  tenantId: string
  action: string
  description: string
  timestamp: string
  type: 'tenant_created' | 'plan_changed' | 'user_added' | 'pdv_offline' | 'impersonation' | 'subscription_cancelled'
}

export interface UpsellOpportunity {
  tenantId: string
  tenantName: string
  segment: SegmentType
  planName: string
  resource: 'users' | 'pdvs' | 'branches'
  current: number
  limit: number
  percentage: number
}

// ─── SEGMENT TEMPLATE ────────────────────────────────────────────
export interface SegmentTemplate {
  id: string
  type: SegmentType
  name: string
  description: string
  icon: string
  defaultModules: ModuleType[]
  customFieldsPreset: Array<{
    entityType: CustomFieldEntity
    label: string
    key: string
    type: CustomFieldType
    required: boolean
  }>
  tenantCount: number
}

// ─── SERVICE ORDERS ──────────────────────────────────────────────
export type ServiceOrderPriority = 'low' | 'medium' | 'high' | 'critical'
export type ServiceOrderStatus = 'open' | 'in_progress' | 'waiting_client' | 'resolved' | 'closed'

export interface ServiceOrderComment {
  id: string
  authorName: string
  text: string
  createdAt: string
}

export interface ServiceOrder {
  id: string
  number: string
  tenantId: string
  tenantName: string
  title: string
  description: string
  priority: ServiceOrderPriority
  status: ServiceOrderStatus
  assignedTo: { id: string; name: string }
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  comments: ServiceOrderComment[]
}

// ─── AGENDA ──────────────────────────────────────────────────────
export type AgendaItemType = 'task' | 'event' | 'reminder'
export type AgendaItemPriority = 'low' | 'medium' | 'high'

export interface AgendaItem {
  id: string
  title: string
  description?: string
  type: AgendaItemType
  done: boolean
  priority: AgendaItemPriority
  dueDate: string | null
  assignedTo: string
  tags: string[]
  createdAt: string
}
