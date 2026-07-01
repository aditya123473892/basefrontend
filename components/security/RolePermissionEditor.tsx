'use client';

import { Check, Square, SquareCheckBig } from 'lucide-react';
import { Fragment } from 'react';
import { PermissionModule, PermissionNode, SecurityPermission, SecurityRole } from '@/types/security';
import { FormButton, FormInput, FormTextarea } from '@/components/forms/FormElements';

interface RolePermissionEditorProps {
  role: SecurityRole | null;
  roleName: string;
  description: string;
  modules: PermissionModule[];
  actions: string[];
  permissions: SecurityPermission[];
  editable: boolean;
  saving: boolean;
  onRoleNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPermissionChange: (permissionId: string, allowed: boolean) => void;
  onSave: () => void;
}

const actionLabels: Record<string, string> = {
  read: 'Read',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
};

export default function RolePermissionEditor({
  role,
  roleName,
  description,
  modules,
  actions,
  permissions,
  editable,
  saving,
  onRoleNameChange,
  onDescriptionChange,
  onPermissionChange,
  onSave,
}: RolePermissionEditorProps) {
  const permissionMap = new Map(permissions.map((permission) => [`${permission.module_key}:${permission.action}`, permission]));

  const leafRows = (module: PermissionModule) => {
    const rows: Array<{ node: PermissionNode; moduleKey: string; depth: number }> = [];
    const walk = (nodes: PermissionNode[], depth: number) => {
      for (const node of nodes) {
        if (node.isGroup) {
          rows.push({ node, moduleKey: '', depth });
          walk(node.children || [], depth + 1);
          continue;
        }
        rows.push({ node, moduleKey: `${module.moduleKey}.${node.key}`, depth });
      }
    };

    walk(module.children, 0);
    return rows;
  };

  const setModule = (module: PermissionModule, allowed: boolean) => {
    for (const row of leafRows(module)) {
      if (!row.moduleKey) continue;
      for (const action of actions) {
        const permission = permissionMap.get(`${row.moduleKey}:${action}`);
        const permissionId = permission?.permission_id || permission?.id;
        if (permissionId) onPermissionChange(permissionId, allowed);
      }
    }
  };

  const setRow = (moduleKey: string, allowed: boolean) => {
    for (const action of actions) {
      const permission = permissionMap.get(`${moduleKey}:${action}`);
      const permissionId = permission?.permission_id || permission?.id;
      if (permissionId) onPermissionChange(permissionId, allowed);
    }
  };

  const moduleSelected = (module: PermissionModule) =>
    leafRows(module)
      .filter((row) => row.moduleKey)
      .every((row) => actions.every((action) => Boolean(permissionMap.get(`${row.moduleKey}:${action}`)?.allowed)));

  const rowSelected = (moduleKey: string) => actions.every((action) => Boolean(permissionMap.get(`${moduleKey}:${action}`)?.allowed));

  if (!role) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">Select a role to edit permissions.</div>;
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Role Name" value={roleName} onChange={(event) => onRoleNameChange(event.target.value)} disabled={!editable || role.is_system_role} />
        <FormTextarea label="Description" value={description} onChange={(event) => onDescriptionChange(event.target.value)} disabled={!editable} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="min-w-[260px] px-4 py-3 text-left font-semibold">Module / Submodule</th>
              <th className="px-3 py-3 text-center font-semibold">All CRUD</th>
              {actions.map((action) => (
                <th key={action} className="px-3 py-3 text-center font-semibold">
                  {actionLabels[action] || action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {modules.map((module) => (
              <Fragment key={module.moduleKey}>
                <tr key={module.moduleKey} className="bg-emerald-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{module.moduleLabel}</td>
                  <td className="px-3 py-3 text-center" colSpan={actions.length + 1}>
                    {editable && (
                      <button
                        type="button"
                        onClick={() => setModule(module, !moduleSelected(module))}
                        className="inline-flex items-center gap-2 rounded border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <Check size={14} />
                        Select All
                      </button>
                    )}
                  </td>
                </tr>
                {leafRows(module).map(({ node, moduleKey, depth }) => {
                  if (!moduleKey) {
                    return (
                      <tr key={`${module.moduleKey}-${node.key}`} className="bg-slate-50/60">
                        <td className="px-4 py-2 text-xs font-semibold uppercase text-slate-500" colSpan={actions.length + 2} style={{ paddingLeft: `${16 + depth * 18}px` }}>
                          {node.label}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={moduleKey}>
                      <td className="px-4 py-3 text-slate-700" style={{ paddingLeft: `${16 + depth * 18}px` }}>
                        {node.label}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {editable && (
                          <button
                            type="button"
                            onClick={() => setRow(moduleKey, !rowSelected(moduleKey))}
                            className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700"
                            title={`Select all permissions for ${node.label}`}
                          >
                            {rowSelected(moduleKey) ? <SquareCheckBig size={16} /> : <Square size={16} />}
                          </button>
                        )}
                      </td>
                      {actions.map((action) => {
                        const permission = permissionMap.get(`${moduleKey}:${action}`);
                        const permissionId = permission?.permission_id || permission?.id;
                        const allowed = Boolean(permission?.allowed);

                        return (
                          <td key={`${moduleKey}-${action}`} className="px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              checked={allowed}
                              disabled={!editable || !permissionId}
                              onChange={(event) => permissionId && onPermissionChange(permissionId, event.target.checked)}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {editable && (
        <div className="flex justify-end">
          <FormButton onClick={onSave} loading={saving} loadingText="Saving..." className="md:w-auto px-4">
            Save Role
          </FormButton>
        </div>
      )}
    </div>
  );
}
