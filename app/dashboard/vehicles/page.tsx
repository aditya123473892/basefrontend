'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SearchBar from '@/components/common/SearchBar';
import PermissionGuard from '@/components/security/PermissionGuard';
import { usePermission } from '@/hooks/usePermission';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function VehiclesPage() {
  const { allowed: canCreateVehicles } = usePermission('transport.vehicles', 'create');
  const toast = useToast();

  const handleAddVehicle = () => {
    toast.info('Coming Soon', 'Vehicle management form will be available soon');
  };

  return (
    <DashboardLayout>
      <PermissionGuard moduleKey="transport.vehicles" action="read">
        <div className="p-6">
          <PageHeader
            title="Vehicle Master"
            subtitle="Manage vehicles"
            action={
              canCreateVehicles
                ? {
                    label: 'Add Vehicle',
                    onClick: handleAddVehicle,
                    icon: Plus,
                  }
                : undefined
            }
          />

          <SearchBar
            value=""
            onChange={() => {}}
            placeholder="Search vehicles..."
          />

          <LoadingSpinner text="Loading vehicles..." />
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}
