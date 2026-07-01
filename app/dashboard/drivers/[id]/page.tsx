import DashboardLayout from '@/components/layout/DashboardLayout';
import PermissionGuard from '@/components/security/PermissionGuard';

export default function DriverDetailsPage() {
  return (
    <DashboardLayout>
      <PermissionGuard moduleKey="transport.drivers" action="read">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">Driver Details</h1>
          <p className="text-zinc-500 mt-1">Driver profile details will appear here.</p>
        </div>
      </PermissionGuard>
    </DashboardLayout>
  );
}
