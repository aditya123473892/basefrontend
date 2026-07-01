'use client';

import { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

interface PermissionGuardProps {
  moduleKey: string;
  action: string;
  children: ReactNode;
}

export default function PermissionGuard({ moduleKey, action, children }: PermissionGuardProps) {
  const { allowed, loading } = usePermission(moduleKey, action);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white p-6 text-slate-500">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span>Checking permissions...</span>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="border border-slate-200 bg-white rounded-lg p-8 max-w-md text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 text-red-500" size={36} />
          <h1 className="text-2xl font-semibold mb-2 text-slate-900">403 Unauthorized</h1>
          <p className="text-slate-500">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
