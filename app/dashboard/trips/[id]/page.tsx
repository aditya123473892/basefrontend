import DashboardLayout from '@/components/layout/DashboardLayout';
import PermissionGuard from '@/components/security/PermissionGuard';

export default function TripDetailsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard moduleKey="transport.trips" action="read">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">Trip Details</h1>
          <p className="text-zinc-500 mt-1">Trip details will appear here.</p>
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}
