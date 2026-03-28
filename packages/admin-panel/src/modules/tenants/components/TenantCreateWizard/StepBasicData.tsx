import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import type { WizardData } from './index'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { generateSlug } from '@/shared/utils/format'
import { cn } from '@/shared/utils/cn'

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  slug: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens')
    .refine((s) => !s.startsWith('-') && !s.endsWith('-'), 'Não pode começar ou terminar com hífen'),
  cnpj: z.string().min(14, 'CNPJ/CPF inválido').max(18),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

interface Props {
  data: Partial<WizardData>
  onUpdate: (d: Partial<WizardData>) => void
  onNext: () => void
}

// Simulate slug uniqueness check
const TAKEN_SLUGS = ['farmacia-central', 'mercado-bom-preco', 'padaria-ouro']

export function StepBasicData({ data, onUpdate, onNext }: Props) {
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: data.name ?? '',
      slug: data.slug ?? '',
      cnpj: data.cnpj ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
    },
  })

  const nameValue = watch('name')
  const slugValue = watch('slug')

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue && !data.slug) {
      const autoSlug = generateSlug(nameValue)
      setValue('slug', autoSlug)
    }
  }, [nameValue, data.slug, setValue])

  // Debounced slug check
  useEffect(() => {
    if (!slugValue || slugValue.length < 3) {
      setSlugStatus('idle')
      return
    }
    setSlugStatus('checking')
    const timer = setTimeout(() => {
      setSlugStatus(TAKEN_SLUGS.includes(slugValue) ? 'taken' : 'available')
    }, 500)
    return () => clearTimeout(timer)
  }, [slugValue])

  const onSubmit = (formData: FormData) => {
    if (slugStatus === 'taken') return
    onUpdate(formData)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div>
        <h3 className="text-sm font-semibold text-fg mb-0.5">Dados Básicos</h3>
        <p className="text-xs text-fg-muted">Informações principais do estabelecimento</p>
      </div>

      <Input
        label="Nome do estabelecimento"
        placeholder="Ex: Farmácia Central Saúde"
        error={errors.name?.message}
        required
        {...register('name')}
      />

      {/* Slug with uniqueness status */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">
          Slug <span className="text-red">*</span>
        </label>
        <div className="relative flex items-center">
          <input
            className={cn(
              'h-9 w-full rounded-input bg-surface-2 border text-sm text-fg placeholder:text-fg-dim px-3 pr-8 outline-none transition-colors',
              'hover:border-[var(--border-hover)] focus:border-accent focus:ring-1 focus:ring-accent',
              errors.slug ? 'border-red/50' : 'border-[var(--border)]',
              slugStatus === 'taken' && 'border-red/50'
            )}
            placeholder="farmacia-central-saude"
            {...register('slug')}
          />
          <div className="absolute right-2.5 pointer-events-none">
            {slugStatus === 'checking' && <Loader2 className="h-3.5 w-3.5 text-fg-dim animate-spin" />}
            {slugStatus === 'available' && <Check className="h-3.5 w-3.5 text-green" />}
            {slugStatus === 'taken' && <AlertCircle className="h-3.5 w-3.5 text-red" />}
          </div>
        </div>
        {errors.slug && <p className="text-xs text-red">{errors.slug.message}</p>}
        {slugStatus === 'taken' && !errors.slug && (
          <p className="text-xs text-red">Este slug já está em uso</p>
        )}
        {slugStatus === 'available' && !errors.slug && (
          <p className="text-xs text-green">Slug disponível ✓</p>
        )}
        <p className="text-xs text-fg-dim">
          Será usado na URL: <code className="font-mono">{'{slug}'}.seudominio.com.br</code>
        </p>
      </div>

      <Input
        label="CNPJ ou CPF"
        placeholder="00.000.000/0001-00"
        error={errors.cnpj?.message}
        required
        {...register('cnpj')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Telefone"
          placeholder="(11) 99999-9999"
          type="tel"
          error={errors.phone?.message}
          required
          {...register('phone')}
        />
        <Input
          label="Email de contato"
          placeholder="contato@empresa.com"
          type="email"
          error={errors.email?.message}
          required
          {...register('email')}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary">
          Próximo
        </Button>
      </div>
    </form>
  )
}
