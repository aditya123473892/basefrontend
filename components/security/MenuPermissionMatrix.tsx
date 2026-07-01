'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SecurityPermission } from '@/types/security';
import { SidebarMenuRow } from '@/types/navigation';

interface MenuPermissionMatrixProps {
  menus: SidebarMenuRow[];
  permissions: SecurityPermission[];
  actions: string[];
  editable?: boolean;
  onChange?: (permissionId: string, allowed: boolean) => void;
}

export default function MenuPermissionMatrix({ menus, permissions, actions, editable, onChange }: MenuPermissionMatrixProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const permissionMap = useMemo(() => {
    const map = new Map<string, SecurityPermission>();
    for (const p of permissions) {
      const key = `${p.module_key}:${p.action}`;
      if (!map.has(key) && (p.permission_id || p.id)) {
        map.set(key, p);
      }
    }
    return map;
  }, [permissions]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const rows = useMemo(() => {
    const roots = menus.filter(m => !m.parent_id);
    const result: Array<{ row: SidebarMenuRow; depth: number }> = [];

    const walk = (items: SidebarMenuRow[], depth: number) => {
      for (const item of items) {
        result.push({ row: item, depth });
        const children = menus.filter(m => m.parent_id === item.id);
        if (children.length > 0) walk(children, depth + 1);
      }
    };

    walk(roots, 0);
    return result;
  }, [menus]);

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[180px]">Menu</th>
              {actions.map((action) => (
                <th key={action} className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[72px]">{action}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ row, depth }) => {
              const hasChildren = menus.some(m => m.parent_id === row.id);
              const isExpanded = expanded.has(row.id);
              const moduleKey = row.permission_module_key;
              const isLeaf = !hasChildren;
              const showToggle = editable && moduleKey && moduleKey !== '__PUBLIC__';

              return (
                <tr key={row.id} className={depth > 0 ? 'bg-slate-50/40' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 16}px` }}>
                      {hasChildren && (
                        <button type="button" onClick={() => toggle(row.id)} className="text-slate-400 hover:text-slate-600">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      )}
                      <span className={moduleKey && moduleKey !== '__PUBLIC__' ? 'font-medium text-slate-900' : 'text-slate-500'}>{row.label}</span>
                      {moduleKey && <span className="text-xs text-slate-400">({moduleKey})</span>}
                    </div>
                  </td>
                  {showToggle && moduleKey && row.permission_action ? (
                    actions.map((act) => {
                      const p = permissionMap.get(`${moduleKey}:${act}`);
                      const a = Boolean(p?.allowed);
                      const pid = p?.permission_id || p?.id;
                      return (
                        <td key={act} className="px-3 py-3 text-center">
                          {pid ? (
                            <button
                              type="button"
                              onClick={() => onChange?.(pid, !a)}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded border transition-colors ${
                                a ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-400 hover:border-emerald-300 hover:text-emerald-600'
                              }`}
                              title={`${row.label} ${act}`}
                            >
                              {a ? '✓' : '○'}
                            </button>
                          ) : (
                            <span className="text-slate-300">○</span>
                          )}
                        </td>
                      );
                    })
                  ) : (
                    <td colSpan={actions.length} className="px-3 py-3 text-center text-slate-400">
                      {hasChildren ? (isExpanded ? '' : 'Expand to view') : 'No permissions'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
