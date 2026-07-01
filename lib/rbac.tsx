'use client';

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { sessionService } from '@/services/sessionService';
import { EffectivePermission } from '@/types/security';
import { SidebarMenuItem } from '@/types/navigation';

interface RbacContextType {
  permissions: EffectivePermission[];
  sidebarMenus: SidebarMenuItem[];
  isLoading: boolean;
  error: string | null;
  can: (moduleKey: string, action: string) => boolean;
  refreshRbac: () => Promise<void>;
}

const RbacContext = createContext<RbacContextType | undefined>(undefined);

const FALLBACK_SIDEBAR: SidebarMenuItem[] = [
  {
    id: 'fallback-dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    iconKey: 'BarChart3',
    moduleKey: null,
    action: null,
    children: [],
  },
];

export function RbacProvider({ children }: { children: ReactNode }) {
  const { user, token, isLoading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<EffectivePermission[]>([]);
  const [sidebarMenus, setSidebarMenus] = useState<SidebarMenuItem[]>(FALLBACK_SIDEBAR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRbac = useCallback(async () => {
    if (!user || !token) {
      setPermissions([]);
      setSidebarMenus(FALLBACK_SIDEBAR);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await sessionService.bootstrap();
      setPermissions(data.permissions || []);
      setSidebarMenus(data.sidebarMenus?.length ? data.sidebarMenus : FALLBACK_SIDEBAR);
    } catch (err: any) {
      console.error('Failed to bootstrap RBAC session:', err);
      setPermissions([]);
      setSidebarMenus(FALLBACK_SIDEBAR);
      setError(err.message || 'Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (authLoading) return;
    refreshRbac();
  }, [authLoading, refreshRbac]);

  const permissionSet = useMemo(
    () => new Set(permissions.filter((permission) => permission.allowed).map((permission) => `${permission.moduleKey}:${permission.action}`)),
    [permissions]
  );

  const can = useCallback(
    (moduleKey: string, action: string) => {
      if (moduleKey === '__PUBLIC__' || action === '__PUBLIC__') return true;
      return permissionSet.has(`${moduleKey}:${action}`);
    },
    [permissionSet]
  );

  return (
    <RbacContext.Provider value={{ permissions, sidebarMenus, isLoading, error, can, refreshRbac }}>
      {children}
    </RbacContext.Provider>
  );
}

export function useRbac() {
  const context = useContext(RbacContext);
  if (!context) {
    throw new Error('useRbac must be used within RbacProvider');
  }
  return context;
}
