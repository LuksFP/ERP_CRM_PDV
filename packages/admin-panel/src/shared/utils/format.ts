import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SegmentType, TenantRole, TenantStatus, ModuleType, PDVStatus } from '../types'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR })
  } catch {
    return '—'
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return '—'
  }
}

export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Nunca'
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ptBR })
  } catch {
    return '—'
  }
}

export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '')
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '')
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export const segmentLabels: Record<SegmentType, string> = {
  pharmacy: 'Farmácia',
  supermarket: 'Supermercado',
  bakery: 'Padaria',
  butcher: 'Açougue',
  restaurant: 'Restaurante',
  clothing: 'Vestuário',
  electronics: 'Eletrônicos',
  other: 'Outro',
}

export const roleLabels: Record<TenantRole, string> = {
  owner: 'Dono',
  manager: 'Gerente',
  cashier: 'Operador de Caixa',
  stock_clerk: 'Estoquista',
  seller: 'Vendedor',
  financial: 'Financeiro',
}

export const statusLabels: Record<TenantStatus, string> = {
  active: 'Ativo',
  trial: 'Trial',
  suspended: 'Suspenso',
  cancelled: 'Cancelado',
}

export const moduleLabels: Record<ModuleType, string> = {
  stock: 'Estoque',
  pdv: 'PDV / Caixa',
  crm: 'CRM',
  financial: 'Financeiro',
  fiscal: 'Fiscal / NF-e',
  hr: 'RH',
  reports: 'Relatórios',
  api: 'API Pública',
}

export const pdvStatusLabels: Record<PDVStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  maintenance: 'Manutenção',
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  return password
}
