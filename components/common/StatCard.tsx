'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useIsAllowed, Permission } from '@/components/common/RBACGate';

export interface StatCardData {
  id: string;
  title: string;
  value: string;
  icon: LucideIcon;
  /** Optional "x / total" progress bar (e.g. Vehicles Available: 45 / 60). */
  total?: string;
  /** Optional secondary line shown under the value (e.g. "156 invoices"). */
  count?: string;
  trend?: string;
  trendUp?: boolean;
  /** Gate this card behind RBAC. Omit to always show it. */
  permission?: Permission;
}

interface StatCardProps extends Omit<StatCardData, 'id'> {
  animationDelay?: number;
}

/**
 * Single stat tile. Import and drop anywhere — dashboard, a report page, a
 * module's own overview screen — and pass data in. If `permission` is set,
 * the card silently renders nothing for users who lack that module/action,
 * so callers never need to write their own visibility checks.
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  total,
  count,
  trend,
  trendUp,
  permission,
  animationDelay = 0,
}: StatCardProps) {
  const allowed = useIsAllowed(permission);
  if (!allowed) return null;

  const progressPct =
    total && !Number.isNaN(parseInt(value)) && !Number.isNaN(parseInt(total))
      ? (parseInt(value) / parseInt(total)) * 100
      : null;

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-600/10 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 transition-all duration-300">
          <Icon className="text-emerald-600 group-hover:text-white transition-colors duration-300" size={24} />
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            {trendUp ? (
              <TrendingUp size={14} className="text-emerald-600" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            )}
            <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend}
            </span>
          </div>
        )}
      </div>

      <h3 className="text-slate-500 text-sm mb-2 group-hover:text-slate-700 transition-colors duration-300">
        {title}
      </h3>

      <div className="flex items-end space-x-2 mb-3">
        <p className="text-3xl font-bold text-slate-900 group-hover:scale-105 origin-left transition-transform duration-300">
          {value}
        </p>
        {total && <p className="text-slate-400 text-sm mb-1">/ {total}</p>}
      </div>

      {count && <p className="text-slate-400 text-sm -mt-2 mb-1">{count}</p>}

      {progressPct !== null && (
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-emerald-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Lays out a set of StatCardData in the standard responsive grid, applying
 * the staggered fade-in delay automatically. Cards the user isn't permitted
 * to see (per their `permission`) just don't take a grid slot — no manual
 * filtering needed by the page that calls this.
 */
export function StatCardGrid({
  stats,
  startDelay = 0,
}: {
  stats: StatCardData[];
  startDelay?: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={stat.id} {...stat} animationDelay={startDelay + index * 100} />
      ))}
    </div>
  );
}