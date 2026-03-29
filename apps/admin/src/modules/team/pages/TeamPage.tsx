import { useState } from 'react'
import { Users, Plus, Pencil, UserX, UserCheck, Trash2, ShieldCheck, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { Input } from '@/shared/components/Input'
import { useTeamStore, DEFAULT_PERMISSIONS, PERMISSION_LABELS, SECTION_LABELS } from '@/shared/store/team'
import type { TeamMember, GranularPermissions } from '@/shared/store/team'
import type { AdminRole } from '@/modules/auth/store'

// ─── HELPERS ──────────────────────────────────────────────────────

const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin:  'Super Admin',
  support:     'Suporte',
  sales:       'Vendas',
  technician:  'Técnico',
}

const ROLE_COLORS: Record<AdminRole, { bg: string; color: string }> = {
  superadmin:  { bg: 'rgba(232,168,48,0.12)', color: 'var(--accent)' },
  support:     { bg: 'rgba(77,184,100,0.12)',  color: 'var(--green)' },
  sales:       { bg: 'rgba(77,180,232,0.12)',  color: '#4DBCE8' },
  technician:  { bg: 'rgba(123,104,238,0.12)', color: '#7B68EE' },
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0] ?? '').join('').toUpperCase()
}

// ─── TOGGLE ────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        width: 32, height: 18, borderRadius: 9,
        background: checked ? 'var(--accent)' : 'var(--surface-3)',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background 0.15s',
        flexShrink: 0, padding: 0, opacity: disabled ? 0.4 : 1,
      }}
    >
      <span style={{ position: 'absolute', top: 2, left: checked ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
    </button>
  )
}

// ─── PERMISSION SECTION ───────────────────────────────────────────
function PermSection({
  sectionKey,
  perms,
  onChange,
  disabled,
}: {
  sectionKey: keyof GranularPermissions
  perms: GranularPermissions[keyof GranularPermissions]
  onChange: (key: string, val: boolean) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(true)
  const labels = PERMISSION_LABELS[sectionKey] ?? {}
  const keys = Object.keys(perms) as Array<keyof typeof perms>
  const enabledCount = keys.filter(k => perms[k]).length

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', background: 'var(--surface-2)', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {open ? <ChevronDown size={13} color="var(--fg-dim)" /> : <ChevronRight size={13} color="var(--fg-dim)" />}
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{SECTION_LABELS[sectionKey]}</span>
        </div>
        <span style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600,
          color: enabledCount > 0 ? 'var(--accent)' : 'var(--fg-dim)',
          background: enabledCount > 0 ? 'var(--accent-dim)' : 'var(--surface-3)',
          padding: '2px 7px', borderRadius: 10,
        }}>
          {enabledCount}/{keys.length}
        </span>
      </button>

      {open && (
        <div style={{ padding: '8px 0' }}>
          {keys.map(k => (
            <div key={String(k)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ fontSize: 13, color: perms[k] ? 'var(--fg)' : 'var(--fg-dim)' }}>
                {labels[String(k)] ?? String(k)}
              </span>
              <Toggle
                checked={!!perms[k]}
                onChange={() => onChange(String(k), !perms[k])}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── CREATE / EDIT MODAL ──────────────────────────────────────────
interface MemberModalProps {
  member?: TeamMember
  onClose: () => void
}

function MemberModal({ member, onClose }: MemberModalProps) {
  const { addMember, updateMember } = useTeamStore()
  const isEdit = !!member

  const [name, setName] = useState(member?.name ?? '')
  const [email, setEmail] = useState(member?.email ?? '')
  const [role, setRole] = useState<AdminRole>(member?.role ?? 'technician')
  const [perms, setPerms] = useState<GranularPermissions>(
    member?.permissions ?? DEFAULT_PERMISSIONS.technician
  )

  function handleRoleChange(newRole: AdminRole) {
    setRole(newRole)
    // pre-fill permissions from role default, keep custom overrides if editing
    setPerms(DEFAULT_PERMISSIONS[newRole])
  }

  function handlePermChange(section: keyof GranularPermissions, key: string, val: boolean) {
    setPerms(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: val },
    }))
  }

  function handleSave() {
    if (!name.trim() || !email.trim()) return
    if (isEdit) {
      updateMember(member.id, { name: name.trim(), email: email.trim(), role, permissions: perms })
    } else {
      addMember({ name: name.trim(), email: email.trim(), role, permissions: perms, status: 'active' })
    }
    onClose()
  }

  const selectStyle: React.CSSProperties = {
    background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6,
    color: 'var(--fg)', fontSize: 13, padding: '7px 10px', width: '100%',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Geist Mono, monospace', fontSize: 10, color: 'var(--fg-dim)',
    textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: 5,
  }

  const sections = Object.keys(perms) as Array<keyof GranularPermissions>

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? `Editar — ${member.name}` : 'Novo Funcionário'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!name.trim() || !email.trim()}>
            {isEdit ? 'Salvar alterações' : 'Criar funcionário'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Basic info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input label="Nome *" value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" />
          <Input label="E-mail *" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@empresa.com" />
        </div>

        {/* Role */}
        <div>
          <label style={labelStyle}>Perfil base</label>
          <select value={role} onChange={e => handleRoleChange(e.target.value as AdminRole)} style={selectStyle}>
            <option value="technician">Técnico — acesso às ferramentas</option>
            <option value="support">Suporte — ferramentas + tenants</option>
            <option value="sales">Vendas — dashboard + planos</option>
            <option value="superadmin">Super Admin — acesso total</option>
          </select>
          <p style={{ fontSize: 11, color: 'var(--fg-dim)', marginTop: 5 }}>
            Selecionar um perfil preenche as permissões automaticamente. Você pode ajustar individualmente abaixo.
          </p>
        </div>

        {/* Permissions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldCheck size={14} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>Permissões</span>
            <span style={{ fontSize: 11, color: 'var(--fg-dim)' }}>— clique em cada seção para expandir</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sections.map(s => (
              <PermSection
                key={s}
                sectionKey={s}
                perms={perms[s]}
                onChange={(key, val) => handlePermChange(s, key, val)}
                disabled={role === 'superadmin'}
              />
            ))}
          </div>
          {role === 'superadmin' && (
            <p style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 8 }}>
              Super Admin tem todas as permissões e não pode ser restringido.
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── VIEW PERMISSIONS MODAL ───────────────────────────────────────
function ViewPermissionsModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const sections = Object.keys(member.permissions) as Array<keyof GranularPermissions>
  return (
    <Modal open onClose={onClose} title={`Permissões — ${member.name}`} size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sections.map(s => {
          const perms = member.permissions[s]
          const keys = Object.keys(perms) as Array<keyof typeof perms>
          const labels = PERMISSION_LABELS[s] ?? {}
          const enabled = keys.filter(k => perms[k])
          const disabled = keys.filter(k => !perms[k])
          return (
            <div key={s} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: 'var(--surface-2)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{SECTION_LABELS[s]}</span>
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: enabled.length > 0 ? 'var(--accent)' : 'var(--fg-dim)', background: enabled.length > 0 ? 'var(--accent-dim)' : 'var(--surface-3)', padding: '2px 7px', borderRadius: 10 }}>
                  {enabled.length}/{keys.length}
                </span>
              </div>
              <div style={{ padding: '6px 0' }}>
                {enabled.map(k => (
                  <div key={String(k)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{labels[String(k)] ?? String(k)}</span>
                  </div>
                ))}
                {disabled.map(k => (
                  <div key={String(k)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', opacity: 0.4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fg-dim)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--fg-dim)', textDecoration: 'line-through' }}>{labels[String(k)] ?? String(k)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function TeamPage() {
  const { members, toggleStatus, removeMember } = useTeamStore()
  const [showCreate, setShowCreate] = useState(false)
  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [viewPerms, setViewPerms] = useState<TeamMember | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<TeamMember | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<AdminRole | 'all'>('all')

  const filtered = members.filter(m => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div style={{ padding: '24px 28px', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users style={{ width: 18, height: 18, color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fg)', margin: 0 }}>Equipe</h1>
            <p style={{ fontSize: 12, color: 'var(--fg-muted)', margin: 0, marginTop: 1 }}>
              Gerencie funcionários e suas permissões
            </p>
          </div>
          <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 700, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 10px', color: 'var(--fg-muted)' }}>
            {members.filter(m => m.status === 'active').length} ativos
          </span>
        </div>
        <Button variant="primary" size="sm" icon={<Plus style={{ width: 14, height: 14 }} />} onClick={() => setShowCreate(true)}>
          Novo Funcionário
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'superadmin', 'support', 'sales', 'technician'] as const).map(r => {
            const active = roleFilter === r
            return (
              <button key={r} onClick={() => setRoleFilter(r)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: active ? 600 : 400, border: '1px solid', borderColor: active ? 'var(--accent)' : 'var(--border)', background: active ? 'var(--accent-dim)' : 'transparent', color: active ? 'var(--accent)' : 'var(--fg-muted)', cursor: 'pointer', transition: 'all 0.1s' }}>
                {r === 'all' ? 'Todos' : ROLE_LABELS[r]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Member grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {filtered.map(m => {
          const rc = ROLE_COLORS[m.role]
          const sections = Object.keys(m.permissions) as Array<keyof GranularPermissions>
          const totalPerms = sections.reduce((acc, s) => acc + Object.keys(m.permissions[s]).length, 0)
          const enabledPerms = sections.reduce((acc, s) => {
            const p = m.permissions[s] as Record<string, boolean>
            return acc + Object.values(p).filter(Boolean).length
          }, 0)

          return (
            <div key={m.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px', opacity: m.status === 'inactive' ? 0.6 : 1, transition: 'opacity 0.2s', position: 'relative', overflow: 'hidden' }}>
              {/* inactive overlay line */}
              {m.status === 'inactive' && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--red)' }} />
              )}

              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: rc.bg, border: `1px solid ${rc.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: rc.color, fontFamily: 'Geist Mono, monospace', flexShrink: 0 }}>
                    {getInitials(m.name)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: m.status === 'inactive' ? 'var(--fg-dim)' : 'var(--fg)', margin: 0 }}>{m.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--fg-dim)', margin: 0, marginTop: 1 }}>{m.email}</p>
                  </div>
                </div>
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 700, background: rc.bg, color: rc.color, padding: '3px 8px', borderRadius: 4, flexShrink: 0 }}>
                  {ROLE_LABELS[m.role]}
                </span>
              </div>

              {/* Permissions summary */}
              <button
                onClick={() => setViewPerms(m)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 10px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', marginBottom: 14, transition: 'border-color 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={13} color="var(--accent)" />
                  <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Permissões</span>
                </div>
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                  {enabledPerms}/{totalPerms}
                </span>
              </button>

              {/* Permission dots by section */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 16 }}>
                {sections.map(s => {
                  const p = m.permissions[s] as Record<string, boolean>
                  const count = Object.values(p).filter(Boolean).length
                  const total = Object.keys(p).length
                  const hasAny = count > 0
                  return (
                    <span key={s} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 500, background: hasAny ? 'rgba(77,184,100,0.1)' : 'var(--surface-3)', color: hasAny ? 'var(--green)' : 'var(--fg-dim)', border: `1px solid ${hasAny ? 'rgba(77,184,100,0.2)' : 'transparent'}` }}>
                      {SECTION_LABELS[s]} {count}/{total}
                    </span>
                  )
                })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => setEditMember(m)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'center', padding: '6px 0', borderRadius: 6, background: 'var(--surface-3)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, color: 'var(--fg-muted)', transition: 'all 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-muted)' }}
                >
                  <Pencil size={12} /> Editar
                </button>
                <button
                  onClick={() => toggleStatus(m.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'center', padding: '6px 0', borderRadius: 6, background: 'var(--surface-3)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, color: m.status === 'active' ? 'var(--fg-muted)' : 'var(--green)', transition: 'all 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = m.status === 'active' ? 'var(--yellow)' : 'var(--green)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                  title={m.status === 'active' ? 'Desativar acesso' : 'Reativar acesso'}
                >
                  {m.status === 'active' ? <UserX size={12} /> : <UserCheck size={12} />}
                  {m.status === 'active' ? 'Desativar' : 'Reativar'}
                </button>
                {m.role !== 'superadmin' && (
                  <button
                    onClick={() => setConfirmRemove(m)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, borderRadius: 6, background: 'var(--surface-3)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--fg-dim)', transition: 'all 0.1s', flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.background = 'rgba(212,100,74,0.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-dim)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)' }}
                    title="Remover funcionário"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--fg-dim)', fontSize: 13 }}>
            Nenhum funcionário encontrado.
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && <MemberModal onClose={() => setShowCreate(false)} />}
      {editMember && <MemberModal member={editMember} onClose={() => setEditMember(null)} />}
      {viewPerms && <ViewPermissionsModal member={viewPerms} onClose={() => setViewPerms(null)} />}

      {/* Confirm remove */}
      {confirmRemove && (
        <Modal
          open
          onClose={() => setConfirmRemove(null)}
          title="Remover funcionário"
          size="sm"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(null)}>Cancelar</Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => { removeMember(confirmRemove.id); setConfirmRemove(null) }}
              >
                Remover
              </Button>
            </>
          }
        >
          <p style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
            Tem certeza que deseja remover <strong style={{ color: 'var(--fg)' }}>{confirmRemove.name}</strong>?
            Esta ação não pode ser desfeita.
          </p>
        </Modal>
      )}
    </div>
  )
}
