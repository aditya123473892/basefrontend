'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  Folder,
  LucideIcon,
  Route,
  Shield,
  Truck,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { SidebarMenuItem } from '@/types/navigation';

const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  CreditCard,
  FileText,
  Route,
  Shield,
  Truck,
  User,
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ul className="space-y-1 font-medium mt-4">
      {items.map((item) => (
        <SidebarMenuNode key={item.id} item={item} pathname={pathname} depth={0} expanded={expanded} toggle={toggle} />
      ))}
    </ul>
  );
}

function SidebarMenuNode({
  item,
  pathname,
  depth,
  expanded,
  toggle,
}: { item: SidebarMenuItem; pathname: string; depth: number; expanded: Set<string>; toggle: (id: string) => void }) {
  const Icon = getIcon(item.iconKey);
  const active = item.path ? pathname === item.path || pathname.startsWith(`${item.path}/`) : false;
  const hasChildren = item.children.length > 0;
  const isOpen = expanded.has(item.id);

  const content = (
    <div
      className={`flex items-center w-full p-3 rounded-lg transition-all duration-300 group ${
        active
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
      }`}
      style={{ paddingLeft: `${12 + depth * 14}px` }}
    >
      {hasChildren && (
        <button
          type="button"
          onClick={() => toggle(item.id)}
          className="mr-1 text-slate-400 hover:text-slate-600"
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      )}
      <Icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
      <span className="ml-2 flex-1 text-left">{item.label}</span>
    </div>
  );

  return (
    <li>
      {item.path && !hasChildren ? <Link href={item.path}>{content}</Link> : content}
      {hasChildren && isOpen && (
        <ul className="mt-1 space-y-1">
          {item.children.map((child) => (
            <SidebarMenuNode key={child.id} item={child} pathname={pathname} depth={depth + 1} expanded={expanded} toggle={toggle} />
          ))}
        </ul>
      )}
    </li>
  );
}
