import { useState, useMemo, useRef, useEffect } from 'react'
import {
  CalendarDays,
  Plus,
  CheckSquare,
  Square,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  SlidersHorizontal,
  RotateCcw,
  Check,
} from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { MOCK_AGENDA_ITEMS } from '@/mock/data'
import { useAuthStore } from '@/modules/auth/store'
import { useToolsStore } from '@/shared/store/tools'
import type { AgendaItem, AgendaItemType, AgendaItemPriority } from '@/shared/types'

// ─── HELPERS ──────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth() === now.getMonth() &&
         d.getDate() === now.getDate()
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  return d >= startOfWeek && d < endOfWeek
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0] ?? '').join('').toUpperCase()
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const PRIORITY_DOT_COLORS: Record<AgendaItemPriority, string> = {
  high: 'var(--red)',
  medium: 'var(--yellow)',
  low: 'var(--fg-dim)',
}

const TYPE_ICONS: Record<AgendaItemType, React.ElementType> = {
  task: CheckSquare,
  event: Calendar,
  reminder: Bell,
}

const TYPE_LABELS: Record<AgendaItemType, string> = {
  task: 'Tarefa',
  event: 'Evento',
  reminder: 'Lembrete',
}

const TAG_COLORS = [
  { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  { bg: 'rgba(14,165,233,0.15)', color: '#38bdf8' },
  { bg: 'rgba(168,85,247,0.15)', color: '#c084fc' },
]

function tagColor(tag: string) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length] ?? TAG_COLORS[0]!
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

// ─── AGENDA CUSTOMIZE PANEL ────────────────────────────────────────
function AgendaCustomizePanel({ onClose }: { onClose: () => void }) {
  const { agenda, setAgenda, resetAgenda } = useToolsStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

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
        <button onClick={resetAgenda} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--fg-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <RotateCcw size={11} /> Restaurar
        </button>
      </div>
      <p style={{ fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-dim)', margin: '14px 0 6px' }}>Painel direito</p>
      {row('Calendário', agenda.showCalendar, () => setAgenda({ showCalendar: !agenda.showCalendar }))}
      {row('Próximos eventos', agenda.showUpcoming, () => setAgenda({ showUpcoming: !agenda.showUpcoming }))}
      {row('Criar evento rápido', agenda.showQuickCreate, () => setAgenda({ showQuickCreate: !agenda.showQuickCreate }))}
      <p style={{ fontFamily: 'Geist Mono', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-dim)', margin: '14px 0 6px' }}>Filtro padrão</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(['all','today','week','done'] as const).map(f => {
          const labels = { all: 'Todas', today: 'Hoje', week: 'Esta semana', done: 'Concluídas' }
          const active = agenda.defaultFilter === f
          return (
            <button key={f} onClick={() => setAgenda({ defaultFilter: f })} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: active ? 600 : 400, border: '1px solid', borderColor: active ? 'var(--accent)' : 'var(--border)', background: active ? 'var(--accent-dim)' : 'transparent', color: active ? 'var(--accent)' : 'var(--fg-dim)', cursor: 'pointer', transition: 'all 0.1s' }}>
              {labels[f]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type FilterTab = 'all' | 'today' | 'week' | 'done'

const FILTER_TABS: Array<{ key: FilterTab; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'today', label: 'Hoje' },
  { key: 'week', label: 'Esta semana' },
  { key: 'done', label: 'Concluídas' },
]

// ─── TASK ROW ─────────────────────────────────────────────────────

interface TaskRowProps {
  item: AgendaItem
  onToggle: (id: string) => void
  isExpanded: boolean
  onExpand: (id: string) => void
}

function TaskRow({ item, onToggle, isExpanded, onExpand }: TaskRowProps) {
  const isOverdue = item.dueDate && !item.done && new Date(item.dueDate) < new Date()

  return (
    <div style={{
      borderBottom: '1px solid var(--border)',
      transition: 'background 0.1s',
    }}>
      {/* Main row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        {/* Checkbox */}
        <button
          onClick={e => { e.stopPropagation(); onToggle(item.id) }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: item.done ? 'var(--green)' : 'var(--fg-dim)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
          aria-label={item.done ? 'Marcar como pendente' : 'Marcar como concluída'}
        >
          {item.done
            ? <CheckSquare style={{ width: 16, height: 16 }} />
            : <Square style={{ width: 16, height: 16 }} />}
        </button>

        {/* Expand toggle */}
        <button
          onClick={() => onExpand(item.id)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--fg-dim)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          {isExpanded
            ? <ChevronDown style={{ width: 14, height: 14 }} />
            : <ChevronRightIcon style={{ width: 14, height: 14 }} />}
        </button>

        {/* Title */}
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 500,
            color: item.done ? 'var(--fg-dim)' : 'var(--fg)',
            textDecoration: item.done ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title}
        </span>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {item.tags.slice(0, 2).map(tag => {
            const { bg, color } = tagColor(tag)
            return (
              <span key={tag} style={{
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 20,
                background: bg,
                color,
                fontWeight: 600,
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}>{tag}</span>
            )
          })}
          {item.tags.length > 2 && (
            <span style={{ fontSize: 10, color: 'var(--fg-dim)', padding: '2px 4px' }}>
              +{item.tags.length - 2}
            </span>
          )}
        </div>

        {/* Due date */}
        {item.dueDate && (
          <span style={{
            fontFamily: 'Geist Mono, monospace',
            fontSize: 10,
            color: isOverdue ? 'var(--red)' : 'var(--fg-dim)',
            flexShrink: 0,
          }}>
            {formatDate(item.dueDate)}
          </span>
        )}

        {/* Priority dot */}
        <span style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: PRIORITY_DOT_COLORS[item.priority],
          flexShrink: 0,
        }} title={item.priority} />

        {/* Avatar */}
        <div style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'var(--surface-3)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 9,
          fontWeight: 700,
          color: 'var(--fg-muted)',
          flexShrink: 0,
          fontFamily: 'Geist Mono, monospace',
        }} title={item.assignedTo}>
          {getInitials(item.assignedTo)}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div style={{
          padding: '12px 20px 14px 58px',
          background: 'var(--surface-2)',
          borderTop: '1px solid var(--border)',
        }}>
          {item.description && (
            <p style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.6, margin: '0 0 10px' }}>
              {item.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--fg-dim)' }}>
            <span><strong style={{ color: 'var(--fg-muted)' }}>Tipo:</strong> {TYPE_LABELS[item.type]}</span>
            <span><strong style={{ color: 'var(--fg-muted)' }}>Responsável:</strong> {item.assignedTo}</span>
            {item.dueDate && (
              <span><strong style={{ color: 'var(--fg-muted)' }}>Vencimento:</strong> {formatDateFull(item.dueDate)}</span>
            )}
          </div>
          {item.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
              {item.tags.map(tag => {
                const { bg, color } = tagColor(tag)
                return (
                  <span key={tag} style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: bg,
                    color,
                    fontWeight: 600,
                  }}>{tag}</span>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MINI CALENDAR ────────────────────────────────────────────────

interface MiniCalendarProps {
  items: AgendaItem[]
  selectedDate: Date
  onSelectDate: (d: Date) => void
}

function MiniCalendar({ items, selectedDate, onSelectDate }: MiniCalendarProps) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())

  const today = new Date()
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  // days that have events
  const eventDays = new Set(
    items
      .filter(i => i.dueDate)
      .map(i => {
        const d = new Date(i.dueDate!)
        if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
          return d.getDate()
        }
        return null
      })
      .filter((d): d is number => d !== null)
  )

  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const dayNames = ['D','S','T','Q','Q','S','S']

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // pad to 6 rows
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-dim)', padding: '2px 6px', borderRadius: 4 }}>
          ‹
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-dim)', padding: '2px 6px', borderRadius: 4 }}>
          ›
        </button>
      </div>

      {/* Day names */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {dayNames.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center',
            fontFamily: 'Geist Mono, monospace',
            fontSize: 9,
            color: 'var(--fg-dim)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '2px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const isT = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
          const isSel = selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day
          const hasEvent = eventDays.has(day)

          return (
            <button
              key={i}
              onClick={() => onSelectDate(new Date(viewYear, viewMonth, day))}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1',
                borderRadius: 6,
                border: 'none',
                fontSize: 12,
                fontWeight: isT ? 700 : 400,
                background: isSel ? 'var(--accent)' : isT ? 'var(--accent-dim)' : 'transparent',
                color: isSel ? '#0C0A09' : isT ? 'var(--accent)' : 'var(--fg)',
                cursor: 'pointer',
                padding: 0,
                minWidth: 0,
              }}
            >
              {day}
              {hasEvent && !isSel && (
                <span style={{
                  position: 'absolute',
                  bottom: 2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── QUICK CREATE FORM ────────────────────────────────────────────

interface QuickCreateProps {
  onCreate: (item: AgendaItem) => void
}

function QuickCreateForm({ onCreate }: QuickCreateProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState<AgendaItemType>('event')
  const [assign, setAssign] = useState('Admin Geral')
  const [open, setOpen] = useState(false)

  function handleCreate() {
    if (!title.trim()) return
    const newItem: AgendaItem = {
      id: `ag_${Date.now()}`,
      title: title.trim(),
      type,
      done: false,
      priority: 'medium',
      dueDate: date ? new Date(date).toISOString() : null,
      assignedTo: assign || 'Admin Geral',
      tags: [],
      createdAt: new Date().toISOString(),
    }
    onCreate(newItem)
    setTitle('')
    setDate('')
    setType('event')
    setOpen(false)
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--fg)',
    fontSize: 12,
    padding: '6px 10px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Geist Mono, monospace',
    fontSize: 9,
    color: 'var(--fg-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    display: 'block',
    marginBottom: 4,
  }

  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '12px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--fg)',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <Plus style={{ width: 14, height: 14, color: 'var(--accent)' }} />
        Criar evento
        {open
          ? <ChevronDown style={{ width: 12, height: 12, color: 'var(--fg-dim)', marginLeft: 'auto' }} />
          : <ChevronRightIcon style={{ width: 12, height: 12, color: 'var(--fg-dim)', marginLeft: 'auto' }} />}
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={labelStyle}>Título *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título do evento..."
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Data</label>
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={type} onChange={e => setType(e.target.value as AgendaItemType)} style={inputStyle}>
                <option value="event">Evento</option>
                <option value="task">Tarefa</option>
                <option value="reminder">Lembrete</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Responsável</label>
              <input
                value={assign}
                onChange={e => setAssign(e.target.value)}
                placeholder="Nome..."
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={!title.trim()}>
              Criar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────

export default function AgendaPage() {
  const user = useAuthStore(s => s.user)
  const { agenda: agendaConfig } = useToolsStore()
  const isSuperAdmin = user?.role === 'superadmin'

  const [items, setItems] = useState<AgendaItem[]>(MOCK_AGENDA_ITEMS)
  const [filterTab, setFilterTab] = useState<FilterTab>(agendaConfig.defaultFilter)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [customizeOpen, setCustomizeOpen] = useState(false)

  function handleToggle(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  function handleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  function handleCreate(item: AgendaItem) {
    setItems(prev => [item, ...prev])
  }

  function handleCreateTask() {
    if (!newTaskTitle.trim()) return
    const newItem: AgendaItem = {
      id: `ag_${Date.now()}`,
      title: newTaskTitle.trim(),
      type: 'task',
      done: false,
      priority: 'medium',
      dueDate: null,
      assignedTo: 'Admin Geral',
      tags: [],
      createdAt: new Date().toISOString(),
    }
    setItems(prev => [newItem, ...prev])
    setNewTaskTitle('')
    setShowNewTask(false)
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filterTab === 'done') return item.done
      if (filterTab === 'today') return item.dueDate ? isToday(item.dueDate) : false
      if (filterTab === 'week') return item.dueDate ? isThisWeek(item.dueDate) : false
      return true
    })
  }, [items, filterTab])

  const upcomingEvents = useMemo(() => {
    return [...items]
      .filter(i => i.dueDate && !i.done)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 6)
  }, [items])

  return (
    <div style={{ padding: '24px 28px', minHeight: '100%' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarDays style={{ width: 18, height: 18, color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', margin: 0 }}>Agenda</h1>
            <p style={{ fontSize: 12, color: 'var(--fg-muted)', margin: 0, marginTop: 1 }}>Tarefas, eventos e lembretes da equipe</p>
          </div>
        </div>
        {isSuperAdmin && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setCustomizeOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 6, border: '1px solid', borderColor: customizeOpen ? 'var(--accent)' : 'var(--border)', background: customizeOpen ? 'var(--accent-dim)' : 'var(--surface-2)', color: customizeOpen ? 'var(--accent)' : 'var(--fg-muted)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.1s' }}
            >
              <SlidersHorizontal size={12} />
              Personalizar
            </button>
            {customizeOpen && <AgendaCustomizePanel onClose={() => setCustomizeOpen(false)} />}
          </div>
        )}
      </div>

      {/* Split layout */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* LEFT: Task list (60%) */}
        <div style={{ flex: '0 0 60%', minWidth: 0 }}>
          <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            {/* Task list header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px 12px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-2)',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>Tarefas</span>
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus style={{ width: 13, height: 13 }} />}
                onClick={() => setShowNewTask(s => !s)}
              >
                Nova tarefa
              </Button>
            </div>

            {/* Inline new task */}
            {showNewTask && (
              <div style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface-2)',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}>
                <Input
                  placeholder="Título da tarefa..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateTask() }}
                  containerClassName="flex-1"
                />
                <Button variant="primary" size="sm" onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
                  Adicionar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setShowNewTask(false); setNewTaskTitle('') }}>
                  Cancelar
                </Button>
              </div>
            )}

            {/* Filter tabs */}
            <div style={{
              display: 'flex',
              gap: 2,
              padding: '8px 12px',
              borderBottom: '1px solid var(--border)',
            }}>
              {FILTER_TABS.map(tab => {
                const active = filterTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilterTab(tab.key)}
                    style={{
                      padding: '4px 12px',
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

            {/* Task rows */}
            {filteredItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--fg-dim)', fontSize: 13 }}>
                Nenhuma tarefa neste filtro.
              </div>
            ) : (
              filteredItems.map(item => (
                <TaskRow
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  isExpanded={expandedId === item.id}
                  onExpand={handleExpand}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Calendar + events (40%) */}
        <div style={{ flex: '0 0 40%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Mini Calendar */}
          {agendaConfig.showCalendar && (
          <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '18px 18px 14px',
          }}>
            <MiniCalendar
              items={items}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
          )}

          {/* Upcoming events */}
          {agendaConfig.showUpcoming && <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '13px 16px 11px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-2)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>Próximos eventos</span>
            </div>

            {upcomingEvents.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: 12, color: 'var(--fg-dim)' }}>
                Nenhum evento próximo.
              </div>
            ) : (
              upcomingEvents.map(item => {
                const TypeIcon = TYPE_ICONS[item.type]
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <TypeIcon style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--fg)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-dim)' }}>{item.assignedTo}</div>
                    </div>
                    {item.dueDate && (
                      <span style={{
                        fontFamily: 'Geist Mono, monospace',
                        fontSize: 10,
                        color: 'var(--fg-dim)',
                        flexShrink: 0,
                      }}>
                        {formatDateFull(item.dueDate)}
                      </span>
                    )}
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: PRIORITY_DOT_COLORS[item.priority],
                      flexShrink: 0,
                    }} />
                  </div>
                )
              })
            )}
          </div>}

          {/* Quick create */}
          {agendaConfig.showQuickCreate && <QuickCreateForm onCreate={handleCreate} />}
        </div>
      </div>
    </div>
  )
}
