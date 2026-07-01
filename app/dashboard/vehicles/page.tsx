import DashboardLayout from '@/components/layout/DashboardLayout';

export default function VehiclesPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">Vehicle Master</h1>
        <p className="text-zinc-500 mt-1">Vehicle management will appear here.</p>
      </div>
    </DashboardLayout>
  );
}
