import { useState } from 'react'
import { Plus, Trash2, Lock } from 'lucide-react'
import { MOCK_CUSTOM_FIELDS } from '@/mock/data'
import type { Tenant, CustomField, CustomFieldEntity, CustomFieldType } from '@/shared/types'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'
import { EmptyState } from '@/shared/components/EmptyState'
import { cn } from '@/shared/utils/cn'

interface Props { tenant: Tenant }

const entityLabels: Record<CustomFieldEntity, string> = {
  product: 'Produto',
  contact: 'Cliente/Contato',
  sale: 'Venda',
}

const typeLabels: Record<CustomFieldType, string> = {
  text: 'Texto',
  number: 'Número',
  date: 'Data',
  select: 'Lista (select)',
  boolean: 'Sim/Não',
  textarea: 'Texto longo',
}

export function TabCustomFields({ tenant }: Props) {
  const [activeEntity, setActiveEntity] = useState<CustomFieldEntity>('product')
  const canUseCustomFields = tenant.plan.limits.customFieldsEnabled

  const fields = (MOCK_CUSTOM_FIELDS[tenant.id] ?? []).filter(
    (f) => f.entityType === activeEntity
  )

  if (!canUseCustomFields) {
    return (
      <div className="max-w-2xl">
        <div className="flex flex-col items-center justify-center py-16 text-center bg-surface-1 border border-[var(--border)] rounded-card">
          <div className="h-12 w-12 rounded-full bg-surface-3 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-fg-dim" />
          </div>
          <p className="text-sm font-medium text-fg">Campos custom não disponíveis</p>
          <p className="text-xs text-fg-muted mt-1.5 max-w-xs">
            Campos customizados estão disponíveis nos planos Professional e Enterprise.
          </p>
          <Button variant="primary" size="sm" className="mt-4">
            Upgrade para Professional
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      {/* Entity tabs */}
      <div className="flex gap-1 bg-surface-2 border border-[var(--border)] rounded-card p-1 w-fit">
        {(Object.entries(entityLabels) as Array<[CustomFieldEntity, string]>).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveEntity(key)}
            className={cn(
              'px-3 h-7 rounded text-xs transition-colors',
              activeEntity === key
                ? 'bg-surface-1 text-fg font-medium shadow-sm'
                : 'text-fg-muted hover:text-fg'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Fields list */}
      <div className="bg-surface-1 border border-[var(--border)] rounded-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-xs font-mono uppercase tracking-wide text-fg-dim">
            Campos de {entityLabels[activeEntity]}
          </h2>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
          >
            Novo campo
          </Button>
        </div>

        {fields.length === 0 ? (
          <EmptyState
            icon={<Plus className="h-8 w-8" />}
            title={`Nenhum campo para ${entityLabels[activeEntity]}`}
            description="Crie campos personalizados para capturar informações específicas do seu negócio"
            action={{ label: 'Criar campo', onClick: () => {} }}
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Label', 'Chave', 'Tipo', 'Obrigatório', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-mono uppercase tracking-wide text-fg-dim">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field: CustomField, i) => (
                <tr
                  key={field.id}
                  className={cn(
                    'border-b border-[var(--border)] last:border-0 hover:bg-surface-2 transition-colors group',
                    i % 2 !== 0 && 'bg-surface-2/30'
                  )}
                >
                  <td className="px-4 py-3 text-sm text-fg font-medium">{field.label}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-fg-muted">{field.key}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{typeLabels[field.type]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {field.required ? (
                      <Badge variant="warning">Obrigatório</Badge>
                    ) : (
                      <span className="text-xs text-fg-dim">Opcional</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                      className="opacity-0 group-hover:opacity-100 text-red hover:bg-red/10"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
