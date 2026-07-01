'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PermissionGuard from '@/components/security/PermissionGuard';
import PermissionMatrix from '@/components/security/PermissionMatrix';
import { securityService } from '@/services/securityService';
import {
  EffectivePermission,
  ModuleRegistryResponse,
  SecurityAuditLog,
  SecurityPermission,
  SecurityRole,
  SecurityUser,
} from '@/types/security';
import { Check, Plus, RefreshCw, Save, Shield, Trash2, UserPlus, X } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { useRbac } from '@/lib/rbac';
import { FormInput, FormTextarea, FormSelect, FormButton } from '@/components/forms/FormElements';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'matrix' | 'assignment' | 'audit'>('roles');
  const [registry, setRegistry] = useState<ModuleRegistryResponse>({ modules: [], actions: [] });
  const [roles, setRoles] = useState<SecurityRole[]>([]);
  const [users, setUsers] = useState<SecurityUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [matrix, setMatrix] = useState<SecurityPermission[]>([]);
  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newRole, setNewRole] = useState({ roleName: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { allowed: canCreateSecurity } = usePermission('SECURITY', 'CREATE');
  const { allowed: canUpdateSecurity } = usePermission('SECURITY', 'UPDATE');
  const { allowed: canDeleteSecurity } = usePermission('SECURITY', 'DELETE');
  const { refreshRbac } = useRbac();

  const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId), [roles, selectedRoleId]);
  const selectedUser = useMemo(() => users.find((user) => user.id === selectedUserId), [users, selectedUserId]);

  useEffect(() => {
    loadSecurity();
  }, []);

  useEffect(() => {
    if (selectedRoleId) loadMatrix(selectedRoleId);
  }, [selectedRoleId]);

  useEffect(() => {
    if (selectedUserId) loadEffectivePermissions(selectedUserId);
  }, [selectedUserId]);

  const loadSecurity = async () => {
    try {
      setLoading(true);
      const [registryData, roleData, userData, logs] = await Promise.all([
        securityService.registry(),
        securityService.roles(),
        securityService.users(),
        securityService.auditLogs(),
      ]);

      setRegistry(registryData);
      setRoles(roleData);
      setUsers(userData);
      setAuditLogs(logs);
      setSelectedRoleId((current) => current || roleData[0]?.id || '');
      setSelectedUserId((current) => current || userData[0]?.id || '');
    } catch (error: any) {
      setMessage(error.message || 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const loadMatrix = async (roleId: string) => {
    const data = await securityService.roleMatrix(roleId);
    setMatrix(data.permissions);
  };

  const loadEffectivePermissions = async (userId: string) => {
    const data = await securityService.effectivePermissions(userId);
    setEffectivePermissions(data);
  };

  const handleCreateRole = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newRole.roleName.trim()) return;

    try {
      setSaving(true);
      const role = await securityService.createRole({ roleName: newRole.roleName, description: newRole.description, isActive: true });
      setNewRole({ roleName: '', description: '' });
      await loadSecurity();
      await refreshRbac();
      setSelectedRoleId(role.id);
      setMessage('Role created');
    } catch (error: any) {
      setMessage(error.message || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role: SecurityRole) => {
    if (role.is_system_role) return;
    try {
      setSaving(true);
      await securityService.deleteRole(role.id);
      await loadSecurity();
      await refreshRbac();
      setMessage('Role deleted');
    } catch (error: any) {
      setMessage(error.message || 'Failed to delete role');
    } finally {
      setSaving(false);
    }
  };

  const handleMatrixChange = (permissionId: string, allowed: boolean) => {
    setMatrix((current) =>
      current.map((permission) =>
        (permission.permission_id || permission.id) === permissionId ? { ...permission, allowed } : permission
      )
    );
  };

  const handleSaveMatrix = async () => {
    if (!selectedRoleId) return;

    try {
      setSaving(true);
      await securityService.updateRoleMatrix(
        selectedRoleId,
        matrix.map((permission) => ({ permissionId: (permission.permission_id || permission.id) as string, allowed: Boolean(permission.allowed) }))
      );
      await loadSecurity();
      await refreshRbac();
      setMessage('Permission matrix updated');
    } catch (error: any) {
      setMessage(error.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignRole = async (roleId: string) => {
    if (!selectedUserId) return;
    try {
      setSaving(true);
      await securityService.assignRole(selectedUserId, roleId);
      await loadSecurity();
      await loadEffectivePermissions(selectedUserId);
      await refreshRbac();
      setMessage('Role assigned');
    } catch (error: any) {
      setMessage(error.message || 'Failed to assign role');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!selectedUserId) return;
    try {
      setSaving(true);
      await securityService.removeRole(selectedUserId, roleId);
      await loadSecurity();
      await loadEffectivePermissions(selectedUserId);
      await refreshRbac();
      setMessage('Role removed');
    } catch (error: any) {
      setMessage(error.message || 'Failed to remove role');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value: string) => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const tabs = [
    { id: 'roles', label: 'Roles' },
    { id: 'matrix', label: 'Permission Matrix' },
    { id: 'assignment', label: 'Role Assignment' },
    { id: 'audit', label: 'Audit Logs' },
  ] as const;

  return (
    <DashboardLayout>
      <PermissionGuard moduleKey="SECURITY" action="VIEW">
        <div className="p-6 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Security</h1>
              <p className="text-slate-500 mt-1">Centralized roles, permissions, assignments, and audit history</p>
            </div>
            <button
              onClick={loadSecurity}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {message && (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <span>{message}</span>
              <button onClick={() => setMessage('')} className="text-emerald-600 hover:text-emerald-800">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-slate-500">Loading security module...</div>
          ) : (
            <>
              {activeTab === 'roles' && (
                <div className={`grid gap-6 ${canCreateSecurity ? 'lg:grid-cols-[360px_1fr]' : 'lg:grid-cols-1'}`}>
                  {canCreateSecurity && (
                    <form onSubmit={handleCreateRole} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm h-fit">
                      <div className="flex items-center gap-2 text-slate-900">
                        <Shield size={18} className="text-emerald-600" />
                        <h2 className="font-semibold">Create Role</h2>
                      </div>
                      <FormInput
                        label="Role Name"
                        value={newRole.roleName}
                        onChange={(event) => setNewRole({ ...newRole, roleName: event.target.value })}
                        placeholder="e.g. Fleet Supervisor"
                      />
                      <FormTextarea
                        label="Description"
                        value={newRole.description}
                        onChange={(event) => setNewRole({ ...newRole, description: event.target.value })}
                        placeholder="What this role is for"
                      />
                      <FormButton type="submit" loading={saving} loadingText="Creating...">
                        <span className="inline-flex items-center gap-2">
                          <Plus size={16} />
                          Create Role
                        </span>
                      </FormButton>
                    </form>
                  )}

                  <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 text-left">Role</th>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {roles.map((role) => (
                          <tr key={role.id} className="hover:bg-emerald-50/40 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-900">{role.role_name}</div>
                              <div className="text-slate-500">{role.description || 'No description'}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-500">{role.is_system_role ? 'System' : 'Custom'}</td>
                            <td className="px-4 py-3">
                              {role.is_active ? (
                                <span className="text-emerald-600 font-medium">Active</span>
                              ) : (
                                <span className="text-slate-400">Inactive</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {canDeleteSecurity && (
                                <button
                                  onClick={() => handleDeleteRole(role)}
                                  disabled={role.is_system_role || saving}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                                  title="Delete role"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'matrix' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <FormSelect
                      value={selectedRoleId}
                      onChange={(event) => setSelectedRoleId(event.target.value)}
                      className="md:max-w-xs"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.role_name}
                        </option>
                      ))}
                    </FormSelect>
                    {canUpdateSecurity && (
                      <FormButton
                        onClick={handleSaveMatrix}
                        disabled={saving || !selectedRole}
                        className="md:w-auto px-4"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Save size={16} />
                          Save Matrix
                        </span>
                      </FormButton>
                    )}
                  </div>
                  <PermissionMatrix permissions={matrix} actions={registry.actions} editable={canUpdateSecurity} onChange={handleMatrixChange} />
                </div>
              )}

              {activeTab === 'assignment' && (
                <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                  <div className="space-y-4">
                    <FormSelect
                      value={selectedUserId}
                      onChange={(event) => setSelectedUserId(event.target.value)}
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} - {user.email}
                        </option>
                      ))}
                    </FormSelect>

                    <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
                      <h2 className="font-semibold text-slate-900">Assigned Roles</h2>
                      {selectedUser?.roles.length ? (
                        selectedUser.roles.map((role) => (
                          <div
                            key={role.id}
                            className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-slate-700"
                          >
                            <span>{role.role_name}</span>
                            {canUpdateSecurity && (
                              <button
                                onClick={() => handleRemoveRole(role.role_id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-400">No roles assigned</div>
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
                      <h2 className="font-semibold text-slate-900">Available Roles</h2>
                      {canUpdateSecurity ? (
                        roles.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => handleAssignRole(role.id)}
                            disabled={selectedUser?.roles.some((userRole) => userRole.role_id === role.id)}
                            className="flex w-full items-center justify-between rounded border border-slate-200 px-3 py-2 text-left text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-slate-200"
                          >
                            <span>{role.role_name}</span>
                            <UserPlus size={16} className="text-emerald-600" />
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-slate-400">Role assignment requires update permission</div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Check size={16} className="text-emerald-600" />
                      Effective Permissions Preview
                    </div>
                    <PermissionMatrix
                      permissions={effectivePermissions.map((permission) => ({
                        module_key: permission.moduleKey,
                        module_name: permission.moduleName,
                        action: permission.action,
                        description: null,
                        allowed: permission.allowed,
                      }))}
                      actions={registry.actions}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Action</th>
                        <th className="px-4 py-3 text-left">Changed By</th>
                        <th className="px-4 py-3 text-left">Entity</th>
                        <th className="px-4 py-3 text-left">When</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-900">{log.action.split('_').join(' ')}</td>
                          <td className="px-4 py-3 text-slate-500">{log.actor_name || 'System'}</td>
                          <td className="px-4 py-3 text-slate-500">{log.entity_type}</td>
                          <td className="px-4 py-3 text-slate-500">{formatDate(log.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}
