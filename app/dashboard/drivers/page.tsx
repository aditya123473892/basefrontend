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
  Phone,
  FileText
} from 'lucide-react';
import { Driver, CreateDriverData, UpdateDriverData } from '@/types/driver';
import { driverService } from '@/services/driverService';
import AlertModal from '@/components/ui/AlertModal';

export default function DriverMasterPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Form states
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
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const driverData = await driverService.getAllDrivers();
      setDrivers(driverData);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
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

  const handleDeleteDriver = (driverId: string) => {
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
          setAlertModal({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Driver deleted successfully!',
            onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
            confirmText: 'OK',
            showCancel: false
          });
        } catch (error) {
          console.error('Failed to delete driver:', error);
          setAlertModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete driver. Please try again.',
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

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.full_name || !createForm.phone) {
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
      await driverService.createDriver(createForm);
      setShowCreateModal(false);
      setCreateForm({
        full_name: '',
        phone: '',
        license_number: ''
      });
      await fetchDrivers();
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Driver created successfully!',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
    } catch (error) {
      console.error('Failed to create driver:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to create driver. Please try again.',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    setFormLoading(true);
    try {
      await driverService.updateDriver(selectedDriver.id, editForm);
      setShowEditModal(false);
      setSelectedDriver(null);
      await fetchDrivers();
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Driver updated successfully!',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
    } catch (error) {
      console.error('Failed to update driver:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update driver. Please try again.',
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
      {/* Page Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Driver Master</h1>
            <p className="text-zinc-500 mt-1">Manage company drivers and their information</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors duration-300"
          >
            <Plus size={18} />
            <span>Add Driver</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search drivers by name, phone, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">License</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      Loading drivers...
                    </td>
                  </tr>
                ) : filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      No drivers found
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-zinc-900 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <span className="text-black font-semibold text-sm">
                              {driver.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{driver.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Phone size={16} className="text-zinc-500" />
                          <span className="text-zinc-300">{driver.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <FileText size={16} className="text-zinc-500" />
                          <span className="text-zinc-300">{driver.license_number || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {driver.is_active ? (
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
                        {formatDate(driver.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditDriver(driver)}
                            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors duration-200"
                            title="Edit driver"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(driver.id)}
                            className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors duration-200"
                            title="Delete driver"
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
            <div className="text-2xl font-bold text-white">{drivers.length}</div>
            <div className="text-sm text-zinc-500">Total Drivers</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-green-400">{drivers.filter(d => d.is_active).length}</div>
            <div className="text-sm text-zinc-500">Active Drivers</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-blue-400">{drivers.filter(d => !d.is_active).length}</div>
            <div className="text-sm text-zinc-500">Inactive Drivers</div>
          </div>
        </div>
      </div>

      {/* Create Driver Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New Driver</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-4">
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
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  License Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    value={createForm.license_number}
                    onChange={(e) => setCreateForm({ ...createForm, license_number: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                    placeholder="Enter license number (optional)"
                  />
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
                      <span>Create Driver</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Driver</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateDriver} className="space-y-4">
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
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  License Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    value={editForm.license_number}
                    onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                    placeholder="Enter license number (optional)"
                  />
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
    </DashboardLayout>
  );
}
