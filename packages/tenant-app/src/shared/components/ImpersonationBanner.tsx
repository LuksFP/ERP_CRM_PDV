import { ShieldAlert, X } from 'lucide-react'
import { useAuthStore } from '@/modules/auth/store'

export function ImpersonationBanner() {
  const config = useAuthStore((s) => s.tenantConfig)
  const logout = useAuthStore((s) => s.logout)

  if (!config?.currentUser.isImpersonation) return null

  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 px-4 py-2 bg-amber-500 text-amber-950 text-sm font-medium">
      <ShieldAlert size={16} className="shrink-0" />
      <span>
        Você está em modo de <strong>impersonação</strong> como{' '}
        <strong>{config.currentUser.name}</strong> em{' '}
        <strong>{config.branding.name}</strong>. Cuidado ao fazer alterações.
      </span>
      <button
        onClick={logout}
        className="ml-auto flex items-center gap-1 text-xs font-semibold underline hover:no-underline"
      >
        <X size={13} /> Encerrar sessão
      </button>
    </div>
  )
}
