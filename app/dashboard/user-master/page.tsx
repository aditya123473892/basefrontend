'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  X,
  Save,
  User as UserIcon,
  Mail,
  Shield
} from 'lucide-react';
import { User, CreateUserData, UpdateUserData } from '@/types/user';
import { userService } from '@/services/userService';
import AlertModal from '@/components/ui/AlertModal';
import { securityService } from '@/services/securityService';
import { SecurityRole } from '@/types/security';
import PermissionGuard from '@/components/security/PermissionGuard';
import { usePermission } from '@/hooks/usePermission';

export default function UserMasterPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<SecurityRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { allowed: canCreateUsers } = usePermission('USERS', 'CREATE');

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
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const toggleCreateRole = (roleId: string) => {
    const current = createForm.roleIds || [];
    setCreateForm({
      ...createForm,
      roleIds: current.includes(roleId)
        ? current.filter(id => id !== roleId)
        : [...current, roleId],
    });
  };

  const toggleEditRole = (roleId: string) => {
    const current = editForm.roleIds || [];
    setEditForm({
      ...editForm,
      roleIds: current.includes(roleId)
        ? current.filter(id => id !== roleId)
        : [...current, roleId],
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
          setAlertModal({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'User deleted successfully!',
            onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
            confirmText: 'OK',
            showCancel: false
          });
        } catch (error) {
          console.error('Failed to delete user:', error);
          setAlertModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete user. Please try again.',
            onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
            confirmText: 'OK',
            showCancel: false
          });
        }
      },
      confirmText: 'Delete',
      showCancel: true
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.full_name || !createForm.password) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
      return;
    }

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
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'User created successfully!',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to create user. Please try again.',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormLoading(true);
    try {
      await userService.updateUser(selectedUser.id, editForm);
      setShowEditModal(false);
      setSelectedUser(null);
      await fetchUsers();
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'User updated successfully!',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update user. Please try again.',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PermissionGuard moduleKey="USERS" action="VIEW">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Master</h1>
            <p className="text-zinc-500 mt-1">Manage company users and their roles</p>
          </div>
          {canCreateUsers && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors duration-300"
            >
              <Plus size={18} />
              <span>Add User</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
              />
            </div>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="appearance-none bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.role_name}>{role.role_name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-900 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <span className="text-black font-semibold text-sm">
                              {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.full_name}</div>
                            <div className="text-sm text-zinc-500">{user.email}</div>
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
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-green-400 text-sm">Active</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-red-400 text-sm">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {formatDate(user.last_login_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors duration-200"
                            title="Edit user"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors duration-200"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <div className="text-sm text-zinc-500">Total Users</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-green-400">{users.filter(u => u.is_active).length}</div>
            <div className="text-sm text-zinc-500">Active Users</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-blue-400">{users.filter(u => !u.is_active).length}</div>
            <div className="text-sm text-zinc-500">Inactive Users</div>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New User</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                  placeholder="Enter password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                  <div className="pl-10 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg space-y-2">
                    {roles.map(role => (
                      <label key={role.id} className="flex items-center gap-2 text-sm text-zinc-200">
                        <input
                          type="checkbox"
                          checked={(createForm.roleIds || []).includes(role.id)}
                          onChange={() => toggleCreateRole(role.id)}
                        />
                        <span>{role.role_name}</span>
                      </label>
                    ))}
                    {roles.length === 0 && <div className="text-sm text-zinc-500">No roles available</div>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors duration-200"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Create User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Role
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                  <div className="pl-10 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg space-y-2">
                    {roles.map(role => (
                      <label key={role.id} className="flex items-center gap-2 text-sm text-zinc-200">
                        <input
                          type="checkbox"
                          checked={(editForm.roleIds || []).includes(role.id)}
                          onChange={() => toggleEditRole(role.id)}
                        />
                        <span>{role.role_name}</span>
                      </label>
                    ))}
                    {roles.length === 0 && <div className="text-sm text-zinc-500">No roles available</div>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={editForm.is_active}
                      onChange={() => setEditForm({ ...editForm, is_active: true })}
                      className="text-white focus:ring-white"
                    />
                    <span className="text-zinc-300">Active</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={!editForm.is_active}
                      onChange={() => setEditForm({ ...editForm, is_active: false })}
                      className="text-white focus:ring-white"
                    />
                    <span className="text-zinc-300">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors duration-200"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
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
