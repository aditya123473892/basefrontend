'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
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
  // Auto-expand any branch that contains the active route
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const walk = (nodes: SidebarMenuItem[]): boolean => {
      let found = false;
      for (const node of nodes) {
        const selfActive = node.path ? pathname.startsWith(node.path) : false;
        const childActive = node.children.length > 0 ? walk(node.children) : false;
        if (selfActive || childActive) {
          if (node.children.length > 0) initial.add(node.id);
          found = true;
        }
      }
      return found;
    };
    walk(items);
    return initial;
  });

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ul className="space-y-0.5 font-medium mt-4">
      {items.map((item) => (
        <SidebarMenuNode
          key={item.id}
          item={item}
          pathname={pathname}
          depth={0}
          expanded={expanded}
          toggle={toggle}
        />
      ))}
    </ul>
  );
}

interface NodeProps {
  item: SidebarMenuItem;
  pathname: string;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
}

function SidebarMenuNode({ item, pathname, depth, expanded, toggle }: NodeProps) {
  const Icon = getIcon(item.iconKey);
  const active = item.path
    ? pathname === item.path || pathname.startsWith(`${item.path}/`)
    : false;
  const hasChildren = item.children.length > 0;
  const isOpen = expanded.has(item.id);

  const row = (
    <div
      role={hasChildren ? 'button' : undefined}
      tabIndex={hasChildren ? 0 : undefined}
      onClick={hasChildren ? () => toggle(item.id) : undefined}
      onKeyDown={
        hasChildren
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(item.id);
              }
            }
          : undefined
      }
      className={`group flex items-center w-full gap-2 rounded-lg p-3 transition-colors duration-200 cursor-pointer select-none ${
        active
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
          : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
      }`}
      style={{ paddingLeft: `${12 + depth * 14}px` }}
    >
      <Icon
        size={20}
        className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
      />
      <span className="flex-1 text-left truncate">{item.label}</span>
      {hasChildren && (
        <ChevronRight
          size={16}
          className={`flex-shrink-0 text-current opacity-60 transition-transform duration-300 ease-out ${
            isOpen ? 'rotate-90' : 'rotate-0'
          }`}
        />
      )}
    </div>
  );

  return (
    <li>
      {item.path && !hasChildren ? (
        <Link href={item.path}>{row}</Link>
      ) : (
        row
      )}

      {hasChildren && (
        // grid-rows trick: animates to the content's real height (no fixed max-height guess),
        // and doesn't require JS-measured heights.
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <ul
              className={`mt-0.5 space-y-0.5 pl-3 border-l border-slate-200 ml-[22px] transition-opacity duration-200 ${
                isOpen ? 'opacity-100 delay-100' : 'opacity-0'
              }`}
            >
              {item.children.map((child) => (
                <SidebarMenuNode
                  key={child.id}
                  item={child}
                  pathname={pathname}
                  depth={depth + 1}
                  expanded={expanded}
                  toggle={toggle}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}