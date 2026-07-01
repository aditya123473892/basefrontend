'use client';

import { useState, ReactNode } from 'react';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import SidebarMenu from './SidebarMenu';
import { useRbac } from '@/lib/rbac';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarMenus } = useRbac();

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-slate-200 backdrop-blur-sm bg-opacity-95">
        <div className="px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 group"
              >
                {sidebarOpen ? (
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu size={20} className="group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>
              <h1 className="text-xl font-bold hidden md:block tracking-tight text-slate-900">
                Team <span className="text-emerald-600">eLogisol</span>
              </h1>
            </div>

            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <div className="relative group">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-300"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="relative p-2 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 group">
                <Bell size={20} className="group-hover:animate-pulse" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-emerald-50 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-semibold text-sm">
                      {user ? getUserInitials(user.full_name) : 'U'}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`hidden md:block text-slate-500 transition-transform duration-300 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </a>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <aside
        className={`fixed left-0 z-40 h-screen pt-16 transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-slate-200 w-64`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <SidebarMenu items={sidebarMenus} pathname={pathname} />
        </div>
      </aside>

      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {children}
      </main>
    </div>
  );
}
