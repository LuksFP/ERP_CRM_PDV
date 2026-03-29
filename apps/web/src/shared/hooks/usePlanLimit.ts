import { useTenantConfig } from './useTenantConfig'

export type LimitResource = 'users' | 'pdvs' | 'branches' | 'products'

interface PlanLimitResult {
  current: number
  max: number
  percentage: number
  isNearLimit: boolean   // >= 80%
  isAtLimit: boolean     // >= 100%
  isUnlimited: boolean   // max === 9999 or max === 0
}

const UNLIMITED_SENTINEL = 9999

export function usePlanLimit(resource: LimitResource): PlanLimitResult {
  const { plan, usage } = useTenantConfig()

  const map: Record<LimitResource, { current: number; max: number }> = {
    users:    { current: usage.currentUsers,    max: plan.limits.maxUsers },
    pdvs:     { current: usage.currentPDVs,     max: plan.limits.maxPDVs },
    branches: { current: usage.currentBranches, max: plan.limits.maxBranches },
    products: { current: usage.currentProducts, max: plan.limits.maxProductsSKU },
  }

  const { current, max } = map[resource]
  const isUnlimited = max === 0 || max >= UNLIMITED_SENTINEL
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((current / max) * 100))

  return {
    current,
    max,
    percentage,
    isNearLimit: !isUnlimited && percentage >= 80,
    isAtLimit: !isUnlimited && current >= max,
    isUnlimited,
  }
}
