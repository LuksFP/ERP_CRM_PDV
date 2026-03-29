import { useState } from 'react'
import { Check, Lock } from 'lucide-react'
import { MOCK_SEGMENT_TEMPLATES } from '@/mock/data'
import type { WizardData } from './index'
import type { SegmentType } from '@/shared/types'
import { moduleLabels } from '@/shared/utils/format'
import { Button } from '@/shared/components/Button'
import { cn } from '@/shared/utils/cn'

interface Props {
  data: Partial<WizardData>
  onUpdate: (d: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

// ─── MINI ERP DEMO ───────────────────────────────────────────────
function ERPDemo({ segment }: { segment: SegmentType }) {
  const demos: Record<SegmentType, { title: string; rows: string[][] }> = {
    pharmacy: {
      title: 'Preview — Estoque de Farmácia',
      rows: [
        ['Dipirona 500mg', 'Lote A123', '15/08/2025', '150 un.'],
        ['Amoxicilina 500mg', 'Lote B456', '03/12/2024', '80 un.'],
        ['Paracetamol 750mg', 'Lote C789', '22/06/2026', '210 un.'],
      ],
    },
    supermarket: {
      title: 'Preview — Caixa de Supermercado',
      rows: [
        ['Arroz 5kg Tio João', '1 un.', 'R$ 28,90'],
        ['Leite Integral Itambé', '3 un.', 'R$ 23,70'],
        ['Pão de Forma Wickbold', '2 un.', 'R$ 17,60'],
      ],
    },
    bakery: {
      title: 'Preview — Produção Diária',
      rows: [
        ['Pão Francês', '200 kg', '45min', '✓ Próprio'],
        ['Croissant', '50 un.', '30min', '✓ Próprio'],
        ['Bolo de Cenoura', '12 un.', '60min', '✓ Próprio'],
      ],
    },
    butcher: {
      title: 'Preview — Cortes / Rastreio',
      rows: [
        ['Picanha Bovina', 'SIF 1234', 'R$ 89,90/kg', '15kg'],
        ['Costela Suína', 'SIF 5678', 'R$ 34,90/kg', '22kg'],
        ['Frango Inteiro', 'SIF 9012', 'R$ 16,90/kg', '40kg'],
      ],
    },
    restaurant: {
      title: 'Preview — Mesas / Comandas',
      rows: [
        ['Mesa 01', 'Filé Mignon', '2x R$ 62,00', 'Aberta'],
        ['Mesa 03', 'Frango Grelhado', '1x R$ 38,00', 'Aberta'],
        ['Mesa 07', 'Prato Executivo', '4x R$ 35,00', 'Paga'],
      ],
    },
    clothing: {
      title: 'Preview — Grade de Produtos',
      rows: [
        ['Blusa Básica Branca', 'P/M/G/GG', 'Coleção Verão', '45 un.'],
        ['Calça Jeans Slim', '36/38/40/42', 'Coleção 24/25', '22 un.'],
        ['Vestido Floral', 'P/M/G', 'Coleção Primavera', '18 un.'],
      ],
    },
    electronics: {
      title: 'Preview — Produtos / Série',
      rows: [
        ['iPhone 15 Pro 256GB', 'S/N: X9A2B3', '24 meses', 'Em estoque'],
        ['Samsung A55 128GB', 'S/N: K7L8M9', '12 meses', 'Em estoque'],
        ['AirPods Pro 2', 'S/N: P4Q5R6', '12 meses', '2 un.'],
      ],
    },
    other: {
      title: 'Preview — Produtos Gerais',
      rows: [
        ['Produto A', 'COD-001', 'R$ 45,00', '100 un.'],
        ['Produto B', 'COD-002', 'R$ 89,90', '55 un.'],
        ['Produto C', 'COD-003', 'R$ 12,50', '200 un.'],
      ],
    },
  }

  const demo = demos[segment]

  return (
    <div
      className="mt-4 rounded-card border border-[var(--border)] overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
      style={{ fontSize: '11px' }}
    >
      <div className="px-3 py-2 bg-surface-3 border-b border-[var(--border)] flex items-center gap-2">
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-red/60" />
          <div className="h-2 w-2 rounded-full bg-yellow/60" />
          <div className="h-2 w-2 rounded-full bg-green/60" />
        </div>
        <span className="font-mono text-fg-dim">{demo.title}</span>
      </div>
      <table className="w-full">
        <tbody>
          {demo.rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                'border-b border-[var(--border)] last:border-b-0',
                i % 2 === 0 ? 'bg-surface-1' : 'bg-surface-2/40'
              )}
            >
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-1.5 text-fg-muted font-mono">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StepSegment({ data, onUpdate, onNext, onPrev }: Props) {
  const [selected, setSelected] = useState<SegmentType | null>(
    (data.segment as SegmentType) ?? null
  )

  const handleSelect = (type: SegmentType) => {
    setSelected(type)
    onUpdate({ segment: type })
  }

  const selectedTemplate = MOCK_SEGMENT_TEMPLATES.find((t) => t.type === selected)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-fg mb-0.5">Segmento</h3>
        <p className="text-xs text-fg-muted">
          Escolha o tipo de negócio. O ERP será pré-configurado com módulos e campos específicos.
        </p>
      </div>

      {/* Segment grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MOCK_SEGMENT_TEMPLATES.map((tmpl) => {
          const isSelected = selected === tmpl.type
          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleSelect(tmpl.type)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-3 rounded-card border text-center',
                'transition-all duration-150 outline-none',
                'focus-visible:ring-2 focus-visible:ring-accent',
                isSelected
                  ? 'border-accent bg-accent-dim'
                  : 'border-[var(--border)] bg-surface-2 hover:border-[var(--border-hover)] hover:bg-surface-3'
              )}
            >
              <div
                className={cn(
                  'text-2xl',
                  isSelected ? 'scale-110 transition-transform' : ''
                )}
              >
                {tmpl.icon}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isSelected ? 'text-accent' : 'text-fg-muted'
                )}
              >
                {tmpl.name}
              </span>
              {isSelected && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-accent flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-[#0C0A09]" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected segment details */}
      {selectedTemplate && (
        <div className="animate-in fade-in-0 duration-200">
          <div className="bg-surface-2 border border-[var(--border)] rounded-card p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">{selectedTemplate.icon}</span>
              <div>
                <p className="text-sm font-semibold text-fg">{selectedTemplate.name}</p>
                <p className="text-xs text-fg-muted mt-0.5">{selectedTemplate.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Modules */}
              <div>
                <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-2">
                  Módulos pré-ativados
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.defaultModules.map((mod) => (
                    <span
                      key={mod}
                      className="text-2xs font-mono px-1.5 py-0.5 rounded bg-green/10 text-green border border-green/20"
                    >
                      {moduleLabels[mod]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom fields */}
              <div>
                <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-2">
                  Campos custom pré-criados
                </p>
                <div className="flex flex-col gap-1">
                  {selectedTemplate.customFieldsPreset.slice(0, 3).map((f) => (
                    <div key={f.key} className="flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-accent shrink-0" />
                      <span className="text-xs text-fg-muted">{f.label}</span>
                      <span className="text-2xs text-fg-dim font-mono">({f.type})</span>
                      {f.required && (
                        <span className="text-2xs text-red">*obrig.</span>
                      )}
                    </div>
                  ))}
                  {selectedTemplate.customFieldsPreset.length > 3 && (
                    <span className="text-xs text-fg-dim ml-3">
                      +{selectedTemplate.customFieldsPreset.length - 3} mais
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Locked modules */}
            <div className="mt-3 flex items-center gap-2">
              <Lock className="h-3 w-3 text-fg-dim shrink-0" />
              <p className="text-xs text-fg-dim">
                Módulos adicionais (Fiscal, CRM, Financeiro) disponíveis nos planos Professional+
              </p>
            </div>
          </div>

          {/* Live ERP demo */}
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mt-3 mb-1">
              Demo — Como ficará o ERP
            </p>
            <ERPDemo segment={selectedTemplate.type} />
          </div>
        </div>
      )}

      {!selectedTemplate && (
        <p className="text-xs text-fg-dim text-center py-4">
          Selecione um segmento acima para ver a preview do ERP
        </p>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onPrev}>
          Voltar
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!selected}
        >
          Próximo
        </Button>
      </div>
    </div>
  )
}
