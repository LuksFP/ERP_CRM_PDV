import { useState } from 'react'
import {
  FileText, CheckCircle2, Clock, XCircle, AlertTriangle,
  Download, Send, Plus, Search, Filter, RefreshCw,
  ChevronDown, Eye, Printer,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'

// ── Types ─────────────────────────────────────────────────────────────────────

type NFStatus = 'autorizada' | 'pendente' | 'cancelada' | 'rejeitada' | 'processando'
type NFType   = 'NF-e' | 'NFC-e' | 'CT-e'

interface NotaFiscal {
  id:          string
  numero:      string
  serie:       string
  type:        NFType
  status:      NFStatus
  emitidaEm:  string
  destinatario: string
  cnpj:        string
  valor:       number
  chave:       string
  natureza:    string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_NFS: NotaFiscal[] = [
  { id: 'nf1',  numero: '000001', serie: '001', type: 'NF-e',  status: 'autorizada',  emitidaEm: '2026-03-30T08:12:00Z', destinatario: 'Distribuidora São Paulo Ltda', cnpj: '12.345.678/0001-90', valor: 4850.00, chave: '3526030312345678000190550010000000011234567891', natureza: 'Venda de mercadoria' },
  { id: 'nf2',  numero: '000002', serie: '001', type: 'NF-e',  status: 'autorizada',  emitidaEm: '2026-03-30T09:45:00Z', destinatario: 'Mercado Central EIRELI',      cnpj: '98.765.432/0001-10', valor: 1230.50, chave: '3526030312345678000190550010000000029876543210', natureza: 'Venda de mercadoria' },
  { id: 'nf3',  numero: '000003', serie: '001', type: 'NFC-e', status: 'autorizada',  emitidaEm: '2026-03-30T11:20:00Z', destinatario: 'Consumidor Final',             cnpj: '—',                  valor:  320.00, chave: '3526030312345678000190650010000000031111111110', natureza: 'Venda a consumidor' },
  { id: 'nf4',  numero: '000004', serie: '001', type: 'NF-e',  status: 'pendente',    emitidaEm: '2026-03-30T13:00:00Z', destinatario: 'Loja do Bairro ME',            cnpj: '55.444.333/0001-22', valor: 2100.00, chave: '3526030312345678000190550010000000044444444440', natureza: 'Remessa para venda' },
  { id: 'nf5',  numero: '000005', serie: '001', type: 'NF-e',  status: 'processando', emitidaEm: '2026-03-30T14:30:00Z', destinatario: 'Supermercado União S/A',       cnpj: '11.222.333/0001-44', valor: 7600.00, chave: '3526030312345678000190550010000000055555555550', natureza: 'Venda de mercadoria' },
  { id: 'nf6',  numero: '000006', serie: '001', type: 'NF-e',  status: 'cancelada',   emitidaEm: '2026-03-29T16:00:00Z', destinatario: 'Padaria Estrela Ltda',         cnpj: '33.444.555/0001-66', valor:  980.00, chave: '3526030312345678000190550010000000066666666660', natureza: 'Venda de mercadoria' },
  { id: 'nf7',  numero: '000007', serie: '001', type: 'NF-e',  status: 'rejeitada',   emitidaEm: '2026-03-29T10:15:00Z', destinatario: 'Atacado Mega Preço Ltda',      cnpj: '77.888.999/0001-00', valor: 3400.00, chave: '3526030312345678000190550010000000077777777770', natureza: 'Venda de mercadoria' },
  { id: 'nf8',  numero: '000008', serie: '001', type: 'NFC-e', status: 'autorizada',  emitidaEm: '2026-03-29T08:30:00Z', destinatario: 'Consumidor Final',             cnpj: '—',                  valor:   85.90, chave: '3526030312345678000190650010000000088888888880', natureza: 'Venda a consumidor' },
  { id: 'nf9',  numero: '000009', serie: '001', type: 'CT-e',  status: 'autorizada',  emitidaEm: '2026-03-28T14:00:00Z', destinatario: 'Transportadora Veloz Ltda',    cnpj: '22.333.444/0001-55', valor: 1200.00, chave: '3526030312345678000190570010000000099999999990', natureza: 'Prestação de serviço de transporte' },
  { id: 'nf10', numero: '000010', serie: '001', type: 'NF-e',  status: 'autorizada',  emitidaEm: '2026-03-28T09:00:00Z', destinatario: 'Restaurante Bom Sabor ME',     cnpj: '44.555.666/0001-77', valor: 5600.00, chave: '3526030312345678000190550010000000100000000010', natureza: 'Venda de mercadoria' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<NFStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  autorizada:  { label: 'Autorizada',  icon: CheckCircle2,   color: 'var(--green)',  bg: 'rgba(77,184,100,0.10)' },
  pendente:    { label: 'Pendente',    icon: Clock,          color: 'var(--yellow)', bg: 'rgba(212,168,74,0.10)' },
  cancelada:   { label: 'Cancelada',   icon: XCircle,        color: 'var(--fg-dim)', bg: 'var(--surface-3)' },
  rejeitada:   { label: 'Rejeitada',   icon: AlertTriangle,  color: 'var(--red)',    bg: 'rgba(212,100,74,0.10)' },
  processando: { label: 'Processando', icon: RefreshCw,      color: 'var(--accent)', bg: 'var(--accent-dim)' },
}

const TYPE_COLOR: Record<NFType, string> = {
  'NF-e':  'text-blue-400',
  'NFC-e': 'text-purple-400',
  'CT-e':  'text-orange-400',
}

function maskChave(chave: string) {
  return chave.slice(0, 8) + '...' + chave.slice(-8)
}

// ── Summary cards ──────────────────────────────────────────────────────────────

function SummaryCards() {
  const total     = MOCK_NFS.length
  const autorized = MOCK_NFS.filter(n => n.status === 'autorizada').length
  const pending   = MOCK_NFS.filter(n => n.status === 'pendente' || n.status === 'processando').length
  const issues    = MOCK_NFS.filter(n => n.status === 'rejeitada' || n.status === 'cancelada').length
  const totalValue = MOCK_NFS.filter(n => n.status === 'autorizada').reduce((s, n) => s + n.valor, 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total emitidas', value: total,               sub: 'últimos 30 dias',       color: 'var(--accent)',  Icon: FileText       },
        { label: 'Autorizadas',    value: autorized,           sub: `${((autorized/total)*100).toFixed(0)}% do total`, color: 'var(--green)', Icon: CheckCircle2 },
        { label: 'Pendentes',      value: pending,             sub: 'aguardando SEFAZ',      color: 'var(--yellow)', Icon: Clock          },
        { label: 'Valor autorizado', value: formatCurrency(totalValue), sub: 'em notas aprovadas', color: 'var(--fg)',   Icon: FileText       },
      ].map(({ label, value, sub, color, Icon }) => (
        <div
          key={label}
          className="rounded-xl p-4"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-ink-muted font-medium">{label}</span>
            <Icon size={14} style={{ color }} />
          </div>
          <p className="text-2xl font-bold text-ink font-mono">{value}</p>
          <p className="text-[11px] text-ink-subtle mt-1">{sub}</p>
        </div>
      ))}
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────

function NFRow({ nf, onExpand, expanded }: { nf: NotaFiscal; onExpand: () => void; expanded: boolean }) {
  const cfg = STATUS_CONFIG[nf.status]
  const StatusIcon = cfg.icon

  return (
    <>
      <tr
        className={cn(
          'border-b border-border hover:bg-surface-2 transition-colors cursor-pointer',
          expanded && 'bg-surface-1',
        )}
        onClick={onExpand}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] font-bold font-mono', TYPE_COLOR[nf.type])}>{nf.type}</span>
            <span className="text-sm font-mono font-semibold text-ink">#{nf.numero}</span>
            <span className="text-[10px] text-ink-subtle">s{nf.serie}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-ink truncate max-w-[180px]">{nf.destinatario}</p>
          <p className="text-[10px] text-ink-subtle font-mono">{nf.cnpj}</p>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <p className="text-xs text-ink-muted">{nf.natureza}</p>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="text-sm font-mono font-semibold text-ink">{formatCurrency(nf.valor)}</span>
        </td>
        <td className="px-4 py-3 hidden sm:table-cell">
          <span className="text-[11px] text-ink-subtle font-mono">
            {formatDate(nf.emitidaEm)}
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            <StatusIcon size={10} className={nf.status === 'processando' ? 'animate-spin' : ''} />
            {cfg.label}
          </span>
        </td>
        <td className="px-4 py-3">
          <button
            onClick={(e) => { e.stopPropagation(); onExpand() }}
            className="p-1.5 rounded text-ink-subtle hover:text-ink hover:bg-surface-3 transition-colors"
          >
            <ChevronDown size={14} className={cn('transition-transform', expanded && 'rotate-180')} />
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-border bg-surface-1">
          <td colSpan={7} className="px-4 py-3">
            <div className="flex items-start gap-6 flex-wrap">
              <div>
                <p className="text-[10px] font-medium text-ink-subtle uppercase tracking-widest mb-1">Chave de acesso</p>
                <p className="text-[11px] font-mono text-ink-muted break-all">{nf.chave}</p>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {nf.status === 'autorizada' && (
                  <>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-ink-muted border border-border hover:bg-surface-2 transition-colors">
                      <Eye size={12} />
                      Visualizar
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-ink-muted border border-border hover:bg-surface-2 transition-colors">
                      <Download size={12} />
                      XML
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-ink-muted border border-border hover:bg-surface-2 transition-colors">
                      <Printer size={12} />
                      DANFE
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-ink-muted border border-border hover:bg-surface-2 transition-colors">
                      <Send size={12} />
                      Enviar por e-mail
                    </button>
                  </>
                )}
                {nf.status === 'rejeitada' && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white transition-colors" style={{ background: 'var(--accent-bg, var(--accent))' }}>
                    <RefreshCw size={12} />
                    Reprocessar
                  </button>
                )}
                {nf.status === 'pendente' && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white transition-colors" style={{ background: 'var(--accent-bg, var(--accent))' }}>
                    <Send size={12} />
                    Transmitir
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FiscalPage() {
  const [search, setSearch]       = useState('')
  const [filterType, setFilterType] = useState<NFType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<NFStatus | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = MOCK_NFS.filter((nf) => {
    const matchesSearch = !search ||
      nf.numero.includes(search) ||
      nf.destinatario.toLowerCase().includes(search.toLowerCase()) ||
      nf.cnpj.includes(search)
    const matchesType   = filterType === 'all' || nf.type === filterType
    const matchesStatus = filterStatus === 'all' || nf.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="flex flex-col gap-5 p-5 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Fiscal / NF-e</h1>
          <p className="text-sm text-ink-muted mt-0.5">Emissão e gestão de documentos fiscais eletrônicos</p>
        </div>
        <Button leftIcon={<Plus size={14} />} size="sm">
          Emitir NF-e
        </Button>
      </div>

      {/* Summary */}
      <SummaryCards />

      {/* Filters */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar por número, destinatário ou CNPJ…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={14} />}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-ink-subtle shrink-0" />
            {(['all', 'NF-e', 'NFC-e', 'CT-e'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                  filterType === t
                    ? 'text-[var(--accent-contrast)] bg-[var(--accent-bg,var(--accent))]'
                    : 'text-ink-muted border border-border hover:bg-surface-2',
                )}
              >
                {t === 'all' ? 'Todos' : t}
              </button>
            ))}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as NFStatus | 'all')}
            className="h-9 px-3 rounded text-sm text-ink border border-border bg-surface-0 outline-none focus:border-[var(--accent)] transition-colors"
          >
            <option value="all">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        <table className="w-full text-left">
          <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              {['Número', 'Destinatário', 'Natureza', 'Valor', 'Emitida em', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className={cn(
                    'px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-ink-subtle',
                    h === 'Natureza' && 'hidden md:table-cell',
                    h === 'Emitida em' && 'hidden sm:table-cell',
                    h === 'Valor' && 'text-right',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: 'var(--surface-0)' }}>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-sm text-ink-subtle">
                  Nenhuma nota fiscal encontrada
                </td>
              </tr>
            ) : (
              filtered.map((nf) => (
                <NFRow
                  key={nf.id}
                  nf={nf}
                  expanded={expandedId === nf.id}
                  onExpand={() => setExpandedId(expandedId === nf.id ? null : nf.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-xs text-ink-subtle text-right">
          {filtered.length} nota{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
