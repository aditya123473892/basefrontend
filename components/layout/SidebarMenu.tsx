'use client';

import Link from 'next/link';
import {
  BarChart3,
  CreditCard,
  FileText,
  Folder,
  LucideIcon,
  Shield,
  Users,
  Wallet,
} from 'lucide-react';
import { SidebarMenuItem } from '@/types/navigation';

const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  CreditCard,
  FileText,
  Shield,
  Users,
  Wallet,
};

function getIcon(iconKey: string | null): LucideIcon {
  return iconKey ? ICONS[iconKey] || Folder : Folder;
}

interface SidebarMenuProps {
  items: SidebarMenuItem[];
  pathname: string;
}

export default function SidebarMenu({ items, pathname }: SidebarMenuProps) {
  return (
    <ul className="space-y-2 font-medium mt-4">
      {items.map((item) => (
        <SidebarMenuNode key={item.id} item={item} pathname={pathname} depth={0} />
      ))}
    </ul>
  );
}

function SidebarMenuNode({ item, pathname, depth }: { item: SidebarMenuItem; pathname: string; depth: number }) {
  const Icon = getIcon(item.iconKey);
  const active = item.path ? pathname === item.path || pathname.startsWith(`${item.path}/`) : false;
  const hasChildren = item.children.length > 0;
  const content = (
    <button
      className={`flex items-center w-full p-3 rounded-lg transition-all duration-300 group ${
        active
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
      }`}
      style={{ paddingLeft: `${12 + depth * 14}px` }}
    >
      <Icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
      <span className="ml-3 flex-1 text-left">{item.label}</span>
    </button>
  );

  return (
    <li>
      {item.path ? <Link href={item.path}>{content}</Link> : content}
      {hasChildren && (
        <ul className="mt-1 space-y-1">
          {item.children.map((child) => (
            <SidebarMenuNode key={child.id} item={child} pathname={pathname} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
