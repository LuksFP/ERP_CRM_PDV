import { Input, Textarea, Select } from './Input'
import type { CustomFieldDefinition } from '@/shared/types'

interface DynamicFieldRendererProps {
  fields: CustomFieldDefinition[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  errors?: Record<string, string>
}

export function DynamicFieldRenderer({
  fields,
  values,
  onChange,
  errors,
}: DynamicFieldRendererProps) {
  if (fields.length === 0) return null

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle">Campos personalizados</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => {
          const value = values[field.key]
          const error = errors?.[field.key]

          switch (field.type) {
            case 'text':
              return (
                <Input
                  key={field.key}
                  label={field.label + (field.required ? ' *' : '')}
                  value={(value as string) ?? ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  error={error}
                />
              )

            case 'number':
              return (
                <Input
                  key={field.key}
                  type="number"
                  label={field.label + (field.required ? ' *' : '')}
                  value={(value as string) ?? ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  error={error}
                />
              )

            case 'date':
              return (
                <Input
                  key={field.key}
                  type="date"
                  label={field.label + (field.required ? ' *' : '')}
                  value={(value as string) ?? ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  error={error}
                />
              )

            case 'textarea':
              return (
                <div key={field.key} className="sm:col-span-2">
                  <Textarea
                    label={field.label + (field.required ? ' *' : '')}
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    error={error}
                  />
                </div>
              )

            case 'select':
              return (
                <Select
                  key={field.key}
                  label={field.label + (field.required ? ' *' : '')}
                  value={(value as string) ?? ''}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  error={error}
                  options={[
                    { value: '', label: 'Selecione...' },
                    ...(field.options ?? []).map((o) => ({ value: o, label: o })),
                  ]}
                />
              )

            case 'boolean':
              return (
                <label key={field.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(value as boolean) ?? false}
                    onChange={(e) => onChange(field.key, e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--accent)]"
                  />
                  <span className="text-sm text-ink">{field.label}</span>
                </label>
              )

            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
