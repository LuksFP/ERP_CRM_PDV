import { useState } from 'react'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { useAuthStore } from '../store'
import { MOCK_CREDENTIALS } from '@/mock/configs'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'

export default function LoginPage() {
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  const fillDemo = (cred: typeof MOCK_CREDENTIALS[number]) => {
    setEmail(cred.email)
    setPassword(cred.password)
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
      />

      <div className="w-full max-w-sm animate-fade-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--accent,#2563EB)] mb-4 shadow-lg">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">ERP Plataforma</h1>
          <p className="mt-1 text-sm text-ink-muted">Acesse sua conta</p>
        </div>

        {/* Form */}
        <div className="bg-surface-0 border border-border rounded-xl p-6 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Senha"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              iconRight={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-ink-subtle hover:text-ink"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {error && (
              <div className="text-xs text-red-500 bg-red-500/8 border border-red-500/20 rounded px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" loading={isLoading} className="w-full" size="md">
              Entrar
            </Button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-5 bg-surface-0 border border-border rounded-xl p-4 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-ink-subtle">
            Contas demo disponíveis
          </p>
          <div className="space-y-1.5">
            {MOCK_CREDENTIALS.map((cred) => (
              <button
                key={cred.email}
                type="button"
                onClick={() => fillDemo(cred)}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-2 transition-colors text-left group"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: cred.config.branding.primaryColor }}
                >
                  {cred.config.branding.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-ink">{cred.email}</p>
                  <p className="text-[10px] text-ink-subtle">{cred.label}</p>
                </div>
                <span className="text-[10px] text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity">
                  usar →
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-ink-subtle">Senha de todas as contas: <span className="font-mono">demo123</span></p>
        </div>
      </div>
    </div>
  )
}
