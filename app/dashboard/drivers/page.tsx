'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Edit, Trash2, X, Save, User as UserIcon, Phone, FileText } from 'lucide-react';
import { Driver, CreateDriverData, UpdateDriverData } from '@/types/driver';
import { driverService } from '@/services/driverService';
import AlertModal from '@/components/ui/AlertModal';
import PermissionGuard from '@/components/security/PermissionGuard';
import { usePermission } from '@/hooks/usePermission';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SearchBar from '@/components/common/SearchBar';
import ActionButtons from '@/components/common/ActionButtons';
import { FormInput, FormButton } from '@/components/forms/FormElements';
import { useToast } from '@/hooks/useToast';

export default function DriverMasterPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const { allowed: canCreateDrivers } = usePermission('transport.drivers', 'create');
  const { allowed: canUpdateDrivers } = usePermission('transport.drivers', 'update');
  const { allowed: canDeleteDrivers } = usePermission('transport.drivers', 'delete');
  const toast = useToast();

  const [createForm, setCreateForm] = useState<CreateDriverData>({
    full_name: '',
    phone: '',
    license_number: ''
  });
  const [editForm, setEditForm] = useState<UpdateDriverData>({
    full_name: '',
    phone: '',
    license_number: '',
    is_active: true
  });
  const [formLoading, setFormLoading] = useState(false);

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'OK',
    showCancel: false
  });

  // Toast helper for non-confirm alerts
  const showToastAlert = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    switch (type) {
      case 'success':
        toast.success(title, message);
        break;
      case 'error':
        toast.error(title, message);
        break;
      case 'warning':
        toast.warning(title, message);
        break;
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const driverData = await driverService.getAllDrivers();
      setDrivers(driverData);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      toast.error('Failed to fetch drivers', 'Please try again later');
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (driver.license_number && driver.license_number.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditForm({
      full_name: driver.full_name,
      phone: driver.phone,
      license_number: driver.license_number || '',
      is_active: driver.is_active
    });
    setShowEditModal(true);
  };

  const handleDeleteDriver = async (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Driver',
      message: `Are you sure you want to delete ${driver.full_name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await driverService.deleteDriver(driverId);
          await fetchDrivers();
          toast.success('Driver deleted successfully!');
        } catch (error) {
          console.error('Failed to delete driver:', error);
          toast.error('Failed to delete driver', 'Please try again');
        }
      },
      confirmText: 'Delete',
      showCancel: true
    });
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.full_name || !createForm.phone) {
      toast.warning('Validation Error', 'Please fill in all required fields');
      return;
    }

    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Driver Creation',
      message: `Are you sure you want to create driver "${createForm.full_name}"?`,
      onConfirm: async () => {
        setFormLoading(true);
        try {
          await driverService.createDriver(createForm);
          setShowCreateModal(false);
          setCreateForm({
            full_name: '',
            phone: '',
            license_number: ''
          });
          await fetchDrivers();
          toast.success('Driver created successfully!');
        } catch (error) {
          console.error('Failed to create driver:', error);
          toast.error('Failed to create driver', 'Please try again');
        } finally {
          setFormLoading(false);
        }
      },
      confirmText: 'Create Driver',
      showCancel: true
    });
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Driver Update',
      message: `Are you sure you want to update driver "${selectedDriver.full_name}"?`,
      onConfirm: async () => {
        setFormLoading(true);
        try {
          await driverService.updateDriver(selectedDriver.id, editForm);
          setShowEditModal(false);
          setSelectedDriver(null);
          await fetchDrivers();
          toast.success('Driver updated successfully!');
        } catch (error) {
          console.error('Failed to update driver:', error);
          toast.error('Failed to update driver', 'Please try again');
        } finally {
          setFormLoading(false);
        }
      },
      confirmText: 'Save Changes',
      showCancel: true
    });
  };

  return (
    <DashboardLayout>
      <PermissionGuard moduleKey="transport.drivers" action="read">
        <div className="p-6">
          <PageHeader
            title="Driver Master"
            subtitle="Manage company drivers and their information"
            action={
              canCreateDrivers
                ? {
                    label: 'Add Driver',
                    onClick: () => setShowCreateModal(true),
                    icon: Plus,
                  }
                : undefined
            }
          />

          {/* Search */}
          <div className="mb-6">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search drivers by name, phone, or license..."
            />
          </div>

          {/* Table */}
          {loading ? (
            <LoadingSpinner text="Loading drivers..." />
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">License</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDrivers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No drivers found
                        </td>
                      </tr>
                    ) : (
                      filteredDrivers.map((driver) => (
                        <tr key={driver.id} className="hover:bg-emerald-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-700 font-semibold text-sm">
                                  {driver.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{driver.full_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Phone size={16} className="text-slate-400" />
                              <span className="text-slate-600">{driver.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <FileText size={16} className="text-slate-400" />
                              <span className="text-slate-600">{driver.license_number || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {driver.is_active ? (
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
                            {formatDate(driver.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <ActionButtons
                              actions={[
                                canUpdateDrivers
                                  ? {
                                      icon: Edit,
                                      onClick: () => handleEditDriver(driver),
                                      title: 'Edit driver',
                                    }
                                  : null,
                                canDeleteDrivers
                                  ? {
                                      icon: Trash2,
                                      onClick: () => handleDeleteDriver(driver.id),
                                      title: 'Delete driver',
                                      variant: 'danger' as const,
                                    }
                                  : null,
                              ].filter((action) => action !== null)}
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
              <div className="text-2xl font-bold text-slate-900">{drivers.length}</div>
              <div className="text-sm text-slate-500">Total Drivers</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1">
              <div className="text-2xl font-bold text-emerald-700">{drivers.filter(d => d.is_active).length}</div>
              <div className="text-sm text-slate-500">Active Drivers</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1">
              <div className="text-2xl font-bold text-slate-700">{drivers.filter(d => !d.is_active).length}</div>
              <div className="text-sm text-slate-500">Inactive Drivers</div>
            </div>
          </div>
        </div>

        {/* Create Driver Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Create New Driver</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateDriver} className="space-y-4">
                <FormInput
                  label="Full Name"
                  icon={UserIcon}
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />

                <FormInput
                  label="Phone Number"
                  icon={Phone}
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />

                <FormInput
                  label="License Number"
                  icon={FileText}
                  value={createForm.license_number}
                  onChange={(e) => setCreateForm({ ...createForm, license_number: e.target.value })}
                  placeholder="Enter license number (optional)"
                />

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
                      Create Driver
                    </span>
                  </FormButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Driver Modal */}
        {showEditModal && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Edit Driver</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateDriver} className="space-y-4">
                <FormInput
                  label="Full Name"
                  icon={UserIcon}
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />

                <FormInput
                  label="Phone Number"
                  icon={Phone}
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />

                <FormInput
                  label="License Number"
                  icon={FileText}
                  value={editForm.license_number}
                  onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })}
                  placeholder="Enter license number (optional)"
                />

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
