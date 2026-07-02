'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Edit, Trash2, ChevronDown, X, Save, User as UserIcon, Mail, Shield } from 'lucide-react';
import { User, CreateUserData, UpdateUserData } from '@/types/user';
import { userService } from '@/services/userService';
import { securityService } from '@/services/securityService';
import { SecurityRole } from '@/types/security';
import PermissionGuard from '@/components/security/PermissionGuard';
import { usePermission } from '@/hooks/usePermission';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SearchBar from '@/components/common/SearchBar';
import ActionButtons from '@/components/common/ActionButtons';
import { FormInput, FormButton } from '@/components/forms/FormElements';
import { useToast } from '@/hooks/useToast';
import AlertModal from '@/components/ui/AlertModal';

export default function UserMasterPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<SecurityRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { allowed: canCreateUsers } = usePermission('users.user_management', 'create');
  const { allowed: canUpdateUsers } = usePermission('users.user_management', 'update');
  const { allowed: canDeleteUsers } = usePermission('users.user_management', 'delete');
  const toast = useToast();

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserData>({
    email: '',
    full_name: '',
    password: '',
    role: 'USER',
    roleIds: []
  });
  const [editForm, setEditForm] = useState<UpdateUserData>({
    full_name: '',
    role: 'USER',
    is_active: true,
    roleIds: []
  });
  const [formLoading, setFormLoading] = useState(false);

  // Alert modal states
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'OK',
    showCancel: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [userData, roleData] = await Promise.all([
        userService.getAllUsers(),
        securityService.roles(),
      ]);
      setUsers(userData);
      setRoles(roleData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch data', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const assignedRoleNames = (user.roles || []).map(role => role.role_name);
    const matchesRole = selectedRole === '' || assignedRoleNames.includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'USER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      roleIds: (user.roles || []).map(role => role.role_id)
    });
    setShowEditModal(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.full_name || !createForm.password) {
      toast.warning('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (createForm.roleIds.length === 0) {
      toast.warning('Validation Error', 'Please select at least one role');
      return;
    }

    // One user - one role constraint
    if (createForm.roleIds.length > 1) {
      toast.warning('Validation Error', 'A user can have only one role');
      return;
    }

    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm User Creation',
      message: `Are you sure you want to create user "${createForm.full_name}" with role "${roles.find(r => r.id === createForm.roleIds[0])?.role_name}"?`,
      onConfirm: async () => {
        setFormLoading(true);
        try {
          await userService.createUser(createForm);
          setShowCreateModal(false);
          setCreateForm({
            email: '',
            full_name: '',
            password: '',
            role: 'USER',
            roleIds: []
          });
          await fetchUsers();
          toast.success('User created successfully!');
        } catch (error) {
          console.error('Failed to create user:', error);
          toast.error('Failed to create user', 'Please try again');
        } finally {
          setFormLoading(false);
        }
      },
      confirmText: 'Create User',
      showCancel: true
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (editForm.roleIds.length === 0) {
      toast.warning('Validation Error', 'Please select at least one role');
      return;
    }

    // One user - one role constraint
    if (editForm.roleIds.length > 1) {
      toast.warning('Validation Error', 'A user can have only one role');
      return;
    }

    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm User Update',
      message: `Are you sure you want to update user "${selectedUser.full_name}"? This will change their role to "${roles.find(r => r.id === editForm.roleIds[0])?.role_name}".`,
      onConfirm: async () => {
        setFormLoading(true);
        try {
          await userService.updateUser(selectedUser.id, editForm);
          setShowEditModal(false);
          setSelectedUser(null);
          await fetchUsers();
          toast.success('User updated successfully!');
        } catch (error) {
          console.error('Failed to update user:', error);
          toast.error('Failed to update user', 'Please try again');
        } finally {
          setFormLoading(false);
        }
      },
      confirmText: 'Save Changes',
      showCancel: true
    });
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.full_name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await userService.deleteUser(userId);
          await fetchUsers();
          toast.success('User deleted successfully!');
        } catch (error) {
          console.error('Failed to delete user:', error);
          toast.error('Failed to delete user', 'Please try again');
        }
      },
      confirmText: 'Delete',
      showCancel: true
    });
  };

  const toggleCreateRole = (roleId: string) => {
    // One user - one role constraint
    if (createForm.roleIds.includes(roleId)) {
      const current = createForm.roleIds || [];
      setCreateForm({
        ...createForm,
        roleIds: current.filter(id => id !== roleId)
      });
    } else {
      // If selecting a new role, replace the existing one
      setCreateForm({
        ...createForm,
        roleIds: [roleId]
      });
    }
  };

  const toggleEditRole = (roleId: string) => {
    // One user - one role constraint
    if (editForm.roleIds.includes(roleId)) {
      const current = editForm.roleIds || [];
      setEditForm({
        ...editForm,
        roleIds: current.filter(id => id !== roleId)
      });
    } else {
      // If selecting a new role, replace the existing one
      setEditForm({
        ...editForm,
        roleIds: [roleId]
      });
    }
  };

  return (
    <DashboardLayout>
      <PermissionGuard moduleKey="users.user_management" action="read">
        <div className="p-6">
          <PageHeader
            title="User Master"
            subtitle="Manage company users and their roles"
            action={
              canCreateUsers
                ? {
                    label: 'Add User',
                    onClick: () => setShowCreateModal(true),
                    icon: Plus,
                  }
                : undefined
            }
          />

          {/* Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search users by name or email..."
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <LoadingSpinner text="Loading users..." />
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-emerald-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-700 font-semibold text-sm">
                                  {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{user.full_name}</div>
                                <div className="text-sm text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                              {(user.roles || []).length ? (user.roles || []).map(role => role.role_name).join(', ') : user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {user.is_active ? (
                                <>
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                  <span className="text-emerald-600 text-sm">Active</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span className="text-red-600 text-sm">Inactive</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(user.last_login_at)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <ActionButtons
                              actions={[
                                canUpdateUsers && {
                                  icon: Edit,
                                  onClick: () => handleEditUser(user),
                                  title: 'Edit user',
                                },
                                canDeleteUsers && {
                                  icon: Trash2,
                                  onClick: () => handleDeleteUser(user.id),
                                  title: 'Delete user',
                                  variant: 'danger',
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1">
              <div className="text-2xl font-bold text-slate-900">{users.length}</div>
              <div className="text-sm text-slate-500">Total Users</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1">
              <div className="text-2xl font-bold text-emerald-700">{users.filter(u => u.is_active).length}</div>
              <div className="text-sm text-slate-500">Active Users</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1">
              <div className="text-2xl font-bold text-slate-700">{users.filter(u => !u.is_active).length}</div>
              <div className="text-sm text-slate-500">Inactive Users</div>
            </div>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Create New User</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <FormInput
                  label="Full Name"
                  icon={UserIcon}
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />

                <FormInput
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />

                <FormInput
                  label="Password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role <span className="text-red-500">*</span>
                    <span className="text-xs text-slate-500 ml-2">(One user can have only one role)</span>
                  </label>
                  <div className="space-y-2">
                    {roles.map(role => (
                      <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(createForm.roleIds || []).includes(role.id)}
                          onChange={() => toggleCreateRole(role.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          disabled={(createForm.roleIds || []).length > 0 && !(createForm.roleIds || []).includes(role.id)}
                        />
                        <span>{role.role_name}</span>
                      </label>
                    ))}
                    {roles.length === 0 && <div className="text-sm text-slate-500">No roles available</div>}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <FormButton type="submit" loading={formLoading} loadingText="Creating...">
                    <span className="inline-flex items-center gap-2">
                      <Save size={18} />
                      Create User
                    </span>
                  </FormButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Edit User</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <FormInput
                  label="Full Name"
                  icon={UserIcon}
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role <span className="text-red-500">*</span>
                    <span className="text-xs text-slate-500 ml-2">(One user can have only one role)</span>
                  </label>
                  <div className="space-y-2">
                    {roles.map(role => (
                      <label key={role.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(editForm.roleIds || []).includes(role.id)}
                          onChange={() => toggleEditRole(role.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          disabled={(editForm.roleIds || []).length > 0 && !(editForm.roleIds || []).includes(role.id)}
                        />
                        <span>{role.role_name}</span>
                      </label>
                    ))}
                    {roles.length === 0 && <div className="text-sm text-slate-500">No roles available</div>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={editForm.is_active}
                        onChange={() => setEditForm({ ...editForm, is_active: true })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={!editForm.is_active}
                        onChange={() => setEditForm({ ...editForm, is_active: false })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700">Inactive</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <FormButton type="submit" loading={formLoading} loadingText="Saving...">
                    <span className="inline-flex items-center gap-2">
                      <Save size={18} />
                      Save Changes
                    </span>
                  </FormButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={alertModal.onConfirm}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          confirmText={alertModal.confirmText}
          showCancel={alertModal.showCancel}
        />
      </PermissionGuard>
    </DashboardLayout>
  );
}