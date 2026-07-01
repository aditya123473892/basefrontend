'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { SidebarMenuRow, SidebarMenuItem } from '@/types/navigation';
import { PermissionModule, PermissionNode } from '@/types/security';
import { navigationService } from '@/services/navigationService';
import { FormInput, FormButton, FormSelect } from '@/components/forms/FormElements';

interface MenuManagementProps {
  menus: SidebarMenuRow[];
  permissions: PermissionModule[];
  onRefresh: () => Promise<void>;
  editingMenu: SidebarMenuRow | null;
  setEditingMenu: (menu: SidebarMenuRow | null) => void;
  expandedMenus: Set<string>;
  setExpandedMenus: (menus: Set<string>) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  setMessage: (message: string) => void;
}

export default function MenuManagement({
  menus,
  permissions,
  onRefresh,
  editingMenu,
  setEditingMenu,
  expandedMenus,
  setExpandedMenus,
  saving,
  setSaving,
  setMessage,
}: MenuManagementProps) {
  const [form, setForm] = useState({
    label: '',
    path: '',
    iconKey: '',
    permissionModuleKey: '',
    permissionAction: '',
    parentId: '',
    sortOrder: 0,
  });
  const [isActive, setIsActive] = useState(true);

  const availableActions = ['read', 'create', 'update', 'delete'];
  const permissionOptions = permissions.flatMap((module) => {
    const rows: Array<{ key: string; label: string }> = [];
    const walk = (nodes: PermissionNode[], prefix: string[] = []) => {
      for (const node of nodes) {
        if (node.isGroup) {
          walk(node.children || [], [...prefix, node.label]);
          continue;
        }
        rows.push({
          key: `${module.moduleKey}.${node.key}`,
          label: [module.moduleLabel, ...prefix, node.label].join(' / '),
        });
      }
    };
    walk(module.children);
    return rows;
  });

  const resetForm = () => {
    setForm({
      label: '',
      path: '',
      iconKey: '',
      permissionModuleKey: '',
      permissionAction: '',
      parentId: '',
      sortOrder: 0,
    });
    setIsActive(true);
    setEditingMenu(null);
  };

  const handleEdit = (menu: SidebarMenuRow) => {
    setEditingMenu(menu);
    setForm({
      label: menu.label,
      path: menu.path || '',
      iconKey: menu.icon_key || '',
      permissionModuleKey: menu.permission_module_key || '',
      permissionAction: menu.permission_action || '',
      parentId: menu.parent_id || '',
      sortOrder: menu.sort_order,
    });
    setIsActive(menu.is_active);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.label.trim()) return;

    try {
      setSaving(true);
      if (editingMenu) {
        await navigationService.updateMenu(editingMenu.id, {
          label: form.label,
          path: form.path || null,
          iconKey: form.iconKey || null,
          permissionModuleKey: form.permissionModuleKey || null,
          permissionAction: form.permissionAction || null,
          parentId: form.parentId || null,
          sortOrder: form.sortOrder,
          isActive,
        });
        setMessage('Menu updated');
      } else {
        await navigationService.createMenu({
          label: form.label,
          path: form.path || null,
          iconKey: form.iconKey || null,
          permissionModuleKey: form.permissionModuleKey || null,
          permissionAction: form.permissionAction || null,
          parentId: form.parentId || null,
          sortOrder: form.sortOrder,
        });
        setMessage('Menu created');
      }
      resetForm();
      await onRefresh();
    } catch (error: any) {
      setMessage(error.message || 'Failed to save menu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu and its children?')) return;
    try {
      setSaving(true);
      await navigationService.deleteMenu(id);
      setMessage('Menu deleted');
      await onRefresh();
    } catch (error: any) {
      setMessage(error.message || 'Failed to delete menu');
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedMenus);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedMenus(next);
  };

  const buildTree = (rows: SidebarMenuRow[]): SidebarMenuItem[] => {
    const byId = new Map<string, SidebarMenuItem>();
    const roots: SidebarMenuItem[] = [];

    for (const row of rows) {
      byId.set(row.id, {
        id: row.id,
        label: row.label,
        path: row.path,
        iconKey: row.icon_key,
        moduleKey: row.permission_module_key,
        action: row.permission_action,
        children: [],
      });
    }

    for (const row of rows) {
      const item = byId.get(row.id);
      if (!item) continue;
      if (row.parent_id && byId.has(row.parent_id)) {
        byId.get(row.parent_id)?.children.push(item);
      } else {
        roots.push(item);
      }
    }

    return roots;
  };

  const tree = buildTree(menus);

  const renderNode = (node: SidebarMenuItem, depth = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedMenus.has(node.id);

    return (
      <li key={node.id} className="space-y-1">
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <div className="flex-1 rounded border border-slate-200 bg-white p-2 text-sm">
            <div className="font-medium text-slate-900">{node.label}</div>
            <div className="text-slate-500">
              {node.path || 'No path'} {node.moduleKey ? `• ${node.moduleKey}:${node.action}` : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleEdit(menus.find((m) => m.id === node.id) as SidebarMenuRow)}
            className="text-slate-400 hover:text-emerald-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(node.id)}
            className="text-slate-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {hasChildren && isExpanded && (
          <ul className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-2">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Menus</h2>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-emerald-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
        <ul className="space-y-2">{tree.map((node) => renderNode(node))}</ul>
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">{editingMenu ? 'Edit Menu' : 'Create Menu'}</h3>
          {editingMenu && (
            <button onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <FormInput
            label="Label"
            value={form.label}
            onChange={(event) => setForm({ ...form, label: event.target.value })}
            required
          />
          <FormInput
            label="Path"
            value={form.path}
            onChange={(event) => setForm({ ...form, path: event.target.value })}
            placeholder="/dashboard/example"
          />
          <FormInput
            label="Icon Key"
            value={form.iconKey}
            onChange={(event) => setForm({ ...form, iconKey: event.target.value })}
            placeholder="e.g. BarChart3"
          />
          <FormSelect
            label="Permission Module"
            value={form.permissionModuleKey}
            onChange={(event) => setForm({ ...form, permissionModuleKey: event.target.value })}
          >
            <option value="">None</option>
            {permissionOptions.map((permission) => (
              <option key={permission.key} value={permission.key}>
                {permission.label}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Permission Action"
            value={form.permissionAction}
            onChange={(event) => setForm({ ...form, permissionAction: event.target.value })}
          >
            <option value="">None</option>
            {availableActions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            label="Parent Menu"
            value={form.parentId}
            onChange={(event) => setForm({ ...form, parentId: event.target.value })}
          >
            <option value="">None (Top Level)</option>
            {menus.map((menu) => (
              <option key={menu.id} value={menu.id}>
                {menu.label}
              </option>
            ))}
          </FormSelect>
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <label htmlFor="isActive" className="text-sm text-slate-700">Active</label>
          </div>
          <FormButton type="submit" loading={saving} loadingText="Saving...">
            <span className="inline-flex items-center gap-2">
              {editingMenu ? <Trash2 size={16} /> : <Plus size={16} />}
              {editingMenu ? 'Update Menu' : 'Create Menu'}
            </span>
          </FormButton>
        </form>
      </div>
    </div>
  );
}
