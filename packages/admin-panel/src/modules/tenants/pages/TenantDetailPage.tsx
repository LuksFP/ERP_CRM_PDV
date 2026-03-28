import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  LayoutDashboard,
  CreditCard,
  Puzzle,
  Palette,
  Settings2,
  Users,
  GitBranch,
  ScrollText,
} from 'lucide-react'
import { MOCK_TENANTS } from '@/mock/data'
import { Tabs } from '@/shared/components/Tabs'
import { Spinner } from '@/shared/components/Spinner'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { statusLabels, segmentLabels } from '@/shared/utils/format'
import type { TenantStatus } from '@/shared/types'
import { TabOverview } from '../components/TenantDetail/TabOverview'
import { TabPlanLimits } from '../components/TenantDetail/TabPlanLimits'
import { TabModules } from '../components/TenantDetail/TabModules'
import { TabBranding } from '../components/TenantDetail/TabBranding'
import { TabCustomFields } from '../components/TenantDetail/TabCustomFields'
import { TabUsersHierarchy } from '../components/TenantDetail/TabUsersHierarchy'
import { TabBranchesPDVs } from '../components/TenantDetail/TabBranchesPDVs'
import { TabAuditLog } from '../components/TenantDetail/TabAuditLog'

const statusVariant: Record<TenantStatus, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  active: 'success',
  trial: 'info',
  suspended: 'warning',
  cancelled: 'danger',
}

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  { id: 'plan', label: 'Plano & Limites', icon: <CreditCard className="h-3.5 w-3.5" /> },
  { id: 'modules', label: 'Módulos', icon: <Puzzle className="h-3.5 w-3.5" /> },
  { id: 'branding', label: 'Branding', icon: <Palette className="h-3.5 w-3.5" /> },
  { id: 'customfields', label: 'Campos Custom', icon: <Settings2 className="h-3.5 w-3.5" /> },
  { id: 'users', label: 'Usuários', icon: <Users className="h-3.5 w-3.5" /> },
  { id: 'branches', label: 'Filiais & PDVs', icon: <GitBranch className="h-3.5 w-3.5" /> },
  { id: 'audit', label: 'Audit Log', icon: <ScrollText className="h-3.5 w-3.5" /> },
]

export default function TenantDetailPage() {
  const { tenantId } = useParams({ from: '/protected-layout/tenants/$tenantId' })
  const [activeTab, setActiveTab] = useState('overview')

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
      return MOCK_TENANTS.find((t) => t.id === tenantId) ?? null
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="p-6 text-center">
        <p className="text-fg-muted">Tenant não encontrado</p>
        <Link to="/tenants">
          <Button variant="secondary" size="sm" className="mt-4">
            Voltar para Tenants
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 pt-6 pb-0 border-b border-[var(--border)] bg-surface-1">
        <div className="flex items-start gap-4 mb-4">
          <Link to="/tenants">
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
              className="-ml-1"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-fg">{tenant.name}</h1>
              <Badge variant={statusVariant[tenant.status]}>
                {statusLabels[tenant.status]}
              </Badge>
              <Badge variant="neutral">{segmentLabels[tenant.segment]}</Badge>
              <Badge variant="neutral">{tenant.plan.name}</Badge>
            </div>
            <p className="text-sm text-fg-dim font-mono mt-0.5">{tenant.slug}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://${tenant.slug}.erp.com.br`, '_blank')}
          >
            Impersonar
          </Button>
        </div>

        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && <TabOverview tenant={tenant} />}
        {activeTab === 'plan' && <TabPlanLimits tenant={tenant} />}
        {activeTab === 'modules' && <TabModules tenant={tenant} />}
        {activeTab === 'branding' && <TabBranding tenant={tenant} />}
        {activeTab === 'customfields' && <TabCustomFields tenant={tenant} />}
        {activeTab === 'users' && <TabUsersHierarchy tenant={tenant} />}
        {activeTab === 'branches' && <TabBranchesPDVs tenant={tenant} />}
        {activeTab === 'audit' && <TabAuditLog tenant={tenant} />}
      </div>
    </div>
  )
}
