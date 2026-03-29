import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoginError(null)
    try {
      await login(data.email, data.password)
      await navigate({ to: '/dashboard' })
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Erro ao fazer login')
    }
  }

  return (
    <div className="w-full max-w-sm px-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-accent mb-4 shadow-lg">
          <Zap className="h-7 w-7 text-[#0C0A09]" />
        </div>
        <h1 className="text-xl font-semibold text-fg text-center">Admin Panel</h1>
        <p className="mt-1 text-sm text-fg-muted text-center">
          Painel de controle da plataforma ERP
        </p>
      </div>

      {/* Card */}
      <div className="bg-surface-1 border border-[var(--border)] rounded-card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {/* Error */}
          {loginError && (
            <div className="flex items-center gap-2 p-3 rounded-input bg-red/10 border border-red/20">
              <AlertCircle className="h-4 w-4 text-red shrink-0" />
              <p className="text-sm text-red">{loginError}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="admin@erp.com"
            autoComplete="email"
            icon={<Mail className="h-3.5 w-3.5" />}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Senha <span className="text-red">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-3.5 w-3.5 text-fg-dim pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-9 w-full rounded-input bg-surface-2 border border-[var(--border)] text-sm text-fg placeholder:text-fg-dim pl-9 pr-9 outline-none transition-colors hover:border-[var(--border-hover)] focus:border-accent focus:ring-1 focus:ring-accent"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-fg-dim hover:text-fg transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            className="w-full mt-1"
          >
            Entrar
          </Button>
        </form>
      </div>

      {/* Demo hint */}
      <div className="mt-4 p-3 bg-surface-2 border border-[var(--border)] rounded-card">
        <p className="text-xs font-medium text-fg-muted mb-2">Credenciais de demo</p>
        <div className="space-y-1">
          {[
            { email: 'admin@erp.com', pass: 'admin123', role: 'Super Admin' },
            { email: 'suporte@erp.com', pass: 'suporte123', role: 'Suporte' },
          ].map(({ email, pass, role }) => (
            <div key={email} className="flex items-center justify-between">
              <span className="text-2xs font-mono text-fg-dim">{email}</span>
              <div className="flex items-center gap-2">
                <span className="text-2xs text-fg-dim">{pass}</span>
                <span className="text-2xs text-accent">— {role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
