'use client';

import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

export interface Permission {
  module: string;
  action: string;
}

export function useIsAllowed(permission?: Permission) {
  const { allowed } = usePermission(
    permission?.module ?? '__PUBLIC__',
    permission?.action ?? '__PUBLIC__'
  );

  if (!permission) return true;
  return allowed;
}

export function RBACGate({
  permission,
  children,
}: {
  permission?: Permission;
  children: ReactNode;
}) {
  const allowed = useIsAllowed(permission);
  if (!allowed) return null;
  return <>{children}</>;
}
