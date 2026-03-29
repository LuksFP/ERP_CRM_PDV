import { useTenantConfig } from './useTenantConfig'
import type { CustomFieldEntity, CustomFieldDefinition } from '@/shared/types'

export function useCustomFields(entity: CustomFieldEntity): CustomFieldDefinition[] {
  const { customFields } = useTenantConfig()
  return customFields[entity] ?? []
}
