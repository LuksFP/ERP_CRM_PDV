import { useState, useMemo, useRef, useEffect } from 'react'
import { ClipboardList, Plus, Search, MessageSquare, SlidersHorizontal, RotateCcw, Check } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { Modal } from '@/shared/components/Modal'
import { Input } from '@/shared/components/Input'
import { useAuthStore } from '@/modules/auth/store'
import { MOCK_SERVICE_ORDERS, MOCK_TENANTS } from '@/mock/data'
import { MOCK_ADMIN_USERS } from '@/modules/auth/store'
import { useToolsStore } from '@/shared/store/tools'
import type { ServiceOrder, ServiceOrderStatus, ServiceOrderPriority } from '@/shared/types'

// ─── HELPERS ──────────────────────────────────────────────────────

function formatRelative(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  if (diffHours < 1) return 'menos de 1h'
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return '1 dia'
  return `${diffDays} dias`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  open: 'Aberta',
  in_progress: 'Em andamento',
  waiting_client: 'Aguardando cliente',
  resolved: 'Resolvida',
  closed: 'Fechada',
}

const STATUS_BADGE_VARIANT: Record<ServiceOrderStatus, 'warning' | 'default' | 'neutral' | 'success'> = {
  open: 'warning',
  in_progress: 'default',
  waiting_client: 'neutral',
  resolved: 'success',
  closed: 'neutral',
}

const PRIORITY_LABELS: Record<ServiceOrderPriority, string> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

const PRIORITY_COLORS: Record<ServiceOrderPriority, string> = {
  critical: 'var(--red)',
  high: 'var(--yellow)',
  medium: 'var(--accent)',
  low: 'var(--fg-dim)',
}

const PRIORITY_BG: Record<ServiceOrderPriority, string> = {
  critical: 'rgba(var(--red-rgb, 239,68,68),0.1)',
  high: 'rgba(var(--yellow-rgb, 234,179,8),0.1)',
  medium: 'var(--accent-dim)',
  low: 'var(--surface-3)',
}

function PriorityBadge({ priority }: { priority: ServiceOrderPriority }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: 'Geist Mono, monospace',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: PRIORITY_COLORS[priority],
      background: PRIORITY_BG[priority],
      border: `1px solid ${PRIORITY_COLORS[priority]}33`,
      borderRadius: 4,
      padding: '2px 7px',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: PRIORITY_COLORS[priority], flexShrink: 0 }} />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

// ─── TOGGLE ────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{ width: 32, height: 18, borderRadius: 9, background: checked ? 'var(--accent)' : 'var(--surface-3)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.15s', flexShrink: 0, padding: 0 }}
    >
      <span style={{ position: 'absolute', top: 2, left: checked ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {checked && <Check size={8} color="var(--accent)" strokeWidth={3} />}
      </span>
    </button>
  )
}

// ─── OS CUSTOMIZE PANEL ────────────────────────────────────────────
function OSCustomizePanel({ onClose }: { onClose: () => void }) {
  const { serviceOrders, toggleColumn, setServiceOrders, resetServiceOrders } = useToolsStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const colLabels: Record<keyof typeof serviceOrders.columns, string> = {
    tenant: 'Tenant',
    title: 'Título',
    priority: 'Prioridade',
    status: 'Status',
    assignedTo: 'Responsável',
    timeOpen: 'Aberta há',
  }

  const row = (label: string, checked: boolean, onChange: () => void) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )

  return (
    <div ref={ref} style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, width: 240, background: 'var(--surface-2)', border: '1px solid var(--border-hover)', borderRadius: 10, padding: '14px 16px', zIndex: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', margin: 0 }}>Personalizar</p>
        <button onClick={resetServiceOrders} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--fg-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <RotateCcw size={11} /> Restaurar
        </button>
      </div>
      <p style={{ fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-dim)', margin: '14px 0 6px' }}>Colunas</p>
      {(Object.keys(colLabels) as Array<keyof typeof serviceOrders.columns>).map(col => (
        row(colLabels[col], serviceOrders.columns[col], () => toggleColumn(col))
      ))}
      <p style={{ fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-dim)', margin: '14px 0 6px' }}>Filtro padrão</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(['all','open','in_progress','resolved'] as const).map(tab => {
          const labels = { all: 'Todas', open: 'Abertas', in_progress: 'Em andamento', resolved: 'Resolvidas' }
          const active = serviceOrders.defaultStatusTab === tab
          return (
            <button key={tab} onClick={() => setServiceOrders({ defaultStatusTab: tab })} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: active ? 600 : 400, border: '1px solid', borderColor: active ? 'var(--accent)' : 'var(--border)', background: active ? 'var(--accent-dim)' : 'transparent', color: active ? 'var(--accent)' : 'var(--fg-dim)', cursor: 'pointer', transition: 'all 0.1s' }}>
              {labels[tab]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type StatusTabFilter = 'all' | 'open' | 'in_progress' | 'resolved'

const STATUS_TABS: Array<{ key: StatusTabFilter; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'open', label: 'Abertas' },
  { key: 'in_progress', label: 'Em andamento' },
  { key: 'resolved', label: 'Resolvidas' },
]

// ─── DETAIL MODAL ────────────────────────────────────────────────

interface DetailModalProps {
  os: ServiceOrder
  onClose: () => void
  onUpdate: (id: string, patch: Partial<ServiceOrder>) => void
}

function DetailModal({ os, onClose, onUpdate }: DetailModalProps) {
  const [status, setStatus] = useState<ServiceOrderStatus>(os.status)
  const [commentText, setCommentText] = useState('')
  const [localComments, setLocalComments] = useState(os.comments)

  function handleAddComment() {
    const trimmed = commentText.trim()
    if (!trimmed) return
    const newComment = {
      id: `c_${Date.now()}`,
      authorName: 'Admin Geral',
      text: trimmed,
      createdAt: new Date().toISOString(),
    }
    setLocalComments(prev => [...prev, newComment])
    setCommentText('')
  }

  function handleStatusChange(newStatus: ServiceOrderStatus) {
    setStatus(newStatus)
    onUpdate(os.id, { status: newStatus })
  }

  function handleResolve() {
    handleStatusChange('resolved')
  }

  function handleClose() {
    handleStatusChange('closed')
  }

  const canResolve = status === 'open' || status === 'in_progress'
  const canClose = status === 'resolved'

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      footer={
        <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {canResolve && (
              <Button variant="primary" size="sm" onClick={handleResolve}>
                Resolver OS
              </Button>
            )}
            {canClose && (
              <Button variant="secondary" size="sm" onClick={handleClose}>
                Fechar OS
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
      }
    >
      {/* OS Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, color: 'var(--fg-dim)', letterSpacing: '0.08em' }}>
            {os.number}
          </span>
          <Badge variant={STATUS_BADGE_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>
          <PriorityBadge priority={os.priority} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', margin: 0 }}>{os.title}</h2>
        <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12, color: 'var(--fg-muted)' }}>
          <span>{os.tenantName}</span>
          <span>Aberta em {formatDate(os.createdAt)}</span>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
      }}>
        <div>
          <label style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>
            Status
          </label>
          <select
            value={status}
            onChange={e => handleStatusChange(e.target.value as ServiceOrderStatus)}
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--fg)',
              fontSize: 13,
              padding: '5px 10px',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            {(Object.keys(STATUS_LABELS) as ServiceOrderStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>
            Responsável
          </label>
          <div style={{ fontSize: 13, color: 'var(--fg)', padding: '5px 0' }}>{os.assignedTo.name}</div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>
            Descrição
          </label>
          <p style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.6, margin: 0 }}>{os.description}</p>
        </div>
      </div>

      {/* Comments */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <MessageSquare style={{ width: 15, height: 15, color: 'var(--fg-dim)' }} />
          <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Comentários ({localComments.length})
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {localComments.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--fg-dim)', textAlign: 'center', padding: '16px 0' }}>
              Nenhum comentário ainda.
            </p>
          )}
          {localComments.map(c => (
            <div key={c.id} style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg)' }}>{c.authorName}</span>
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: 'var(--fg-dim)' }}>
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: 0, lineHeight: 1.5 }}>{c.text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Adicionar comentário..."
              rows={3}
              style={{
                width: '100%',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                color: 'var(--fg)',
                fontSize: 13,
                padding: '8px 12px',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>
          <Button variant="primary" size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
            Enviar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── CREATE MODAL ────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void
  onCreate: (os: ServiceOrder) => void
}

function CreateModal({ onClose, onCreate }: CreateModalProps) {
  const [tenantId, setTenantId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<ServiceOrderPriority>('medium')
  const [assignedToId, setAssignedToId] = useState(MOCK_ADMIN_USERS[0]?.id ?? '')

  function handleCreate() {
    const tenant = MOCK_TENANTS.find(t => t.id === tenantId)
    if (!tenant || !title.trim()) return
    const assignee = MOCK_ADMIN_USERS.find(u => u.id === assignedToId)
    if (!assignee) return

    const count = 100 + Math.floor(Math.random() * 900)
    const newOS: ServiceOrder = {
      id: `os_${Date.now()}`,
      number: `OS-${count}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'open',
      assignedTo: { id: assignee.id, name: assignee.name },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      comments: [],
    }
    onCreate(newOS)
    onClose()
  }

  const isValid = !!tenantId && title.trim().length > 0 && !!assignedToId

  const selectStyle: React.CSSProperties = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--fg)',
    fontSize: 13,
    padding: '7px 10px',
    width: '100%',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 10,
    color: 'var(--fg-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    display: 'block',
    marginBottom: 5,
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Nova Ordem de Serviço"
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleCreate} disabled={!isValid}>
            Criar OS
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Tenant *</label>
          <select value={tenantId} onChange={e => setTenantId(e.target.value)} style={selectStyle}>
            <option value="">Selecionar tenant...</option>
            {MOCK_TENANTS.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <Input
          label="Título *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Descreva o problema brevemente"
        />
        <div>
          <label style={labelStyle}>Descrição</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Detalhes do problema..."
            rows={4}
            style={{
              width: '100%',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--fg)',
              fontSize: 13,
              padding: '8px 12px',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Prioridade</label>
            <select value={priority} onChange={e => setPriority(e.target.value as ServiceOrderPriority)} style={selectStyle}>
              {(Object.keys(PRIORITY_LABELS) as ServiceOrderPriority[]).map(p => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Responsável</label>
            <select value={assignedToId} onChange={e => setAssignedToId(e.target.value)} style={selectStyle}>
              {MOCK_ADMIN_USERS.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────

export default function ServiceOrdersPage() {
  const user = useAuthStore(s => s.user)
  const { serviceOrders: soConfig } = useToolsStore()
  const isSuperAdmin = user?.role === 'superadmin'

  const [orders, setOrders] = useState<ServiceOrder[]>(MOCK_SERVICE_ORDERS)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<StatusTabFilter>(soConfig.defaultStatusTab)
  const [priorityFilter, setPriorityFilter] = useState<ServiceOrderPriority | 'all'>(soConfig.defaultPriorityFilter)
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [selectedOS, setSelectedOS] = useState<ServiceOrder | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  const canCreate = user?.role !== 'sales'
  const cols = soConfig.columns

  const filtered = useMemo(() => {
    return orders.filter(os => {
      if (search) {
        const q = search.toLowerCase()
        if (!os.title.toLowerCase().includes(q) &&
            !os.number.toLowerCase().includes(q) &&
            !os.tenantName.toLowerCase().includes(q)) return false
      }
      if (statusTab !== 'all') {
        if (statusTab === 'open' && os.status !== 'open') return false
        if (statusTab === 'in_progress' && os.status !== 'in_progress') return false
        if (statusTab === 'resolved' && os.status !== 'resolved' && os.status !== 'closed') return false
      }
      if (priorityFilter !== 'all' && os.priority !== priorityFilter) return false
      if (assigneeFilter !== 'all' && os.assignedTo.id !== assigneeFilter) return false
      return true
    })
  }, [orders, search, statusTab, priorityFilter, assigneeFilter])

  function handleUpdate(id: string, patch: Partial<ServiceOrder>) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o))
    if (selectedOS?.id === id) {
      setSelectedOS(prev => prev ? { ...prev, ...patch } : null)
    }
  }

  function handleCreate(os: ServiceOrder) {
    setOrders(prev => [os, ...prev])
  }

  return (
    <div style={{ padding: '24px 28px', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClipboardList style={{ width: 18, height: 18, color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', margin: 0 }}>Ordens de Serviço</h1>
            <p style={{ fontSize: 12, color: 'var(--fg-muted)', margin: 0, marginTop: 1 }}>
              Gerencie chamados de suporte dos tenants
            </p>
          </div>
          <span style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 700,
            background: 'var(--surface-3)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '2px 10px', color: 'var(--fg-muted)',
          }}>{orders.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isSuperAdmin && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setCustomizeOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 6, border: '1px solid', borderColor: customizeOpen ? 'var(--accent)' : 'var(--border)', background: customizeOpen ? 'var(--accent-dim)' : 'var(--surface-2)', color: customizeOpen ? 'var(--accent)' : 'var(--fg-muted)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.1s' }}
              >
                <SlidersHorizontal size={12} />
                Personalizar
              </button>
              {customizeOpen && <OSCustomizePanel onClose={() => setCustomizeOpen(false)} />}
            </div>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={<Plus style={{ width: 14, height: 14 }} />}
            disabled={!canCreate}
            onClick={() => setShowCreate(true)}
          >
            Nova OS
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 4 }}>
          {STATUS_TABS.map(tab => {
            const active = statusTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  border: active ? '1px solid var(--accent)' : '1px solid transparent',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--fg-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search + selects */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Input
              placeholder="Buscar por título, número ou tenant..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search style={{ width: 14, height: 14 }} />}
            />
          </div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as ServiceOrderPriority | 'all')}
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--fg)',
              fontSize: 13,
              padding: '0 10px',
              height: 36,
              minWidth: 130,
              cursor: 'pointer',
            }}
          >
            <option value="all">Todas prioridades</option>
            {(Object.keys(PRIORITY_LABELS) as ServiceOrderPriority[]).map(p => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--fg)',
              fontSize: 13,
              padding: '0 10px',
              height: 36,
              minWidth: 150,
              cursor: 'pointer',
            }}
          >
            <option value="all">Todos responsáveis</option>
            {MOCK_ADMIN_USERS.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>#</th>
              {cols.tenant    && <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>Tenant</th>}
              {cols.title     && <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>Título</th>}
              {cols.priority  && <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>Prioridade</th>}
              {cols.status    && <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>Status</th>}
              {cols.assignedTo && <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>Responsável</th>}
              {cols.timeOpen  && <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>Aberta há</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--fg-dim)', fontSize: 13 }}>
                  Nenhuma ordem de serviço encontrada.
                </td>
              </tr>
            )}
            {filtered.map((os, idx) => (
              <tr
                key={os.id}
                onClick={() => setSelectedOS(os)}
                style={{ background: idx % 2 === 0 ? 'transparent' : 'var(--surface-1)', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? 'transparent' : 'var(--surface-1)' }}
              >
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'var(--fg-dim)', fontWeight: 600 }}>{os.number}</span>
                </td>
                {cols.tenant    && <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 13, color: 'var(--fg)', fontWeight: 500 }}>{os.tenantName}</span></td>}
                {cols.title     && <td style={{ padding: '10px 14px', maxWidth: 260 }}><span style={{ fontSize: 13, color: 'var(--fg)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{os.title}</span></td>}
                {cols.priority  && <td style={{ padding: '10px 14px' }}><PriorityBadge priority={os.priority} /></td>}
                {cols.status    && <td style={{ padding: '10px 14px' }}><Badge variant={STATUS_BADGE_VARIANT[os.status]} size="sm">{STATUS_LABELS[os.status]}</Badge></td>}
                {cols.assignedTo && <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{os.assignedTo.name}</span></td>}
                {cols.timeOpen  && <td style={{ padding: '10px 14px' }}><span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: 'var(--fg-dim)' }}>{formatRelative(os.createdAt)}</span></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedOS && (
        <DetailModal
          os={selectedOS}
          onClose={() => setSelectedOS(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}
