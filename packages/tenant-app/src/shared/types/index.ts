// ─── ASYNC STATE (discriminated union) ──────────────────────────
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

// ─── ROLES ──────────────────────────────────────────────────────
export type TenantRole =
  | 'owner'
  | 'manager'
  | 'cashier'
  | 'stock_clerk'
  | 'seller'
  | 'financial'

export type ModuleKey =
  | 'dashboard'
  | 'inventory'
  | 'pdv'
  | 'crm'
  | 'financial'
  | 'fiscal'
  | 'purchasing'
  | 'settings'

export type SegmentType =
  | 'pharmacy'
  | 'supermarket'
  | 'bakery'
  | 'butcher'
  | 'restaurant'
  | 'clothing'
  | 'electronics'
  | 'other'

// ─── PLAN LIMITS ─────────────────────────────────────────────────
export interface PlanLimits {
  maxUsers: number         // 9999 = ilimitado
  maxPDVs: number
  maxBranches: number
  maxProductsSKU: number   // 0 = ilimitado
  modules: ModuleKey[]
  customFieldsEnabled: boolean
  apiAccess: boolean
  supportLevel: 'email' | 'chat' | 'priority'
}

// ─── CUSTOM FIELDS ───────────────────────────────────────────────
export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea'
export type CustomFieldEntity = 'product' | 'contact' | 'sale'

export interface CustomFieldDefinition {
  key: string
  label: string
  type: CustomFieldType
  required: boolean
  options?: string[]
  entityType: CustomFieldEntity
}

// ─── TENANT CONFIG (loaded on login) ────────────────────────────
export interface TenantBranding {
  name: string
  slug: string
  logo: string | null
  primaryColor: string
  accentColor: string
  darkMode: boolean
}

export interface TenantModules {
  enabled: ModuleKey[]
  disabled: ModuleKey[]
  locked: ModuleKey[]   // in plan catalog but not this plan — show padlock
}

export interface PDVConfig {
  requiresPrescription?: boolean
  batchTracking?: boolean
  expirationDateRequired?: boolean
  weightRequired?: boolean
  gradeTracking?: boolean
  serviceSchedule?: boolean
}

export interface TenantUsage {
  currentUsers: number
  currentPDVs: number
  currentBranches: number
  currentProducts: number
}

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: TenantRole
  branchId: string | null
  branchName: string | null
  permissions: string[]
  isImpersonation?: boolean
}

export interface TenantConfig {
  branding: TenantBranding
  segment: SegmentType
  plan: {
    name: string
    limits: PlanLimits
  }
  usage: TenantUsage
  modules: TenantModules
  pdv: PDVConfig
  customFields: Partial<Record<CustomFieldEntity, CustomFieldDefinition[]>>
  dashboard: { widgets: DashboardWidget[] }
  onboardingCompleted: boolean
  currentUser: CurrentUser
}

// ─── DASHBOARD WIDGETS ───────────────────────────────────────────
export type WidgetType =
  | 'sales_today'
  | 'ticket_avg'
  | 'low_stock'
  | 'expiring_soon'
  | 'pdv_status'
  | 'top_products'
  | 'cashflow_mini'
  | 'pending_orders'
  | 'crm_pipeline'
  | 'recent_sales'

export interface DashboardWidget {
  id: string
  type: WidgetType
  x: number
  y: number
  w: number
  h: number
}

// ─── PRODUCT ─────────────────────────────────────────────────────
export interface Product {
  id: string
  sku: string
  name: string
  category: string
  categoryId: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  unit: 'un' | 'kg' | 'g' | 'l' | 'ml' | 'cx' | 'pct'
  barcode: string | null
  isWeighable: boolean
  isActive: boolean
  customFields: Record<string, unknown>
  // pharmacy
  batch?: string
  expiryDate?: string
  anvisaReg?: string
  // clothing
  sizes?: string[]
  // electronics
  serialNumber?: string
  warrantyMonths?: number
}

export interface Category {
  id: string
  name: string
  parentId: string | null
  children?: Category[]
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  performedBy: string
  createdAt: string
}

// ─── SALE ─────────────────────────────────────────────────────────
export type PaymentMethod = 'cash' | 'card_debit' | 'card_credit' | 'pix' | 'voucher'

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
  batch?: string
  customFields?: Record<string, unknown>
}

export interface Sale {
  id: string
  number: number
  status: 'open' | 'completed' | 'cancelled'
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  cashRegisterId: string
  operatorId: string
  operatorName: string
  customerId: string | null
  createdAt: string
}

// ─── CASH REGISTER ───────────────────────────────────────────────
export interface CashRegister {
  id: string
  pdvNumber: number
  branchId: string
  status: 'closed' | 'open'
  openingBalance: number
  currentBalance: number
  operatorId: string | null
  operatorName: string | null
  openedAt: string | null
  closedAt: string | null
}

// ─── BRANCH & PDV ────────────────────────────────────────────────
export type PDVStatus = 'online' | 'delayed' | 'offline'

export interface PDVDevice {
  id: string
  number: number
  branchId: string
  status: PDVStatus
  lastSyncAt: string | null
  currentOperator: string | null
  appVersion: string
  activationCode?: string
}

export interface Branch {
  id: string
  name: string
  isMain: boolean
  address: string
  phone: string
  managerId: string | null
  managerName: string | null
  pdvs: PDVDevice[]
  userCount: number
}

// ─── USER ────────────────────────────────────────────────────────
export interface TenantUser {
  id: string
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

// ─── CRM ─────────────────────────────────────────────────────────
export type DealStage = 'lead' | 'contact' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface Deal {
  id: string
  title: string
  contactId: string
  contactName: string
  value: number
  stage: DealStage
  assignedTo: string
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  document: string | null
  tags: string[]
  totalPurchases: number
  lastPurchaseAt: string | null
  customFields: Record<string, unknown>
  createdAt: string
}

// ─── FINANCIAL ───────────────────────────────────────────────────
export type TransactionType = 'receivable' | 'payable'
export type TransactionStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export interface Transaction {
  id: string
  type: TransactionType
  description: string
  amount: number
  dueDate: string
  paidAt: string | null
  status: TransactionStatus
  category: string
  contactName: string | null
  notes: string | null
}
