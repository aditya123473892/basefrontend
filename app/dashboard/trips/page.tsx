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
  Truck,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Route,
  Clock
} from 'lucide-react';
import { Trip, CreateTripData, UpdateTripData } from '@/types/trip';
import { tripService } from '@/services/tripService';
import AlertModal from '@/components/ui/AlertModal';

// Mock data for dropdowns until services are implemented
const mockVehicles = [
  { id: '1', vehicle_number: 'MH-12-AB-1234', type: 'Truck' },
  { id: '2', vehicle_number: 'DL-08-CD-5678', type: 'Container Truck' },
  { id: '3', vehicle_number: 'GJ-01-XY-9012', type: 'Flatbed Truck' }
];

const mockDrivers = [
  { id: '1', full_name: 'Rajesh Kumar', phone: '+91-9876543210' },
  { id: '2', full_name: 'Amit Singh', phone: '+91-9876543211' },
  { id: '3', full_name: 'Vijay Patel', phone: '+91-9876543212' }
];

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateTripData>({
    vehicle_id: '',
    driver_id: '',
    source: '',
    destination: '',
    start_date: '',
    end_date: '',
    status: 'planned',
    total_distance_km: 0,
    freight_amount: 0,
    metadata: ''
  });
  const [editForm, setEditForm] = useState<UpdateTripData>({
    vehicle_id: '',
    driver_id: '',
    source: '',
    destination: '',
    start_date: '',
    end_date: '',
    status: 'planned',
    total_distance_km: 0,
    freight_amount: 0,
    metadata: ''
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
                         trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.status.toLowerCase().includes(searchTerm.toLowerCase());
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
        return 'text-green-400 bg-green-400/10';
      case 'in_progress':
        return 'text-blue-400 bg-blue-400/10';
      case 'planned':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-zinc-400 bg-zinc-400/10';
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setEditForm({
      vehicle_id: trip.vehicle_id,
      driver_id: trip.driver_id,
      source: trip.source,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date || '',
      status: trip.status,
      total_distance_km: trip.total_distance_km || 0,
      freight_amount: trip.freight_amount || 0,
      metadata: trip.metadata || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteTrip = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    setAlertModal({
      isOpen: true,
      type: 'confirm',
      title: 'Delete Trip',
      message: `Are you sure you want to delete the trip from ${trip.source} to ${trip.destination}? This action cannot be undone.`,
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
    if (!createForm.vehicle_id || !createForm.driver_id || !createForm.source || !createForm.destination || !createForm.start_date) {
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
        status: 'planned',
        total_distance_km: 0,
        freight_amount: 0,
        metadata: ''
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
      {/* Page Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trip Management</h1>
            <p className="text-zinc-500 mt-1">Manage and track all company trips</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors duration-300"
          >
            <Plus size={18} />
            <span>Create Trip</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search trips by source, destination, or status..."
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Distance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Freight</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">
                      Loading trips...
                    </td>
                  </tr>
                ) : filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">
                      No trips found
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-zinc-900 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <Route className="text-white" size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-white">{trip.source} → {trip.destination}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Truck size={16} className="text-zinc-500" />
                          <span className="text-zinc-300">{mockVehicles.find(v => v.id === trip.vehicle_id)?.vehicle_number || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User size={16} className="text-zinc-500" />
                          <span className="text-zinc-300">{mockDrivers.find(d => d.id === trip.driver_id)?.full_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(trip.status)}`}>
                          {trip.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-zinc-500" />
                          <span className="text-zinc-300">{formatDate(trip.start_date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {trip.total_distance_km ? `${trip.total_distance_km} km` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {trip.freight_amount ? `₹${trip.freight_amount.toLocaleString()}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditTrip(trip)}
                            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors duration-200"
                            title="Edit trip"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip.id)}
                            className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors duration-200"
                            title="Delete trip"
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
            <div className="text-2xl font-bold text-white">{trips.length}</div>
            <div className="text-sm text-zinc-500">Total Trips</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-blue-400">{trips.filter(t => t.status === 'in_progress').length}</div>
            <div className="text-sm text-zinc-500">Active Trips</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-green-400">{trips.filter(t => t.status === 'completed').length}</div>
            <div className="text-sm text-zinc-500">Completed Trips</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex-1">
            <div className="text-2xl font-bold text-yellow-400">{trips.filter(t => t.status === 'planned').length}</div>
            <div className="text-sm text-zinc-500">Planned Trips</div>
          </div>
        </div>
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create New Trip</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Vehicle *
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <select
                      value={createForm.vehicle_id}
                      onChange={(e) => setCreateForm({ ...createForm, vehicle_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {mockVehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicle_number} ({vehicle.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Driver *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <select
                      value={createForm.driver_id}
                      onChange={(e) => setCreateForm({ ...createForm, driver_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      required
                    >
                      <option value="">Select Driver</option>
                      {mockDrivers.map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Source *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="text"
                      value={createForm.source}
                      onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      placeholder="Enter source location"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Destination *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="text"
                      value={createForm.destination}
                      onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      placeholder="Enter destination location"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="date"
                      value={createForm.start_date}
                      onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="date"
                      value={createForm.end_date}
                      onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Distance (km)
                  </label>
                  <div className="relative">
                    <Route className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="number"
                      value={createForm.total_distance_km}
                      onChange={(e) => setCreateForm({ ...createForm, total_distance_km: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Freight Amount (₹)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="number"
                      value={createForm.freight_amount}
                      onChange={(e) => setCreateForm({ ...createForm, freight_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={createForm.metadata}
                  onChange={(e) => setCreateForm({ ...createForm, metadata: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                  placeholder="Additional notes or metadata..."
                  rows={3}
                />
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
                      <span>Create Trip</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Trip Modal - Similar to Create Modal */}
      {showEditModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Trip</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateTrip} className="space-y-4">
              {/* Same form fields as create modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Vehicle *
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <select
                      value={editForm.vehicle_id}
                      onChange={(e) => setEditForm({ ...editForm, vehicle_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {mockVehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.vehicle_number} ({vehicle.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Driver *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <select
                      value={editForm.driver_id}
                      onChange={(e) => setEditForm({ ...editForm, driver_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      required
                    >
                      <option value="">Select Driver</option>
                      {mockDrivers.map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Source *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="text"
                      value={editForm.source}
                      onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      placeholder="Enter source location"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Destination *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="text"
                      value={editForm.destination}
                      onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      placeholder="Enter destination location"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="date"
                      value={editForm.start_date}
                      onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="date"
                      value={editForm.end_date}
                      onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Distance (km)
                  </label>
                  <div className="relative">
                    <Route className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="number"
                      value={editForm.total_distance_km}
                      onChange={(e) => setEditForm({ ...editForm, total_distance_km: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Freight Amount (₹)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="number"
                      value={editForm.freight_amount}
                      onChange={(e) => setEditForm({ ...editForm, freight_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={editForm.metadata}
                  onChange={(e) => setEditForm({ ...editForm, metadata: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all duration-300"
                  placeholder="Additional notes or metadata..."
                  rows={3}
                />
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
