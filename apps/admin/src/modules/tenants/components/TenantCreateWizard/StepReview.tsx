import { Check, Copy, ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { WizardData } from './index'
import { MOCK_PLANS, MOCK_SEGMENT_TEMPLATES } from '@/mock/data'
import { formatCurrency, moduleLabels, segmentLabels } from '@/shared/utils/format'
import { Button } from '@/shared/components/Button'
import { Badge } from '@/shared/components/Badge'

interface Props {
  data: Partial<WizardData>
  onPrev: () => void
  onCreate: () => Promise<void>
  creating: boolean
  done: boolean
  onClose: () => void
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-2 rounded-card p-4">
      <p className="text-xs font-mono uppercase tracking-wide text-fg-dim mb-3">{title}</p>
      {children}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-xs text-fg-muted shrink-0">{label}</span>
      <span className="text-xs text-fg text-right">{value}</span>
    </div>
  )
}

export function StepReview({ data, onPrev, onCreate, creating, done, onClose }: Props) {
  const [copiedLink, setCopiedLink] = useState(false)
  const plan = MOCK_PLANS.find((p) => p.id === data.planId)
  const template = MOCK_SEGMENT_TEMPLATES.find((t) => t.type === data.segment)

  const tenantUrl = `https://${data.slug ?? 'tenant'}.erp.com.br`

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-6 gap-4">
        <div className="h-16 w-16 rounded-full bg-green/10 border border-green/30 flex items-center justify-center">
          <Check className="h-8 w-8 text-green" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-fg">Tenant criado com sucesso!</h3>
          <p className="text-sm text-fg-muted mt-1">
            <strong>{data.name}</strong> está pronto para uso.
          </p>
        </div>

        <div className="w-full bg-surface-2 border border-[var(--border)] rounded-card p-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-fg-muted">URL do tenant</span>
            <Button
              variant="ghost"
              size="sm"
              icon={copiedLink ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={async () => {
                await navigator.clipboard.writeText(tenantUrl)
                setCopiedLink(true)
                setTimeout(() => setCopiedLink(false), 2000)
              }}
            />
          </div>
          <p className="text-sm font-mono text-accent">{tenantUrl}</p>
        </div>

        <div className="w-full bg-surface-2 border border-[var(--border)] rounded-card p-4 text-left">
          <p className="text-xs text-fg-muted mb-2">Credenciais do owner</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-fg-dim">Email:</span>
              <span className="text-xs font-mono text-fg">{data.ownerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-fg-dim">Senha temp.:</span>
              <span className="text-xs font-mono text-fg">{data.tempPassword}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            icon={<ExternalLink className="h-4 w-4" />}
            onClick={() => window.open(tenantUrl, '_blank')}
          >
            Impersonar agora
          </Button>
          <Button variant="primary" className="flex-1" onClick={onClose}>
            Concluir
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-fg mb-0.5">Revisão</h3>
        <p className="text-xs text-fg-muted">
          Confira todos os dados antes de criar o tenant.
        </p>
      </div>

      <ReviewSection title="Dados Básicos">
        <ReviewRow label="Nome" value={data.name} />
        <ReviewRow label="Slug" value={<span className="font-mono">{data.slug}</span>} />
        <ReviewRow label="CNPJ/CPF" value={<span className="font-mono">{data.cnpj}</span>} />
        <ReviewRow label="Telefone" value={data.phone} />
        <ReviewRow label="Email" value={data.email} />
      </ReviewSection>

      <div className="grid grid-cols-2 gap-3">
        <ReviewSection title="Segmento">
          <div className="flex items-center gap-2">
            <span className="text-xl">{template?.icon}</span>
            <span className="text-sm text-fg">{template?.name ?? data.segment}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {template?.defaultModules.map((m) => (
              <span key={m} className="text-2xs font-mono px-1 py-0.5 rounded bg-green/10 text-green">
                {moduleLabels[m]}
              </span>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection title="Plano">
          {plan ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-fg">{plan.name}</span>
                <span className="text-sm font-mono text-accent">{formatCurrency(plan.priceMonthly)}/mês</span>
              </div>
              <div className="mt-2 space-y-0.5 text-xs text-fg-muted">
                <div>{plan.limits.maxUsers === 9999 ? 'Usuários ilimitados' : `${plan.limits.maxUsers} usuários`}</div>
                <div>{plan.limits.maxPDVs} PDVs · {plan.limits.maxBranches} filiais</div>
              </div>
            </>
          ) : (
            <span className="text-xs text-fg-dim">Não selecionado</span>
          )}
        </ReviewSection>
      </div>

      <ReviewSection title="Branding">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded border border-[var(--border)]" style={{ backgroundColor: data.primaryColor }} />
            <span className="text-xs font-mono text-fg">{data.primaryColor}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded border border-[var(--border)]" style={{ backgroundColor: data.accentColor }} />
            <span className="text-xs font-mono text-fg">{data.accentColor}</span>
          </div>
          <Badge variant={data.defaultTheme === 'dark' ? 'neutral' : 'default'}>
            Tema {data.defaultTheme === 'dark' ? 'escuro' : 'claro'}
          </Badge>
        </div>
      </ReviewSection>

      <ReviewSection title="Dono (Owner)">
        <ReviewRow label="Nome" value={data.ownerName} />
        <ReviewRow label="Email" value={<span className="font-mono">{data.ownerEmail}</span>} />
        <ReviewRow label="Telefone" value={data.ownerPhone} />
        <ReviewRow
          label="Enviar credenciais"
          value={data.sendCredentials ? (
            <Badge variant="success">Sim</Badge>
          ) : (
            <Badge variant="neutral">Não</Badge>
          )}
        />
      </ReviewSection>

      <div className="bg-yellow/10 border border-yellow/20 rounded-card p-3">
        <p className="text-xs text-yellow">
          O provisionamento leva entre 5–15 segundos. Após a criação, as credenciais do owner serão exibidas.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onPrev} disabled={creating}>
          Voltar
        </Button>
        <Button
          variant="primary"
          onClick={onCreate}
          loading={creating}
          icon={creating ? undefined : <Check className="h-4 w-4" />}
        >
          {creating ? 'Criando tenant…' : 'Criar tenant'}
        </Button>
      </div>
    </div>
  )
}
