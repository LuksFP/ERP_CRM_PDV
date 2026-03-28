import { useState } from 'react'
import { Check, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/auth/store'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { segmentLabels } from '@/shared/utils/formatters'

type Step = 'welcome' | 'branding' | 'branch' | 'team' | 'complete'

const STEPS: { id: Step; label: string }[] = [
  { id: 'welcome',  label: 'Boas-vindas' },
  { id: 'branding', label: 'Identidade' },
  { id: 'branch',   label: 'Filial' },
  { id: 'team',     label: 'Equipe' },
  { id: 'complete', label: 'Concluído' },
]

const PRESET_COLORS = [
  '#2563EB', '#7C3AED', '#059669', '#D97706',
  '#DC2626', '#0891B2', '#C026D3', '#1D4ED8',
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { tenantConfig, completeOnboarding, updateConfig } = useAuthStore()
  const [step, setStep] = useState<Step>('welcome')
  const [primaryColor, setPrimaryColor] = useState(tenantConfig?.branding.primaryColor ?? '#2563EB')
  const [branchName, setBranchName] = useState('')
  const [branchPhone, setBranchPhone] = useState('')
  const [completing, setCompleting] = useState(false)

  const currentIndex = STEPS.findIndex((s) => s.id === step)

  const goNext = () => {
    const next = STEPS[currentIndex + 1]
    if (next) setStep(next.id)
  }

  const handleComplete = async () => {
    setCompleting(true)
    // Apply branding updates
    if (tenantConfig) {
      updateConfig({
        branding: { ...tenantConfig.branding, primaryColor },
      })
    }
    await new Promise((r) => setTimeout(r, 1500))
    completeOnboarding()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-up">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const done = i < currentIndex
            const active = s.id === step
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                    done
                      ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                      : active
                      ? 'bg-[var(--accent-dim)] border-2 border-[var(--accent)] text-[var(--accent)]'
                      : 'bg-surface-2 text-ink-subtle'
                  )}
                >
                  {done ? <Check size={14} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 w-8 rounded transition-all duration-500',
                      done ? 'bg-[var(--accent)]' : 'bg-surface-3'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-surface-0 border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Welcome */}
          {step === 'welcome' && tenantConfig && (
            <div className="p-8 text-center space-y-4 animate-fade-up">
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg"
                style={{ background: 'var(--accent)', color: 'var(--accent-contrast)' }}
              >
                {tenantConfig.branding.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink">
                  Bem-vindo à {tenantConfig.branding.name}!
                </h1>
                <p className="mt-2 text-sm text-ink-muted">
                  Vamos configurar seu ERP em poucos minutos. Segmento detectado:{' '}
                  <strong>{segmentLabels[tenantConfig.segment]}</strong>.
                </p>
              </div>
              {/* Animated ERP preview */}
              <SegmentPreview segment={tenantConfig.segment} />
              <Button onClick={goNext} className="w-full mt-2">
                Começar configuração →
              </Button>
            </div>
          )}

          {/* Branding */}
          {step === 'branding' && tenantConfig && (
            <div className="p-8 space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-ink">Identidade Visual</h2>
                <p className="text-sm text-ink-muted mt-1">
                  Escolha a cor principal da sua empresa.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-mono uppercase tracking-widest text-ink-subtle">Cor principal</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      className={cn(
                        'w-9 h-9 rounded-lg transition-all duration-150',
                        primaryColor === c && 'ring-2 ring-offset-2 ring-current scale-110'
                      )}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-9 rounded border border-border cursor-pointer p-1 bg-surface-1"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono text-sm w-32"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Live preview */}
              <div
                className="rounded-lg p-4 text-sm font-medium transition-all duration-300"
                style={{
                  background: primaryColor,
                  color: 'white',
                  boxShadow: `0 4px 20px ${primaryColor}40`,
                }}
              >
                <Zap size={16} className="inline mr-1.5" />
                Preview — {tenantConfig.branding.name}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep('welcome')}>Voltar</Button>
                <Button onClick={goNext} className="flex-1">Próximo →</Button>
              </div>
            </div>
          )}

          {/* Branch */}
          {step === 'branch' && (
            <div className="p-8 space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-ink">Primeira Filial</h2>
                <p className="text-sm text-ink-muted mt-1">
                  Configure informações da sua unidade principal.
                </p>
              </div>
              <div className="space-y-4">
                <Input
                  label="Nome da filial"
                  placeholder="Ex: Matriz Centro"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                />
                <Input
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep('branding')}>Voltar</Button>
                <Button onClick={goNext} className="flex-1">Próximo →</Button>
              </div>
            </div>
          )}

          {/* Team */}
          {step === 'team' && (
            <div className="p-8 space-y-6 animate-fade-up">
              <div>
                <h2 className="text-lg font-bold text-ink">Convide sua Equipe</h2>
                <p className="text-sm text-ink-muted mt-1">
                  Você pode convidar colaboradores agora ou depois nas configurações.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['manager', 'cashier', 'seller', 'stock_clerk'] as const).map((role) => {
                  const icons: Record<string, string> = {
                    manager: '👔', cashier: '🖥️', seller: '💼', stock_clerk: '📦',
                  }
                  const labels: Record<string, string> = {
                    manager: 'Gerente', cashier: 'Operador de Caixa',
                    seller: 'Vendedor', stock_clerk: 'Estoquista',
                  }
                  return (
                    <div key={role} className="flex items-center gap-2 p-3 rounded-lg bg-surface-1 border border-border">
                      <span className="text-lg">{icons[role]}</span>
                      <p className="text-xs font-medium text-ink">{labels[role]}</p>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-ink-subtle text-center">
                Convites serão enviados após concluir a configuração.
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setStep('branch')}>Voltar</Button>
                <Button onClick={goNext} className="flex-1">Próximo →</Button>
              </div>
            </div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <div className="p-8 text-center space-y-5 animate-bounce-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse-ring">
                <Check size={28} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink">Tudo pronto!</h2>
                <p className="text-sm text-ink-muted mt-1">
                  Seu ERP está configurado e pronto para uso.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-left">
                {[
                  ['✓', 'Identidade visual'],
                  ['✓', 'Filial configurada'],
                  ['✓', 'Módulos ativados'],
                  ['✓', 'Dados de acesso'],
                ].map(([icon, label]) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-ink-muted">
                    <span className="text-emerald-500 font-bold">{icon}</span>
                    {label}
                  </div>
                ))}
              </div>
              <Button onClick={handleComplete} loading={completing} className="w-full" size="lg">
                {completing ? 'Configurando...' : 'Acessar o ERP →'}
              </Button>
            </div>
          )}
        </div>

        {/* Step label */}
        <p className="text-center text-xs text-ink-subtle mt-4 font-mono">
          Passo {currentIndex + 1} de {STEPS.length} — {STEPS[currentIndex]?.label}
        </p>
      </div>
    </div>
  )
}

// ── Segment animated preview ─────────────────────────────────────────────────
import { useEffect, useState as useStateLocal } from 'react'
import type { SegmentType } from '@/shared/types'

const SEGMENT_DEMOS: Record<SegmentType, { headers: string[]; rows: string[][] }> = {
  pharmacy: {
    headers: ['Produto', 'Lote', 'Validade', 'Estoque'],
    rows: [
      ['Dipirona 500mg', 'L2024A', '12/2025', '240 cx'],
      ['Amoxilina 250mg', 'L2024B', '06/2025', '80 cx'],
      ['Omeprazol 20mg', 'L2024C', '09/2026', '156 cx'],
      ['Ibuprofeno 600mg', 'L2024D', '03/2026', '90 cx'],
    ],
  },
  supermarket: {
    headers: ['Produto', 'Categoria', 'Preço', 'Estoque'],
    rows: [
      ['Arroz 5kg', 'Grãos', 'R$ 28,90', '340 un'],
      ['Feijão 1kg', 'Grãos', 'R$ 7,90', '210 un'],
      ['Leite 1L', 'Laticínios', 'R$ 5,49', '180 un'],
      ['Pão Fatiado', 'Padaria', 'R$ 8,99', '60 un'],
    ],
  },
  bakery: {
    headers: ['Item', 'Tipo', 'Preço', 'Produzido'],
    rows: [
      ['Pão Francês', 'Pão', 'R$ 0,80', '400 un'],
      ['Croissant', 'Folhado', 'R$ 4,50', '60 un'],
      ['Bolo de Cenoura', 'Bolo', 'R$ 35,00', '8 un'],
      ['Brigadeiro', 'Doce', 'R$ 2,50', '120 un'],
    ],
  },
  butcher: {
    headers: ['Corte', 'Tipo', 'Preço/kg', 'Disponível'],
    rows: [
      ['Picanha', 'Bovino', 'R$ 89,90', '12 kg'],
      ['Frango inteiro', 'Frango', 'R$ 14,90', '25 kg'],
      ['Costela Bovina', 'Bovino', 'R$ 38,00', '8 kg'],
      ['Linguiça Toscana', 'Suíno', 'R$ 22,00', '15 kg'],
    ],
  },
  restaurant: {
    headers: ['Prato', 'Categoria', 'Preço', 'Disponível'],
    rows: [
      ['Filé ao molho', 'Pratos', 'R$ 45,00', 'Sim'],
      ['Risoto de cogumelo', 'Vegetariano', 'R$ 38,00', 'Sim'],
      ['Salmão grelhado', 'Peixes', 'R$ 52,00', 'Sim'],
      ['Sorvete artesanal', 'Sobremesa', 'R$ 18,00', 'Sim'],
    ],
  },
  clothing: {
    headers: ['Produto', 'Tamanhos', 'Preço', 'Estoque'],
    rows: [
      ['Camiseta Branca', 'P M G GG', 'R$ 49,90', '320 un'],
      ['Calça Jeans', '36 38 40 42', 'R$ 129,90', '84 un'],
      ['Vestido Floral', 'P M G', 'R$ 89,90', '45 un'],
      ['Tênis Casual', '36-43', 'R$ 189,90', '60 un'],
    ],
  },
  electronics: {
    headers: ['Produto', 'S/N', 'Garantia', 'Preço'],
    rows: [
      ['Notebook i5', 'SN-001', '12 meses', 'R$ 2.899'],
      ['Fone Bluetooth', 'SN-002', '6 meses', 'R$ 189'],
      ['Carregador USB-C', 'SN-003', '3 meses', 'R$ 79'],
      ['Mouse Sem Fio', 'SN-004', '12 meses', 'R$ 129'],
    ],
  },
  other: {
    headers: ['Produto', 'Categoria', 'Preço', 'Estoque'],
    rows: [
      ['Produto A', 'Cat. 1', 'R$ 99,90', '200 un'],
      ['Produto B', 'Cat. 2', 'R$ 149,90', '80 un'],
      ['Produto C', 'Cat. 1', 'R$ 39,90', '350 un'],
      ['Produto D', 'Cat. 3', 'R$ 249,90', '25 un'],
    ],
  },
}

function SegmentPreview({ segment }: { segment: SegmentType }) {
  const demo = SEGMENT_DEMOS[segment] ?? SEGMENT_DEMOS.other
  const [activeRow, setActiveRow] = useStateLocal(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveRow((r) => (r + 1) % demo.rows.length)
    }, 1200)
    return () => clearInterval(id)
  }, [demo.rows.length])

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-surface-1 text-left">
      <div className="grid text-[10px] font-mono uppercase tracking-wider text-ink-subtle border-b border-border"
           style={{ gridTemplateColumns: `repeat(${demo.headers.length}, 1fr)` }}>
        {demo.headers.map((h) => (
          <div key={h} className="px-3 py-2">{h}</div>
        ))}
      </div>
      {demo.rows.map((row, ri) => (
        <div
          key={ri}
          className={cn(
            'grid text-xs transition-colors duration-300',
            activeRow === ri
              ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
              : ri % 2 === 0 ? 'bg-transparent' : 'bg-surface-0/50'
          )}
          style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}
        >
          {row.map((cell, ci) => (
            <div key={ci} className="px-3 py-2 truncate">{cell}</div>
          ))}
        </div>
      ))}
    </div>
  )
}
