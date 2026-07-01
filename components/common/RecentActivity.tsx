'use client';

import { useIsAllowed, Permission } from '@/components/common/RBACGate';

export interface ActivityItemData {
  id: string;
  action: string;
  details: string;
  time: string;
  /** Gate this single row behind RBAC (e.g. financial activity hidden from non-finance roles). */
  permission?: Permission;
}

interface RecentActivityProps {
  title?: string;
  activities: ActivityItemData[];
  /** Gate the entire section. Omit to always show it (rows can still self-gate). */
  permission?: Permission;
  animationDelay?: number;
}

function ActivityRow({ action, details, time, permission }: ActivityItemData) {
  const allowed = useIsAllowed(permission);
  if (!allowed) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-sm transition-all duration-300 group cursor-pointer">
      <div className="flex-1">
        <p className="font-semibold text-slate-900 group-hover:translate-x-2 transition-transform duration-300">
          {action}
        </p>
        <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors duration-300">
          {details}
        </p>
      </div>
      <span className="text-xs text-slate-400 group-hover:text-emerald-600 transition-colors duration-300 ml-4">
        {time}
      </span>
    </div>
  );
}

/**
 * Importable activity feed. Drop it on the dashboard, a vehicle detail page,
 * a driver profile — pass whatever activity list is relevant. The whole
 * section can be gated with `permission`, and individual rows can carry
 * their own `permission` too (e.g. hide billing-related rows from ops staff
 * even if they can see the rest of the feed).
 */
export function RecentActivity({
  title = 'Recent Activity',
  activities,
  permission,
  animationDelay = 0,
}: RecentActivityProps) {
  const allowed = useIsAllowed(permission);
  if (!allowed) return null;

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-6 hover:border-emerald-300 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <h3 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">{title}</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <ActivityRow key={activity.id} {...activity} />
        ))}
      </div>
    </div>
  );
}