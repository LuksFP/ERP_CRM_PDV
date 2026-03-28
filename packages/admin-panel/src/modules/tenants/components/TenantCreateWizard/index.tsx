import { useState } from 'react'
import { X, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/Button'
import { StepBasicData } from './StepBasicData'
import { StepSegment } from './StepSegment'
import { StepPlan } from './StepPlan'
import { StepBranding } from './StepBranding'
import { StepOwner } from './StepOwner'
import { StepReview } from './StepReview'

export interface WizardData {
  // Step 1
  name: string
  slug: string
  cnpj: string
  phone: string
  email: string
  // Step 2
  segment: string
  // Step 3
  planId: string
  // Step 4
  primaryColor: string
  accentColor: string
  defaultTheme: 'dark' | 'light'
  // Step 5
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  tempPassword: string
  sendCredentials: boolean
}

const STEPS = [
  { id: 1, label: 'Dados Básicos' },
  { id: 2, label: 'Segmento' },
  { id: 3, label: 'Plano' },
  { id: 4, label: 'Branding' },
  { id: 5, label: 'Dono' },
  { id: 6, label: 'Revisão' },
]

interface TenantCreateWizardProps {
  open: boolean
  onClose: () => void
}

export function TenantCreateWizard({ open, onClose }: TenantCreateWizardProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<Partial<WizardData>>({
    primaryColor: '#E2A336',
    accentColor: '#5CB870',
    defaultTheme: 'dark',
    tempPassword: generatePassword(),
    sendCredentials: true,
  })
  const [creating, setCreating] = useState(false)
  const [done, setDone] = useState(false)

  if (!open) return null

  const updateData = (partial: Partial<WizardData>) => {
    setData((d) => ({ ...d, ...partial }))
  }

  const next = () => setStep((s) => Math.min(s + 1, 6))
  const prev = () => setStep((s) => Math.max(s - 1, 1))

  const handleCreate = async () => {
    setCreating(true)
    await new Promise((r) => setTimeout(r, 2000))
    setCreating(false)
    setDone(true)
  }

  const handleClose = () => {
    setStep(1)
    setData({
      primaryColor: '#E2A336',
      accentColor: '#5CB870',
      defaultTheme: 'dark',
      tempPassword: generatePassword(),
      sendCredentials: true,
    })
    setDone(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl bg-surface-1 border border-[var(--border)] rounded-card shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
          <div>
            <h2 className="text-base font-semibold text-fg">Criar novo tenant</h2>
            <p className="text-xs text-fg-muted mt-0.5">
              Passo {step} de {STEPS.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="h-4 w-4" />}
            onClick={handleClose}
          />
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1 min-w-0">
                <div
                  className={cn(
                    'flex items-center justify-center h-5 w-5 rounded-full text-2xs font-mono shrink-0 transition-colors',
                    step > s.id
                      ? 'bg-green text-[#0C0A09]'
                      : step === s.id
                      ? 'bg-accent text-[#0C0A09]'
                      : 'bg-surface-3 text-fg-dim'
                  )}
                >
                  {step > s.id ? <Check className="h-3 w-3" /> : s.id}
                </div>
                <span
                  className={cn(
                    'text-2xs hidden sm:block truncate',
                    step === s.id ? 'text-fg font-medium' : 'text-fg-dim'
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-fg-dim shrink-0 mx-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && (
            <StepBasicData data={data} onUpdate={updateData} onNext={next} />
          )}
          {step === 2 && (
            <StepSegment data={data} onUpdate={updateData} onNext={next} onPrev={prev} />
          )}
          {step === 3 && (
            <StepPlan data={data} onUpdate={updateData} onNext={next} onPrev={prev} />
          )}
          {step === 4 && (
            <StepBranding data={data} onUpdate={updateData} onNext={next} onPrev={prev} />
          )}
          {step === 5 && (
            <StepOwner data={data} onUpdate={updateData} onNext={next} onPrev={prev} />
          )}
          {step === 6 && (
            <StepReview
              data={data}
              onPrev={prev}
              onCreate={handleCreate}
              creating={creating}
              done={done}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!'
  let p = ''
  for (let i = 0; i < 12; i++) {
    p += chars[Math.floor(Math.random() * chars.length)]
  }
  return p
}
