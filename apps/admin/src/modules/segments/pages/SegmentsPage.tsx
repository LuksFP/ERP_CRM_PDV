import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Edit2, Plus, Play, Check } from 'lucide-react'
import { MOCK_SEGMENT_TEMPLATES } from '@/mock/data'
import type { SegmentTemplate, ModuleType } from '@/shared/types'
import { moduleLabels } from '@/shared/utils/format'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { Modal } from '@/shared/components/Modal'
import { cn } from '@/shared/utils/cn'

// ─── ANIMATED ERP DEMO ───────────────────────────────────────────
interface DemoRow {
  columns: string[]
  highlight?: boolean
}

interface DemoConfig {
  title: string
  headers: string[]
  rows: DemoRow[]
  stats: Array<{ label: string; value: string; color: string }>
}

const SEGMENT_DEMOS: Record<string, DemoConfig> = {
  pharmacy: {
    title: 'ERP Farmácia — Estoque com ANVISA',
    headers: ['Produto', 'Lote', 'Validade', 'Estoque', 'Status'],
    rows: [
      { columns: ['Dipirona 500mg', 'LOT-2024-A', '08/2025', '150 un', 'OK'], highlight: false },
      { columns: ['Amoxicilina 250mg', 'LOT-2024-B', '03/2024', '22 un', 'VENCENDO'], highlight: true },
      { columns: ['Ibuprofeno 600mg', 'LOT-2024-C', '12/2025', '88 un', 'OK'], highlight: false },
      { columns: ['Omeprazol 20mg', 'LOT-2024-D', '06/2024', '5 un', 'CRÍTICO'], highlight: true },
      { columns: ['Vitamina C 1g', 'LOT-2024-E', '09/2025', '200 un', 'OK'], highlight: false },
    ],
    stats: [
      { label: 'Produtos', value: '1.240', color: '#5CB870' },
      { label: 'Vencendo', value: '18', color: '#D4A84A' },
      { label: 'Vendas hoje', value: 'R$ 3.420', color: '#E2A336' },
      { label: 'Receitas', value: '42', color: '#3B82F6' },
    ],
  },
  supermarket: {
    title: 'ERP Supermercado — PDV + Balança',
    headers: ['Código', 'Produto', 'Qtd', 'Unitário', 'Total'],
    rows: [
      { columns: ['7891000', 'Arroz Tio João 5kg', '2', 'R$ 28,90', 'R$ 57,80'], highlight: false },
      { columns: ['7892000', 'Feijão Carioca 1kg', '3', 'R$ 8,50', 'R$ 25,50'], highlight: false },
      { columns: ['BAL001', 'Frango Peito 1,2kg', '1', 'R$ 18,90/kg', 'R$ 22,68'], highlight: true },
      { columns: ['7893000', 'Leite Integral 1L', '6', 'R$ 4,49', 'R$ 26,94'], highlight: false },
      { columns: ['7894000', 'Pão de Forma', '1', 'R$ 8,90', 'R$ 8,90'], highlight: false },
    ],
    stats: [
      { label: 'PDVs ativos', value: '8', color: '#5CB870' },
      { label: 'Ticket médio', value: 'R$ 87', color: '#E2A336' },
      { label: 'Vendas/dia', value: '312', color: '#3B82F6' },
      { label: 'Faturamento', value: 'R$ 27.144', color: '#5CB870' },
    ],
  },
  bakery: {
    title: 'ERP Padaria — Produção + PDV',
    headers: ['Produto', 'Receita', 'Produção', 'Vendido', 'Margem'],
    rows: [
      { columns: ['Pão Francês', '200g farinha/un', '320 un', '298 un', '68%'], highlight: false },
      { columns: ['Croissant', '120g manteiga/un', '48 un', '48 un', '72%'], highlight: true },
      { columns: ['Bolo Cenoura', 'Ficha técnica', '6 un', '4 un', '54%'], highlight: false },
      { columns: ['Cuca de Uva', 'Ficha técnica', '12 un', '10 un', '61%'], highlight: false },
      { columns: ['Rosca Doce', '80g açúcar/un', '60 un', '55 un', '59%'], highlight: false },
    ],
    stats: [
      { label: 'Produção/dia', value: '486 un', color: '#D97706' },
      { label: 'Desperdício', value: '2.3%', color: '#5CB870' },
      { label: 'Vendas', value: 'R$ 1.840', color: '#E2A336' },
      { label: 'CMV', value: '32%', color: '#D4A84A' },
    ],
  },
  butcher: {
    title: 'ERP Açougue — Rastreabilidade SIF',
    headers: ['Corte', 'SIF', 'Espécie', 'Peso (kg)', 'R$/kg'],
    rows: [
      { columns: ['Picanha', 'SIF 1234', 'Bovina', '8,4 kg', 'R$ 89,90'], highlight: false },
      { columns: ['Costela', 'SIF 1234', 'Bovina', '12,2 kg', 'R$ 34,90'], highlight: false },
      { columns: ['Alcatra', 'SIF 5678', 'Bovina', '6,8 kg', 'R$ 54,90'], highlight: true },
      { columns: ['Frango Inteiro', 'SIF 9012', 'Aves', '22,0 kg', 'R$ 16,90'], highlight: false },
      { columns: ['Linguiça Toscana', 'SIF 3456', 'Suína', '9,5 kg', 'R$ 24,90'], highlight: false },
    ],
    stats: [
      { label: 'Estoque kg', value: '412 kg', color: '#5CB870' },
      { label: 'Vendas/dia', value: 'R$ 2.380', color: '#E2A336' },
      { label: 'Ticket médio', value: 'R$ 68', color: '#3B82F6' },
      { label: 'Rastr. OK', value: '100%', color: '#5CB870' },
    ],
  },
  restaurant: {
    title: 'ERP Restaurante — Mesas + Comandas',
    headers: ['Mesa', 'Pedido', 'Qtd', 'Status', 'Total'],
    rows: [
      { columns: ['Mesa 01', 'Filé Mignon c/ Fritas', '2', 'SERVIDO', 'R$ 124,00'], highlight: false },
      { columns: ['Mesa 03', 'Frango Grelhado', '1', 'PREP.', 'R$ 38,00'], highlight: true },
      { columns: ['Mesa 05', 'Peixe ao Molho Branco', '3', 'PREP.', 'R$ 183,00'], highlight: true },
      { columns: ['Mesa 07', 'Prato do Dia', '4', 'PAGO', 'R$ 140,00'], highlight: false },
      { columns: ['Mesa 09', 'Risoto de Camarão', '2', 'PEDIDO', 'R$ 178,00'], highlight: false },
    ],
    stats: [
      { label: 'Mesas abertas', value: '7/12', color: '#E2A336' },
      { label: 'Ticket médio', value: 'R$ 92', color: '#5CB870' },
      { label: 'Tempo médio', value: '38 min', color: '#3B82F6' },
      { label: 'CMV', value: '28%', color: '#D4A84A' },
    ],
  },
  clothing: {
    title: 'ERP Vestuário — Grade + Coleções',
    headers: ['Produto', 'Coleção', 'Tamanhos', 'Total', 'Vendido'],
    rows: [
      { columns: ['Blusa Básica Branca', 'Verão 2024', 'P M G GG', '45 un', '28 un'], highlight: false },
      { columns: ['Calça Jeans Slim', 'Inverno 2024', '36 38 40 42', '22 un', '15 un'], highlight: true },
      { columns: ['Vestido Floral', 'Primavera', 'P M G', '18 un', '18 un'], highlight: true },
      { columns: ['Blazer Feminino', 'Executiva', 'P M G', '12 un', '4 un'], highlight: false },
      { columns: ['Short Jeans', 'Verão 2024', '34 36 38', '30 un', '21 un'], highlight: false },
    ],
    stats: [
      { label: 'SKUs ativos', value: '820', color: '#8B5CF6' },
      { label: 'Giro médio', value: '68%', color: '#5CB870' },
      { label: 'Ticket médio', value: 'R$ 145', color: '#E2A336' },
      { label: 'Consignado', value: '12%', color: '#3B82F6' },
    ],
  },
  electronics: {
    title: 'ERP Eletrônicos — Série + Garantia',
    headers: ['Produto', 'Nº Série', 'Garantia', 'Status', 'Preço'],
    rows: [
      { columns: ['iPhone 15 Pro 256GB', 'XA9B2C3D', '24 meses', 'ESTOQUE', 'R$ 7.999'], highlight: false },
      { columns: ['Samsung A55 128GB', 'K7L8M9N0', '12 meses', 'RESERVADO', 'R$ 1.899'], highlight: true },
      { columns: ['AirPods Pro 2ª', 'P4Q5R6S7', '12 meses', 'ESTOQUE', 'R$ 1.799'], highlight: false },
      { columns: ['MacBook Air M3', 'T8U9V0W1', '12 meses', 'ASSISTÊNCIA', 'R$ 9.999'], highlight: true },
      { columns: ['Xiaomi Redmi 13', 'X2Y3Z4A5', '12 meses', 'ESTOQUE', 'R$ 1.099'], highlight: false },
    ],
    stats: [
      { label: 'Em estoque', value: '142 un', color: '#5CB870' },
      { label: 'Assistência', value: '8 eq.', color: '#D4A84A' },
      { label: 'Ticket médio', value: 'R$ 2.840', color: '#E2A336' },
      { label: 'Garantia exp.', value: '3 este mês', color: '#D4644A' },
    ],
  },
  other: {
    title: 'ERP Geral — Produtos e Vendas',
    headers: ['Código', 'Produto', 'Categoria', 'Estoque', 'Preço'],
    rows: [
      { columns: ['001', 'Produto A Premium', 'Categoria 1', '120 un', 'R$ 45,00'], highlight: false },
      { columns: ['002', 'Produto B Standard', 'Categoria 2', '55 un', 'R$ 89,90'], highlight: false },
      { columns: ['003', 'Produto C Especial', 'Categoria 1', '8 un', 'R$ 199,00'], highlight: true },
      { columns: ['004', 'Produto D Básico', 'Categoria 3', '200 un', 'R$ 12,50'], highlight: false },
      { columns: ['005', 'Produto E Pro', 'Categoria 2', '32 un', 'R$ 67,90'], highlight: false },
    ],
    stats: [
      { label: 'Produtos', value: '312', color: '#5CB870' },
      { label: 'Vendas/dia', value: '48', color: '#E2A336' },
      { label: 'Ticket médio', value: 'R$ 78', color: '#3B82F6' },
      { label: 'Faturamento', value: 'R$ 3.744', color: '#5CB870' },
    ],
  },
}

// ─── ANIMATED DEMO COMPONENT ─────────────────────────────────────
function AnimatedERPDemo({ segmentType, active }: { segmentType: string; active: boolean }) {
  const [highlightedRow, setHighlightedRow] = useState(-1)
  const demo = SEGMENT_DEMOS[segmentType] ?? SEGMENT_DEMOS['other']!

  useEffect(() => {
    if (!active) {
      setHighlightedRow(-1)
      return
    }

    let idx = 0
    const highlightRows = demo.rows
      .map((r, i) => ({ i, highlight: r.highlight }))
      .filter((r) => r.highlight)

    if (highlightRows.length === 0) return

    const interval = setInterval(() => {
      const row = highlightRows[idx % highlightRows.length]
      setHighlightedRow(row?.i ?? -1)
      idx++
    }, 1400)

    return () => clearInterval(interval)
  }, [active, demo.rows])

  return (
    <div className="rounded-card border border-[var(--border)] overflow-hidden bg-surface-1">
      {/* Fake window chrome */}
      <div className="flex items-center gap-2 px-3 py-2 bg-surface-3 border-b border-[var(--border)]">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-red/50" />
          <div className="h-2 w-2 rounded-full bg-yellow/50" />
          <div className="h-2 w-2 rounded-full bg-green/50" />
        </div>
        <span className="text-2xs font-mono text-fg-dim ml-1">{demo.title}</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
          <span className="text-2xs text-fg-dim">Live</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 border-b border-[var(--border)]">
        {demo.stats.map(({ label, value, color }) => (
          <div key={label} className="px-3 py-2 border-r border-[var(--border)] last:border-0">
            <p className="text-2xs text-fg-dim">{label}</p>
            <p className="text-xs font-semibold font-mono mt-0.5" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ fontSize: '10px' }}>
        <div className="grid border-b border-[var(--border)] bg-surface-2" style={{
          gridTemplateColumns: `repeat(${demo.headers.length}, 1fr)`
        }}>
          {demo.headers.map((h) => (
            <div key={h} className="px-2.5 py-1.5 font-mono uppercase tracking-wide text-fg-dim">
              {h}
            </div>
          ))}
        </div>
        {demo.rows.map((row, i) => (
          <div
            key={i}
            className={cn(
              'grid border-b border-[var(--border)] last:border-0 transition-all duration-300',
              i % 2 !== 0 ? 'bg-surface-2/40' : 'bg-surface-1',
              highlightedRow === i && 'bg-accent-dim ring-1 ring-inset ring-accent/20'
            )}
            style={{ gridTemplateColumns: `repeat(${demo.headers.length}, 1fr)` }}
          >
            {row.columns.map((cell, j) => (
              <div
                key={j}
                className={cn(
                  'px-2.5 py-1.5 font-mono text-fg-muted',
                  j === 0 && 'font-semibold text-fg',
                  highlightedRow === i && j === row.columns.length - 1 && 'text-yellow font-semibold'
                )}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SEGMENT CARD ────────────────────────────────────────────────
function SegmentCard({ template }: { template: SegmentTemplate }) {
  const [demoOpen, setDemoOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <div className="bg-surface-1 border border-[var(--border)] rounded-card overflow-hidden hover:border-[var(--border-hover)] transition-all group">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{template.icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-fg">{template.name}</h3>
              <p className="text-xs text-fg-muted mt-0.5">{template.tenantCount} tenants</p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              icon={<Play className="h-3.5 w-3.5" />}
              onClick={() => setDemoOpen(true)}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit2 className="h-3.5 w-3.5" />}
              onClick={() => setEditOpen(true)}
            />
          </div>
        </div>

        <p className="px-5 text-xs text-fg-muted leading-relaxed">{template.description}</p>

        {/* Modules */}
        <div className="px-5 mt-3">
          <p className="text-2xs font-mono uppercase tracking-wide text-fg-dim mb-1.5">Módulos</p>
          <div className="flex flex-wrap gap-1">
            {template.defaultModules.map((mod) => (
              <span
                key={mod}
                className="text-2xs font-mono px-1.5 py-0.5 rounded bg-green/10 text-green border border-green/20"
              >
                {moduleLabels[mod]}
              </span>
            ))}
          </div>
        </div>

        {/* Custom fields count */}
        <div className="px-5 mt-3 pb-5 flex items-center gap-2">
          <span className="text-2xs font-mono uppercase tracking-wide text-fg-dim">Campos custom:</span>
          <Badge variant="neutral" size="sm">{template.customFieldsPreset.length}</Badge>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-xs text-accent hover:text-accent"
            onClick={() => setDemoOpen(true)}
          >
            Ver demo →
          </Button>
        </div>
      </div>

      {/* Demo modal */}
      <Modal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        title={`Demo — ${template.name}`}
        description="Visualize como o ERP fica para este segmento com dados animados em tempo real."
        size="xl"
      >
        <div className="flex flex-col gap-4">
          <AnimatedERPDemo segmentType={template.type} active={demoOpen} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-2">Módulos pré-ativados</p>
              <div className="flex flex-wrap gap-1">
                {template.defaultModules.map((mod) => (
                  <Badge key={mod} variant="success">{moduleLabels[mod]}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-2">Campos custom</p>
              <div className="flex flex-col gap-1">
                {template.customFieldsPreset.map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green shrink-0" />
                    <span className="text-xs text-fg-muted">{f.label}</span>
                    <span className="text-2xs text-fg-dim font-mono">({f.type})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Editar template: ${template.name}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={() => setEditOpen(false)}>Salvar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">Nome</label>
              <input
                defaultValue={template.name}
                className="h-9 w-full rounded-input bg-surface-2 border border-[var(--border)] px-3 text-sm text-fg outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">Ícone</label>
              <input
                defaultValue={template.icon}
                className="h-9 w-full rounded-input bg-surface-2 border border-[var(--border)] px-3 text-sm text-fg outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">Descrição</label>
            <textarea
              defaultValue={template.description}
              rows={3}
              className="w-full rounded-input bg-surface-2 border border-[var(--border)] px-3 py-2 text-sm text-fg outline-none focus:border-accent resize-none"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">Módulos padrão</p>
            <div className="flex flex-wrap gap-2">
              {(['stock', 'pdv', 'crm', 'financial', 'fiscal', 'hr', 'reports'] as ModuleType[]).map((mod) => (
                <label key={mod} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={template.defaultModules.includes(mod)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span className="text-sm text-fg-muted">{moduleLabels[mod]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────
export default function SegmentsPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
      return MOCK_SEGMENT_TEMPLATES
    },
  })

  const totalTenants = (segments ?? []).reduce((s, t) => s + t.tenantCount, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-fg">Segmentos</h1>
          <p className="text-sm text-fg-muted mt-0.5">
            {segments?.length ?? 0} templates · {totalTenants} tenants
          </p>
        </div>
        <Button variant="primary" size="md" icon={<Plus className="h-4 w-4" />}>
          Novo segmento
        </Button>
      </div>

      {/* Highlight: Demo section */}
      <div className="bg-surface-1 border border-accent/20 rounded-card p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-card flex items-center justify-center bg-accent-dim shrink-0">
            <Play className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-fg mb-1">Demo interativo por segmento</h2>
            <p className="text-xs text-fg-muted mb-3">
              Clique em um segmento para ver o ERP animado com dados reais do ramo. Mostre ao cliente como o sistema será configurado para o negócio dele.
            </p>
            <div className="flex flex-wrap gap-2">
              {(segments ?? []).map((seg) => (
                <button
                  key={seg.id}
                  onClick={() => setActiveDemo(activeDemo === seg.type ? null : seg.type)}
                  className={cn(
                    'flex items-center gap-2 px-3 h-8 rounded-btn text-sm border transition-all',
                    activeDemo === seg.type
                      ? 'bg-accent-dim border-accent/30 text-accent'
                      : 'bg-surface-2 border-[var(--border)] text-fg-muted hover:border-[var(--border-hover)] hover:text-fg'
                  )}
                >
                  <span>{seg.icon}</span>
                  {seg.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active demo */}
        {activeDemo && (
          <div className="mt-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <AnimatedERPDemo segmentType={activeDemo} active={true} />
          </div>
        )}
      </div>

      {/* Segment cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(segments ?? []).map((tmpl) => (
          <SegmentCard key={tmpl.id} template={tmpl} />
        ))}
      </div>
    </div>
  )
}
