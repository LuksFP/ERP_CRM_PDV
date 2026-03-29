// ─── ROLES ───────────────────────────────────────────────────────────────────
export type TenantRole =
  | 'owner'
  | 'manager'
  | 'cashier'
  | 'stock_clerk'
  | 'seller'
  | 'financial'

export type AdminRole =
  | 'superadmin'
  | 'support'
  | 'sales'
  | 'technician'

export type ModuleKey =
  | 'dashboard'
  | 'inventory'
  | 'pdv'
  | 'crm'
  | 'financial'
  | 'fiscal'
  | 'purchasing'
  | 'team'
  | 'branches'
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

export type PlanName = 'Starter' | 'Professional' | 'Enterprise'

// ─── PLAN ────────────────────────────────────────────────────────────────────
export interface PlanLimits {
  maxUsers: number         // 9999 = unlimited
  maxPDVs: number
  maxBranches: number
  maxProductsSKU: number   // 0 = unlimited
  modules: ModuleKey[]
  customFieldsEnabled: boolean
  apiAccess: boolean
  supportLevel: 'email' | 'chat' | 'priority'
}

// ─── CUSTOM FIELDS ───────────────────────────────────────────────────────────
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

// ─── PRODUCT ─────────────────────────────────────────────────────────────────
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
  batch?: string
  expiryDate?: string
  anvisaReg?: string
  sizes?: string[]
  serialNumber?: string
  warrantyMonths?: number
}

export interface Category {
  id: string
  name: string
  parentId: string | null
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

// ─── SALE ─────────────────────────────────────────────────────────────────────
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
  tenantId: string
  branchId: string
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

// ─── CASH REGISTER ────────────────────────────────────────────────────────────
export interface CashRegister {
  id: string
  pdvNumber: number
  branchId: string
  tenantId: string
  status: 'closed' | 'open'
  openingBalance: number
  currentBalance: number
  operatorId: string | null
  operatorName: string | null
  openedAt: string | null
  closedAt: string | null
}

// ─── BRANCH & PDV ────────────────────────────────────────────────────────────
export type PDVStatus = 'online' | 'delayed' | 'offline'

export interface PDVDevice {
  id: string
  number: number
  branchId: string
  tenantId: string
  status: PDVStatus
  lastSyncAt: string | null
  currentOperator: string | null
  appVersion: string
  activationCode?: string
}

export interface Branch {
  id: string
  tenantId: string
  name: string
  isMain: boolean
  address: string
  phone: string
  managerId: string | null
  managerName: string | null
  pdvs: PDVDevice[]
  userCount: number
}

// ─── USER ─────────────────────────────────────────────────────────────────────
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
}

// ─── CRM ──────────────────────────────────────────────────────────────────────
export type DealStage = 'lead' | 'contact' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface Deal {
  id: string
  tenantId: string
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
  tenantId: string
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

// ─── FINANCIAL ────────────────────────────────────────────────────────────────
export type TransactionType = 'receivable' | 'payable'
export type TransactionStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'

export interface Transaction {
  id: string
  tenantId: string
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

// ─── TENANT ───────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string
  name: string
  slug: string
  segment: SegmentType
  planName: PlanName
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  logoUrl: string | null
  primaryColor: string
  accentColor: string
  darkMode: boolean
  onboardingCompleted: boolean
  createdAt: string
  mrr: number
}

// ─── API RESPONSE ENVELOPE ───────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
}

export interface ApiListResponse<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}
