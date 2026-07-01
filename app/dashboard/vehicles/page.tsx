'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import SearchBar from '@/components/common/SearchBar';
import PermissionGuard from '@/components/security/PermissionGuard';
import { usePermission } from '@/hooks/usePermission';
import { Plus } from 'lucide-react';

export default function VehiclesPage() {
  const { allowed: canCreateVehicles } = usePermission('transport.vehicles', 'create');

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
                    onClick: () => alert('Vehicle form coming soon'),
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
