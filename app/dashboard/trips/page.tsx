'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Edit, Trash2, X, Save, MapPin, Calendar, Truck } from 'lucide-react';
import { Trip, CreateTripData, UpdateTripData } from '@/types/trip';
import { tripService } from '@/services/tripService';
import AlertModal from '@/components/ui/AlertModal';
import PermissionGuard from '@/components/security/PermissionGuard';
import { usePermission } from '@/hooks/usePermission';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SearchBar from '@/components/common/SearchBar';
import ActionButtons from '@/components/common/ActionButtons';
import { FormInput, FormSelect, FormButton } from '@/components/forms/FormElements';

export default function TripMasterPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const { allowed: canCreateTrips } = usePermission('transport.trips', 'create');
  const { allowed: canUpdateTrips } = usePermission('transport.trips', 'update');
  const { allowed: canDeleteTrips } = usePermission('transport.trips', 'delete');

  const [createForm, setCreateForm] = useState<CreateTripData>({
    vehicle_id: '',
    driver_id: '',
    source: '',
    destination: '',
    start_date: '',
    end_date: '',
    status: 'planned'
  });
  const [editForm, setEditForm] = useState<UpdateTripData>({
    vehicle_id: '',
    driver_id: '',
    source: '',
    destination: '',
    start_date: '',
    end_date: '',
    status: 'planned'
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

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const tripData = await tripService.getAllTrips();
      setTrips(tripData);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planned':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setEditForm({
      vehicle_id: trip.vehicle_id || '',
      driver_id: trip.driver_id || '',
      source: trip.source,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date || '',
      status: trip.status
    });
    setShowEditModal(true);
  };

  const handleDeleteTrip = async (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Trip',
      message: `Are you sure you want to delete ${trip.source} to ${trip.destination}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await tripService.deleteTrip(tripId);
          await fetchTrips();
          setAlertModal({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'Trip deleted successfully!',
            onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
            confirmText: 'OK',
            showCancel: false
          });
        } catch (error) {
          console.error('Failed to delete trip:', error);
          setAlertModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete trip. Please try again.',
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

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.source || !createForm.destination) {
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
      await tripService.createTrip(createForm);
      setShowCreateModal(false);
      setCreateForm({
        vehicle_id: '',
        driver_id: '',
        source: '',
        destination: '',
        start_date: '',
        end_date: '',
        status: 'planned'
      });
      await fetchTrips();
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Trip created successfully!',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
    } catch (error) {
      console.error('Failed to create trip:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to create trip. Please try again.',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    setFormLoading(true);
    try {
      await tripService.updateTrip(selectedTrip.id, editForm);
      setShowEditModal(false);
      setSelectedTrip(null);
      await fetchTrips();
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Trip updated successfully!',
        onConfirm: () => setAlertModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'OK',
        showCancel: false
      });
    } catch (error) {
      console.error('Failed to update trip:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update trip. Please try again.',
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
      <PermissionGuard moduleKey="transport.trips" action="read">
        <div className="p-6">
          <PageHeader
            title="Trip Management"
            subtitle="Manage trips and routes"
            action={
              canCreateTrips
                ? {
                    label: 'Add Trip',
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
              placeholder="Search trips by name, origin, or destination..."
            />
          </div>

          {/* Table */}
          {loading ? (
            <LoadingSpinner text="Loading trips..." />
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trip</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTrips.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No trips found
                        </td>
                      </tr>
                    ) : (
                      filteredTrips.map((trip) => (
                        <tr key={trip.id} className="hover:bg-emerald-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <Truck size={20} className="text-emerald-700" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{trip.source} → {trip.destination}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <span>{trip.source}</span>
                              <span>→</span>
                              <span>{trip.destination}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(trip.start_date)} {trip.end_date && `- ${formatDate(trip.end_date)}`}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(trip.status)}`}>
                              {trip.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <ActionButtons
                              actions={[
                                canUpdateTrips && {
                                  icon: Edit,
                                  onClick: () => handleEditTrip(trip),
                                  title: 'Edit trip',
                                },
                                canDeleteTrips && {
                                  icon: Trash2,
                                  onClick: () => handleDeleteTrip(trip.id),
                                  title: 'Delete trip',
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
              <div className="text-2xl font-bold text-slate-900">{trips.length}</div>
              <div className="text-sm text-slate-500">Total Trips</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1">
              <div className="text-2xl font-bold text-emerald-700">{trips.filter(t => t.status === 'in_progress').length}</div>
              <div className="text-sm text-slate-500">In Progress</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1">
              <div className="text-2xl font-bold text-slate-700">{trips.filter(t => t.status === 'planned').length}</div>
              <div className="text-sm text-slate-500">Planned</div>
            </div>
          </div>
        </div>

        {/* Create Trip Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Create New Trip</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTrip} className="space-y-4">
                <FormInput
                  label="Source"
                  icon={MapPin}
                  value={createForm.source}
                  onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                  placeholder="From"
                  required
                />
                <FormInput
                  label="Destination"
                  icon={MapPin}
                  value={createForm.destination}
                  onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                  placeholder="To"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Start Date"
                    type="date"
                    value={createForm.start_date}
                    onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                    required
                  />
                  <FormInput
                    label="End Date"
                    type="date"
                    value={createForm.end_date}
                    onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                  />
                </div>

                <FormSelect
                  label="Status"
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </FormSelect>

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
                      Create Trip
                    </span>
                  </FormButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Trip Modal */}
        {showEditModal && selectedTrip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Edit Trip</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateTrip} className="space-y-4">
                <FormInput
                  label="Source"
                  icon={MapPin}
                  value={editForm.source}
                  onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                  placeholder="From"
                  required
                />
                <FormInput
                  label="Destination"
                  icon={MapPin}
                  value={editForm.destination}
                  onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                  placeholder="To"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Start Date"
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    required
                  />
                  <FormInput
                    label="End Date"
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                  />
                </div>

                <FormSelect
                  label="Status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </FormSelect>

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
