import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { TenantRole, SegmentType, ModuleKey, PDVStatus, DealStage } from '../types'

export const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export const formatNumber = (v: number) =>
  new Intl.NumberFormat('pt-BR').format(v)

export const formatPercent = (v: number, d = 1) => `${v.toFixed(d)}%`

export const formatDate = (s: string) => {
  try { return format(parseISO(s), 'dd/MM/yyyy', { locale: ptBR }) }
  catch { return '—' }
}

export const formatDateTime = (s: string) => {
  try { return format(parseISO(s), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) }
  catch { return '—' }
}

export const formatRelative = (s: string | null) => {
  if (!s) return 'Nunca'
  try { return formatDistanceToNow(parseISO(s), { addSuffix: true, locale: ptBR }) }
  catch { return '—' }
}

export const roleLabels: Record<TenantRole, string> = {
  owner: 'Proprietário',
  manager: 'Gerente',
  cashier: 'Operador de Caixa',
  stock_clerk: 'Estoquista',
  seller: 'Vendedor',
  financial: 'Financeiro',
}

export const segmentLabels: Record<SegmentType, string> = {
  pharmacy: 'Farmácia',
  supermarket: 'Supermercado',
  bakery: 'Padaria',
  butcher: 'Açougue',
  restaurant: 'Restaurante',
  clothing: 'Vestuário',
  electronics: 'Eletrônicos',
  other: 'Geral',
}

export const moduleLabels: Record<ModuleKey, string> = {
  dashboard: 'Dashboard',
  inventory: 'Estoque',
  pdv: 'PDV / Caixa',
  crm: 'CRM',
  financial: 'Financeiro',
  fiscal: 'Fiscal / NF-e',
  purchasing: 'Compras',
  settings: 'Configurações',
}

export const pdvStatusLabels: Record<PDVStatus, string> = {
  online: 'Online',
  delayed: 'Atrasado',
  offline: 'Offline',
}

export const dealStageLabels: Record<DealStage, string> = {
  lead: 'Lead',
  contact: 'Contato',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  won: 'Ganho',
  lost: 'Perdido',
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

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
