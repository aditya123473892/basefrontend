'use client';

import { useRbac } from '@/lib/rbac';

export function usePermissions() {
  const { permissions, isLoading, can } = useRbac();
  return { permissions, loading: isLoading, can };
}

export function usePermission(moduleKey: string, action: string) {
  const { isLoading, can } = useRbac();
  return { allowed: can(moduleKey, action), loading: isLoading };
}
