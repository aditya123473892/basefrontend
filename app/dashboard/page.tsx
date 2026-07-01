'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { StatCardGrid, StatCardData } from '@/components/common/StatCard';
import { RecentActivity, ActivityItemData } from '@/components/common/RecentActivity';
import {
  TrendingUp,
  FileWarning,
  Car,
  Truck,
  Users,
  MapPin,
  FileText,
  DollarSign,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Page-level data. Each card/row is plain config, optionally carrying a
// `permission`. Visibility is handled entirely inside StatCardGrid /
// RecentActivity — this page never has to know who's allowed to see what.
// ---------------------------------------------------------------------------

const fleetStats: StatCardData[] = [
  {
    id: 'vehicles-available',
    title: 'Vehicles Available',
    value: '45',
    total: '60',
    icon: Car,
    trend: '+5%',
    trendUp: true,
    permission: { module: 'transport.vehicles', action: 'read' },
  },
  {
    id: 'vehicles-in-use',
    title: 'Vehicles In Use',
    value: '15',
    total: '60',
    icon: Truck,
    trend: '-2%',
    trendUp: false,
    permission: { module: 'transport.vehicles', action: 'read' },
  },
  {
    id: 'drivers-available',
    title: 'Drivers Available',
    value: '32',
    total: '50',
    icon: Users,
    trend: '+8%',
    trendUp: true,
    permission: { module: 'transport.drivers', action: 'read' },
  },
  {
    id: 'drivers-on-trip',
    title: 'Drivers On Trip',
    value: '18',
    total: '50',
    icon: MapPin,
    trend: '+3%',
    trendUp: true,
    permission: { module: 'transport.trips', action: 'read' },
  },
];

const financialStats: StatCardData[] = [
  {
    id: 'invoices-today',
    title: 'Invoices Today',
    value: '₹2,45,000',
    count: '12 invoices',
    icon: FileText,
    permission: { module: 'finance.reports', action: 'read' },
  },
  {
    id: 'invoices-month',
    title: 'Invoices This Month',
    value: '₹45,67,800',
    count: '156 invoices',
    icon: TrendingUp,
    permission: { module: 'finance.reports', action: 'read' },
  },
  {
    id: 'pending-gst',
    title: 'Pending GST Invoices',
    value: '23',
    count: '₹8,45,200',
    icon: FileWarning,
    permission: { module: 'finance.reports', action: 'read' },
  },
  {
    id: 'paid-vs-unpaid',
    title: 'Paid vs Unpaid',
    value: '₹32.5L / ₹13.2L',
    count: '71% collected',
    icon: DollarSign,
    permission: { module: 'finance.reports', action: 'read' },
  },
];

const activities: ActivityItemData[] = [
  {
    id: 'act-1',
    action: 'New trip started',
    details: 'Vehicle MH-12-AB-1234 • Driver: Rajesh Kumar',
    time: '5 min ago',
    permission: { module: 'transport.trips', action: 'read' },
  },
  {
    id: 'act-2',
    action: 'Invoice generated',
    details: 'INV-2024-0156 • ₹45,200',
    time: '12 min ago',
    permission: { module: 'finance.reports', action: 'read' },
  },
  {
    id: 'act-3',
    action: 'Vehicle maintenance due',
    details: 'Vehicle GJ-01-XY-5678',
    time: '1 hour ago',
    permission: { module: 'transport.vehicles', action: 'read' },
  },
  {
    id: 'act-4',
    action: 'Trip completed',
    details: 'Vehicle DL-08-CD-9012 • Distance: 245 km',
    time: '2 hours ago',
    permission: { module: 'transport.trips', action: 'read' },
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
        {/* Page Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-900">
            Welcome back,{' '}
            <span className="text-emerald-600">
              {user && user.full_name ? user.full_name.split(' ')[0] : 'User'}
            </span>
          </h2>
          <p className="text-slate-500">Here&apos;s your fleet overview and real-time analytics</p>
        </div>

        {/* Stats Grid - Vehicles & Drivers */}
        <StatCardGrid stats={fleetStats} startDelay={0} />

        {/* Financial Stats Grid */}
        <StatCardGrid stats={financialStats} startDelay={400} />

        {/* Recent Activity */}
        <RecentActivity activities={activities} animationDelay={800} />
      </div>
    </DashboardLayout>
  );
}
