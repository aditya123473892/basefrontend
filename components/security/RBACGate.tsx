'use client';

import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

export interface Permission {
  module: string;
  action: string;
}

interface RBACGateProps {
  /** Omit module/action (or the whole `permission` prop upstream) to always render. */
  module: string;
  action: string;
  children: ReactNode;
  /** Optional content shown instead when the permission check fails. Defaults to nothing. */
  fallback?: ReactNode;
}

/**
 * Generic permission gate.
 *
 * Wrap anything — a stat card, a sidebar item, an action button, an entire
 * dashboard section — and it only renders when the current user's role
 * grants `module`/`action`. This is the single source of truth for "is this
 * visible" so RBAC logic never has to be re-implemented per component.
 *
 *   <RBACGate module="BILLINGS" action="VIEW">
 *     <StatCard ... />
 *   </RBACGate>
 */
export function RBACGate({ module, action, children, fallback = null }: RBACGateProps) {
  const { allowed } = usePermission(module, action);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * Same check without rendering anything — useful when a component needs to
 * branch on permission internally (e.g. self-gating, like StatCard does)
 * rather than being wrapped from the outside.
 */
export function useIsAllowed(permission?: Permission): boolean {
  const { allowed } = usePermission(permission?.module ?? '__PUBLIC__', permission?.action ?? '__PUBLIC__');
  return permission ? allowed : true;
}