import { useState } from 'react'
import { Copy, Check, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { WizardData } from './index'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { generateTempPassword } from '@/shared/utils/format'
import { cn } from '@/shared/utils/cn'

const schema = z.object({
  ownerName: z.string().min(3, 'Nome completo obrigatório'),
  ownerEmail: z.string().email('Email inválido'),
  ownerPhone: z.string().min(10, 'Telefone inválido'),
})

type FormData = z.infer<typeof schema>

interface Props {
  data: Partial<WizardData>
  onUpdate: (d: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

export function StepOwner({ data, onUpdate, onNext, onPrev }: Props) {
  const [copied, setCopied] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [tempPassword, setTempPassword] = useState(data.tempPassword ?? generateTempPassword())
  const [sendCredentials, setSendCredentials] = useState(data.sendCredentials ?? true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerName: data.ownerName ?? '',
      ownerEmail: data.ownerEmail ?? '',
      ownerPhone: data.ownerPhone ?? '',
    },
  })

  const copyPassword = async () => {
    await navigator.clipboard.writeText(tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const regeneratePassword = () => {
    const p = generateTempPassword()
    setTempPassword(p)
    onUpdate({ tempPassword: p })
  }

  const onSubmit = (formData: FormData) => {
    onUpdate({ ...formData, tempPassword, sendCredentials })
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div>
        <h3 className="text-sm font-semibold text-fg mb-0.5">Dono do Tenant</h3>
        <p className="text-xs text-fg-muted">
          Será criado com o role <code className="font-mono text-accent">owner</code> — acesso total ao ERP do cliente.
        </p>
      </div>

      <div className="bg-accent-dim border border-accent/20 rounded-card p-3">
        <p className="text-xs text-accent">
          <strong>Atenção:</strong> Apenas 1 owner por tenant. Ele poderá criar gerentes, operadores e demais usuários.
        </p>
      </div>

      <Input
        label="Nome completo"
        placeholder="João da Silva"
        error={errors.ownerName?.message}
        required
        {...register('ownerName')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Email (login)"
          placeholder="joao@empresa.com"
          type="email"
          error={errors.ownerEmail?.message}
          required
          {...register('ownerEmail')}
        />
        <Input
          label="Telefone"
          placeholder="(11) 99999-9999"
          type="tel"
          error={errors.ownerPhone?.message}
          required
          {...register('ownerPhone')}
        />
      </div>

      {/* Temp password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">
          Senha Temporária
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={showPass ? 'text' : 'password'}
              value={tempPassword}
              readOnly
              className="h-9 w-full rounded-input bg-surface-3 border border-[var(--border)] px-3 pr-8 text-sm font-mono text-fg outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-dim hover:text-fg transition-colors"
            >
              {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={copied ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />}
            onClick={copyPassword}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={regeneratePassword}
          />
        </div>
        <p className="text-xs text-fg-dim">
          Exibida apenas uma vez. O owner deve trocar na primeira entrada.
        </p>
      </div>

      {/* Send credentials */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={sendCredentials}
            onChange={(e) => {
              setSendCredentials(e.target.checked)
              onUpdate({ sendCredentials: e.target.checked })
            }}
            className="sr-only peer"
          />
          <div
            className={cn(
              'h-4 w-4 rounded border flex items-center justify-center transition-colors',
              sendCredentials
                ? 'bg-accent border-accent'
                : 'bg-surface-2 border-[var(--border)]'
            )}
          >
            {sendCredentials && <Check className="h-3 w-3 text-[#0C0A09]" />}
          </div>
        </div>
        <span className="text-sm text-fg-muted">
          Enviar credenciais por email ao owner
        </span>
      </label>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onPrev}>
          Voltar
        </Button>
        <Button type="submit" variant="primary">
          Revisar
        </Button>
      </div>
    </form>
  )
}
