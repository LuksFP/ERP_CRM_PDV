import type {
  TenantConfig,
  Product,
  Branch,
  TenantUser,
  Sale,
  Deal,
  Contact,
  Transaction,
  StockMovement,
  Category,
} from '@/shared/types'

// ─── PHARMACY CONFIG ─────────────────────────────────────────────
export const PHARMACY_CONFIG: TenantConfig = {
  branding: {
    name: 'Farmácia Central Saúde',
    slug: 'farmacia-central-saude',
    logo: null,
    primaryColor: '#2563EB',
    accentColor: '#16A34A',
    darkMode: false,
  },
  segment: 'pharmacy',
  plan: {
    name: 'Professional',
    limits: {
      maxUsers: 15,
      maxPDVs: 3,
      maxBranches: 2,
      maxProductsSKU: 0,
      modules: ['dashboard', 'inventory', 'pdv', 'financial', 'fiscal', 'team', 'branches', 'settings'],
      customFieldsEnabled: true,
      apiAccess: false,
      supportLevel: 'chat',
    },
  },
  usage: { currentUsers: 7, currentPDVs: 2, currentBranches: 2, currentProducts: 1240 },
  modules: {
    enabled: ['dashboard', 'inventory', 'pdv', 'financial', 'fiscal', 'team', 'branches', 'settings'],
    disabled: [],
    locked: ['crm', 'purchasing'],
  },
  pdv: { requiresPrescription: true, batchTracking: true, expirationDateRequired: true },
  customFields: {
    product: [
      { key: 'anvisa_reg', label: 'Nº Registro ANVISA', type: 'text', required: false, entityType: 'product' },
      { key: 'batch', label: 'Lote', type: 'text', required: true, entityType: 'product' },
      { key: 'expiry_date', label: 'Data de Validade', type: 'date', required: true, entityType: 'product' },
      { key: 'controlled', label: 'Medicamento Controlado?', type: 'boolean', required: false, entityType: 'product' },
    ],
    sale: [
      { key: 'prescription_number', label: 'Nº da Receita', type: 'text', required: false, entityType: 'sale' },
    ],
  },
  dashboard: {
    widgets: [
      { id: 'w1', type: 'sales_today', x: 0, y: 0, w: 3, h: 2 },
      { id: 'w2', type: 'ticket_avg', x: 3, y: 0, w: 3, h: 2 },
      { id: 'w3', type: 'expiring_soon', x: 6, y: 0, w: 3, h: 2 },
      { id: 'w4', type: 'low_stock', x: 9, y: 0, w: 3, h: 2 },
      { id: 'w5', type: 'recent_sales', x: 0, y: 2, w: 8, h: 4 },
      { id: 'w6', type: 'pdv_status', x: 8, y: 2, w: 4, h: 4 },
    ],
  },
  onboardingCompleted: true,
  currentUser: {
    id: 'u001',
    name: 'Carlos Mendes',
    email: 'carlos@centralSaude.com.br',
    role: 'owner',
    branchId: null,
    branchName: null,
    permissions: ['*'],
  },
}

// ─── SUPERMARKET CONFIG ──────────────────────────────────────────
export const SUPERMARKET_CONFIG: TenantConfig = {
  branding: {
    name: 'Mercado Bom Preço',
    slug: 'mercado-bom-preco',
    logo: null,
    primaryColor: '#DC2626',
    accentColor: '#F59E0B',
    darkMode: true,
  },
  segment: 'supermarket',
  plan: {
    name: 'Enterprise',
    limits: {
      maxUsers: 9999,
      maxPDVs: 10,
      maxBranches: 5,
      maxProductsSKU: 0,
      modules: ['dashboard', 'inventory', 'pdv', 'crm', 'financial', 'fiscal', 'purchasing', 'team', 'branches', 'settings'],
      customFieldsEnabled: true,
      apiAccess: true,
      supportLevel: 'priority',
    },
  },
  usage: { currentUsers: 28, currentPDVs: 8, currentBranches: 3, currentProducts: 12500 },
  modules: {
    enabled: ['dashboard', 'inventory', 'pdv', 'crm', 'financial', 'fiscal', 'purchasing', 'team', 'branches', 'settings'],
    disabled: [],
    locked: [],
  },
  pdv: { weightRequired: true },
  customFields: {
    product: [
      { key: 'scale_code', label: 'Código de Balança', type: 'text', required: false, entityType: 'product' },
      { key: 'shelf_life_days', label: 'Vida Útil (dias)', type: 'number', required: false, entityType: 'product' },
    ],
  },
  dashboard: {
    widgets: [
      { id: 'w1', type: 'sales_today', x: 0, y: 0, w: 3, h: 2 },
      { id: 'w2', type: 'ticket_avg', x: 3, y: 0, w: 3, h: 2 },
      { id: 'w3', type: 'pdv_status', x: 6, y: 0, w: 3, h: 2 },
      { id: 'w4', type: 'pending_orders', x: 9, y: 0, w: 3, h: 2 },
      { id: 'w5', type: 'top_products', x: 0, y: 2, w: 6, h: 4 },
      { id: 'w6', type: 'cashflow_mini', x: 6, y: 2, w: 6, h: 4 },
    ],
  },
  onboardingCompleted: true,
  currentUser: {
    id: 'u002',
    name: 'Roberto Alves',
    email: 'roberto@bompreco.com.br',
    role: 'manager',
    branchId: 'b001',
    branchName: 'Filial Centro',
    permissions: ['inventory', 'pdv', 'crm', 'reports'],
  },
}

// ─── BAKERY CONFIG (onboarding NOT completed) ────────────────────
export const BAKERY_CONFIG: TenantConfig = {
  branding: {
    name: 'Padaria Trigo de Ouro',
    slug: 'padaria-trigo-de-ouro',
    logo: null,
    primaryColor: '#D97706',
    accentColor: '#92400E',
    darkMode: false,
  },
  segment: 'bakery',
  plan: {
    name: 'Starter',
    limits: {
      maxUsers: 5,
      maxPDVs: 1,
      maxBranches: 1,
      maxProductsSKU: 1000,
      modules: ['dashboard', 'inventory', 'pdv', 'settings'],
      customFieldsEnabled: false,
      apiAccess: false,
      supportLevel: 'email',
    },
  },
  usage: { currentUsers: 1, currentPDVs: 0, currentBranches: 0, currentProducts: 0 },
  modules: {
    enabled: ['dashboard', 'inventory', 'pdv', 'settings'],
    disabled: [],
    locked: ['crm', 'financial', 'fiscal', 'purchasing'],
  },
  pdv: {},
  customFields: {},
  dashboard: {
    widgets: [
      { id: 'w1', type: 'sales_today', x: 0, y: 0, w: 4, h: 2 },
      { id: 'w2', type: 'low_stock', x: 4, y: 0, w: 4, h: 2 },
      { id: 'w3', type: 'pdv_status', x: 8, y: 0, w: 4, h: 2 },
      { id: 'w4', type: 'recent_sales', x: 0, y: 2, w: 12, h: 4 },
    ],
  },
  onboardingCompleted: false,
  currentUser: {
    id: 'u003',
    name: 'João Oliveira',
    email: 'joao@trigodeouro.com.br',
    role: 'owner',
    branchId: null,
    branchName: null,
    permissions: ['*'],
  },
}

// ─── MOCK PRODUCTS ────────────────────────────────────────────────
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p001', sku: 'DIP500', name: 'Dipirona Sódica 500mg 20cp', category: 'Analgésicos',
    categoryId: 'cat001', price: 8.90, costPrice: 4.20, stock: 150, minStock: 30,
    unit: 'cx', barcode: '7891000100103', isWeighable: false, isActive: true,
    customFields: {}, batch: 'LOT-2024-A', expiryDate: '2025-08-15', anvisaReg: '1.0280.0040.003-1',
  },
  {
    id: 'p002', sku: 'AMO250', name: 'Amoxicilina 250mg/5ml Suspensão', category: 'Antibióticos',
    categoryId: 'cat002', price: 18.50, costPrice: 9.80, stock: 22, minStock: 20,
    unit: 'cx', barcode: '7891000200104', isWeighable: false, isActive: true,
    customFields: {}, batch: 'LOT-2024-B', expiryDate: '2024-03-01', anvisaReg: '1.0455.0028.001-5',
  },
  {
    id: 'p003', sku: 'IBU600', name: 'Ibuprofeno 600mg 20cp', category: 'Analgésicos',
    categoryId: 'cat001', price: 12.40, costPrice: 6.50, stock: 88, minStock: 25,
    unit: 'cx', barcode: '7891000300105', isWeighable: false, isActive: true,
    customFields: {}, batch: 'LOT-2024-C', expiryDate: '2025-12-20',
  },
  {
    id: 'p004', sku: 'OME20', name: 'Omeprazol 20mg 28cp', category: 'Gastrointestinal',
    categoryId: 'cat003', price: 22.90, costPrice: 11.00, stock: 5, minStock: 15,
    unit: 'cx', barcode: '7891000400106', isWeighable: false, isActive: true,
    customFields: {}, batch: 'LOT-2024-D', expiryDate: '2024-06-10',
  },
  {
    id: 'p005', sku: 'VIT1G', name: 'Vitamina C 1g Efervescente 10cp', category: 'Vitaminas',
    categoryId: 'cat004', price: 14.90, costPrice: 7.20, stock: 200, minStock: 40,
    unit: 'cx', barcode: '7891000500107', isWeighable: false, isActive: true,
    customFields: {}, batch: 'LOT-2024-E', expiryDate: '2025-09-30',
  },
  {
    id: 'p006', sku: 'PAR750', name: 'Paracetamol 750mg 20cp', category: 'Analgésicos',
    categoryId: 'cat001', price: 7.50, costPrice: 3.80, stock: 3, minStock: 20,
    unit: 'cx', barcode: '7891000600108', isWeighable: false, isActive: true,
    customFields: {}, batch: 'LOT-2024-F', expiryDate: '2026-02-28',
  },
]

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat001', name: 'Analgésicos', parentId: null },
  { id: 'cat002', name: 'Antibióticos', parentId: null },
  { id: 'cat003', name: 'Gastrointestinal', parentId: null },
  { id: 'cat004', name: 'Vitaminas', parentId: null },
  { id: 'cat005', name: 'Dermatológicos', parentId: null },
]

// ─── MOCK BRANCHES ────────────────────────────────────────────────
export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'b001',
    name: 'Filial Centro (Matriz)',
    isMain: true,
    address: 'Av. Paulista, 1000 — Bela Vista, São Paulo/SP — CEP 01310-100',
    phone: '(11) 3100-2200',
    managerId: 'u002',
    managerName: 'Ana Beatriz',
    userCount: 4,
    pdvs: [
      { id: 'pdv001', number: 1, branchId: 'b001', status: 'online', lastSyncAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), currentOperator: 'Pedro Alves', appVersion: '2.4.1' },
      { id: 'pdv002', number: 2, branchId: 'b001', status: 'online', lastSyncAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(), currentOperator: 'Mariana Costa', appVersion: '2.4.1' },
    ],
  },
  {
    id: 'b002',
    name: 'Filial Norte',
    isMain: false,
    address: 'R. das Flores, 500 — Santana, São Paulo/SP — CEP 02405-000',
    phone: '(11) 3200-3300',
    managerId: 'u005',
    managerName: 'José Ferreira',
    userCount: 3,
    pdvs: [
      { id: 'pdv003', number: 1, branchId: 'b002', status: 'offline', lastSyncAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), currentOperator: null, appVersion: '2.3.8' },
    ],
  },
]

// ─── MOCK USERS ───────────────────────────────────────────────────
export const MOCK_USERS: TenantUser[] = [
  {
    id: 'u001',
    name: 'Carlos Mendes',
    email: 'carlos@centralSaude.com.br',
    phone: '(11) 98765-4321',
    role: 'owner',
    branchId: null,
    branchName: null,
    status: 'active',
    lastLoginAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: '2023-04-15T10:00:00Z',
    children: [
      {
        id: 'u002',
        name: 'Ana Beatriz',
        email: 'ana@centralSaude.com.br',
        phone: '(11) 91234-5000',
        role: 'manager',
        branchId: 'b001',
        branchName: 'Filial Centro',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: '2023-04-16T09:00:00Z',
        children: [
          { id: 'u003', name: 'Pedro Alves', email: 'pedro@centralSaude.com.br', phone: null, role: 'cashier', branchId: 'b001', branchName: 'Filial Centro', status: 'active', lastLoginAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), createdAt: '2023-05-01T09:00:00Z' },
          { id: 'u004', name: 'Mariana Costa', email: 'mariana@centralSaude.com.br', phone: null, role: 'cashier', branchId: 'b001', branchName: 'Filial Centro', status: 'active', lastLoginAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), createdAt: '2023-06-10T09:00:00Z' },
        ],
      },
      {
        id: 'u005',
        name: 'José Ferreira',
        email: 'jose@centralSaude.com.br',
        phone: '(11) 96543-2100',
        role: 'manager',
        branchId: 'b002',
        branchName: 'Filial Norte',
        status: 'active',
        lastLoginAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        createdAt: '2023-07-01T09:00:00Z',
        children: [
          { id: 'u006', name: 'Lucas Lima', email: 'lucas@centralSaude.com.br', phone: null, role: 'cashier', branchId: 'b002', branchName: 'Filial Norte', status: 'active', lastLoginAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), createdAt: '2023-08-05T09:00:00Z' },
        ],
      },
      { id: 'u007', name: 'Fernanda Oliveira', email: 'fernanda@centralSaude.com.br', phone: '(11) 95432-1000', role: 'stock_clerk', branchId: null, branchName: null, status: 'active', lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), createdAt: '2023-05-20T09:00:00Z' },
    ],
  },
]

// ─── MOCK SALES ───────────────────────────────────────────────────
export const MOCK_SALES: Sale[] = [
  {
    id: 's001', number: 1042, status: 'completed',
    items: [
      { productId: 'p001', productName: 'Dipirona 500mg', quantity: 2, unitPrice: 8.90, discount: 0, total: 17.80 },
      { productId: 'p005', productName: 'Vitamina C 1g', quantity: 1, unitPrice: 14.90, discount: 0, total: 14.90 },
    ],
    subtotal: 32.70, discount: 0, total: 32.70,
    paymentMethod: 'card_debit', cashRegisterId: 'pdv001',
    operatorId: 'u003', operatorName: 'Pedro Alves',
    customerId: null, createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 's002', number: 1043, status: 'completed',
    items: [
      { productId: 'p003', productName: 'Ibuprofeno 600mg', quantity: 1, unitPrice: 12.40, discount: 0, total: 12.40, customFields: { prescription_number: 'RX-2024-1234' } },
    ],
    subtotal: 12.40, discount: 0, total: 12.40,
    paymentMethod: 'cash', cashRegisterId: 'pdv001',
    operatorId: 'u003', operatorName: 'Pedro Alves',
    customerId: null, createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 's003', number: 1044, status: 'completed',
    items: [
      { productId: 'p001', productName: 'Dipirona 500mg', quantity: 3, unitPrice: 8.90, discount: 2.00, total: 24.70 },
      { productId: 'p004', productName: 'Omeprazol 20mg', quantity: 1, unitPrice: 22.90, discount: 0, total: 22.90 },
    ],
    subtotal: 50.60, discount: 2.00, total: 47.60,
    paymentMethod: 'pix', cashRegisterId: 'pdv002',
    operatorId: 'u004', operatorName: 'Mariana Costa',
    customerId: null, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]

// ─── MOCK DEALS ───────────────────────────────────────────────────
export const MOCK_DEALS: Deal[] = [
  { id: 'd001', title: 'Contrato Mensal — Drogaria Leste', contactId: 'c001', contactName: 'Maria Fernandes', value: 450, stage: 'proposal', assignedTo: 'Carlos Mendes', createdAt: '2024-03-01T10:00:00Z', updatedAt: '2024-03-20T15:00:00Z' },
  { id: 'd002', title: 'Fornecimento Medicamentos Genéricos', contactId: 'c002', contactName: 'Lab. Vitamed', value: 8200, stage: 'negotiation', assignedTo: 'Carlos Mendes', createdAt: '2024-03-05T10:00:00Z', updatedAt: '2024-03-25T10:00:00Z' },
  { id: 'd003', title: 'Parceria Plano de Saúde XYZ', contactId: 'c003', contactName: 'Plano XYZ', value: 2400, stage: 'contact', assignedTo: 'Carlos Mendes', createdAt: '2024-03-10T10:00:00Z', updatedAt: '2024-03-10T10:00:00Z' },
  { id: 'd004', title: 'Representante Cosmético ABC', contactId: 'c004', contactName: 'Dist. ABC', value: 1800, stage: 'won', assignedTo: 'Carlos Mendes', createdAt: '2024-02-15T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z' },
  { id: 'd005', title: 'Licitação Municipal', contactId: 'c005', contactName: 'Prefeitura SP', value: 15000, stage: 'lead', assignedTo: 'Carlos Mendes', createdAt: '2024-03-22T10:00:00Z', updatedAt: '2024-03-22T10:00:00Z' },
]

// ─── MOCK CONTACTS ────────────────────────────────────────────────
export const MOCK_CONTACTS: Contact[] = [
  { id: 'c001', name: 'Maria Fernandes', email: 'mfernandes@email.com', phone: '(11) 98765-0001', document: '123.456.789-01', tags: ['cliente', 'vip'], totalPurchases: 1250, lastPurchaseAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), customFields: {}, createdAt: '2023-06-01T10:00:00Z' },
  { id: 'c002', name: 'Roberto Santos', email: null, phone: '(11) 97654-0002', document: null, tags: ['cliente'], totalPurchases: 680, lastPurchaseAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), customFields: {}, createdAt: '2023-08-15T10:00:00Z' },
  { id: 'c003', name: 'Plano XYZ Saúde', email: 'contato@planoxyz.com.br', phone: '(11) 3333-4444', document: '12.345.678/0001-90', tags: ['parceiro'], totalPurchases: 0, lastPurchaseAt: null, customFields: {}, createdAt: '2024-03-10T10:00:00Z' },
]

// ─── MOCK TRANSACTIONS ───────────────────────────────────────────
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't001', type: 'receivable', description: 'Venda PDV #1042', amount: 32.70, dueDate: '2024-03-28', paidAt: '2024-03-28', status: 'paid', category: 'Vendas', contactName: null, notes: null },
  { id: 't002', type: 'receivable', description: 'Venda PDV #1043', amount: 12.40, dueDate: '2024-03-28', paidAt: '2024-03-28', status: 'paid', category: 'Vendas', contactName: null, notes: null },
  { id: 't003', type: 'payable', description: 'Fornecedor Medicamentos ABC', amount: 3200.00, dueDate: '2024-04-05', paidAt: null, status: 'pending', category: 'Fornecedores', contactName: 'ABC Distribuidora', notes: 'NF 001234' },
  { id: 't004', type: 'payable', description: 'Aluguel Filial Centro', amount: 4500.00, dueDate: '2024-04-10', paidAt: null, status: 'pending', category: 'Aluguel', contactName: 'Imob. Paulista', notes: null },
  { id: 't005', type: 'payable', description: 'Conta de Luz — Março', amount: 890.00, dueDate: '2024-03-25', paidAt: null, status: 'overdue', category: 'Utilidades', contactName: 'Enel SP', notes: null },
  { id: 't006', type: 'receivable', description: 'Venda Plano de Saúde XYZ', amount: 2800.00, dueDate: '2024-04-15', paidAt: null, status: 'pending', category: 'Convênios', contactName: 'Plano XYZ', notes: null },
]

// ─── MOCK STOCK MOVEMENTS ────────────────────────────────────────
export const MOCK_MOVEMENTS: StockMovement[] = [
  { id: 'mv001', productId: 'p001', productName: 'Dipirona 500mg', type: 'in', quantity: 100, reason: 'Compra — NF 5678', performedBy: 'Fernanda Oliveira', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'mv002', productId: 'p002', productName: 'Amoxicilina 250mg', type: 'out', quantity: 5, reason: 'Venda PDV', performedBy: 'Pedro Alves', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'mv003', productId: 'p004', productName: 'Omeprazol 20mg', type: 'adjustment', quantity: -3, reason: 'Ajuste de inventário — vencimento', performedBy: 'Fernanda Oliveira', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: 'mv004', productId: 'p005', productName: 'Vitamina C 1g', type: 'in', quantity: 150, reason: 'Compra — NF 5679', performedBy: 'Fernanda Oliveira', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
]

// ─── AVAILABLE TENANT LOGINS ─────────────────────────────────────
export const MOCK_CREDENTIALS = [
  { email: 'carlos@centralSaude.com.br', password: 'demo123', config: PHARMACY_CONFIG, label: 'Farmácia — Owner' },
  { email: 'roberto@bompreco.com.br', password: 'demo123', config: SUPERMARKET_CONFIG, label: 'Supermercado — Gerente' },
  { email: 'joao@trigodeouro.com.br', password: 'demo123', config: BAKERY_CONFIG, label: 'Padaria — Owner (Onboarding)' },
]
