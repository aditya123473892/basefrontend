'use client';

import { Check, X } from 'lucide-react';
import { SecurityPermission } from '@/types/security';

interface PermissionMatrixProps {
  permissions: SecurityPermission[];
  actions: string[];
  editable?: boolean;
  onChange?: (permissionId: string, allowed: boolean) => void;
}

export default function PermissionMatrix({ permissions, actions, editable = false, onChange }: PermissionMatrixProps) {
  const moduleRows = permissions.reduce<Record<string, { moduleName: string; permissions: SecurityPermission[] }>>((acc, permission) => {
    if (!acc[permission.module_key]) {
      acc[permission.module_key] = { moduleName: permission.module_name, permissions: [] };
    }
    acc[permission.module_key].permissions.push(permission);
    return acc;
  }, {});

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-emerald-50">
            <tr>
              <th className="px-4 py-3 text-left text-emerald-700 font-semibold min-w-[180px]">Module</th>
              {actions.map((action) => (
                <th key={action} className="px-3 py-3 text-center text-emerald-700 font-semibold min-w-[96px]">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(moduleRows).map(([moduleKey, row]) => (
              <tr key={moduleKey} className="hover:bg-emerald-50/40">
                <td className="px-4 py-3 font-medium text-slate-900">{row.moduleName}</td>
                {actions.map((action) => {
                  const permission = row.permissions.find((item) => item.action === action);
                  const permissionId = permission?.permission_id || permission?.id;
                  const allowed = Boolean(permission?.allowed);

                  return (
                    <td key={`${moduleKey}-${action}`} className="px-3 py-3 text-center">
                      {editable && permissionId ? (
                        <button
                          type="button"
                          onClick={() => onChange?.(permissionId, !allowed)}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded border transition-colors ${
                            allowed
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-white text-slate-400 hover:border-emerald-300 hover:text-emerald-600'
                          }`}
                          title={`${row.moduleName} ${action}`}
                        >
                          {allowed ? <Check size={16} /> : <X size={16} />}
                        </button>
                      ) : (
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded ${allowed ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {allowed ? <Check size={16} /> : <X size={16} />}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
