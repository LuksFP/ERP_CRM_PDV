import { useTenantConfig } from './useTenantConfig'
import type { TenantRole, ModuleKey } from '@/shared/types'

const ROLE_HIERARCHY: Record<TenantRole, number> = {
  owner: 5,
  manager: 4,
  financial: 3,
  seller: 2,
  stock_clerk: 2,
  cashier: 1,
}

// Which modules each role can access
const ROLE_MODULE_ACCESS: Record<TenantRole, ModuleKey[]> = {
  owner: ['dashboard', 'inventory', 'pdv', 'crm', 'financial', 'fiscal', 'purchasing', 'team', 'branches', 'settings'],
  manager: ['dashboard', 'inventory', 'pdv', 'crm', 'financial', 'fiscal', 'purchasing', 'team', 'branches'],
  financial: ['dashboard', 'financial', 'fiscal'],
  seller: ['dashboard', 'pdv', 'crm'],
  stock_clerk: ['dashboard', 'inventory', 'purchasing'],
  cashier: ['pdv'],
}

export function usePermissions() {
  const { currentUser, modules } = useTenantConfig()
  const role = currentUser.role

  function canAccess(module: ModuleKey): boolean {
    const roleModules = ROLE_MODULE_ACCESS[role] ?? []
    return roleModules.includes(module) && modules.enabled.includes(module)
  }

  function isModuleLocked(module: ModuleKey): boolean {
    return modules.locked.includes(module)
  }

  function isModuleEnabled(module: ModuleKey): boolean {
    return modules.enabled.includes(module)
  }

  function hasRole(minRole: TenantRole): boolean {
    return (ROLE_HIERARCHY[role] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0)
  }

  function hasPermission(permission: string): boolean {
    return currentUser.permissions.includes(permission)
  }

  function getVisibleModules(): { module: ModuleKey; locked: boolean; accessible: boolean }[] {
    const allModules: ModuleKey[] = [
      'dashboard', 'inventory', 'pdv', 'crm',
      'financial', 'fiscal', 'purchasing', 'team', 'branches', 'settings',
    ]

    const roleModules = ROLE_MODULE_ACCESS[role] ?? []

    return allModules
      .filter((m) => roleModules.includes(m))
      .map((m) => ({
        module: m,
        locked: modules.locked.includes(m),
        accessible: modules.enabled.includes(m),
      }))
  }

  return {
    role,
    canAccess,
    isModuleLocked,
    isModuleEnabled,
    hasRole,
    hasPermission,
    getVisibleModules,
    isOwner: role === 'owner',
    isManager: ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.manager,
    currentUser,
  }
}
