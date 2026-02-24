'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Target,
  Activity,
  CheckSquare,
  BarChart3,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  Zap,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/opportunities', label: 'Opportunities', icon: Target },
  { href: '/activities', label: 'Activities', icon: Activity },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/reviews', label: 'Weekly Reviews', icon: BarChart3 },
  { href: '/stage-history', label: 'Stage History', icon: History },
];

const founderOnlyItems = [
  { href: '/team', label: 'Team Management', icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!user) return null;

  const allItems = user.role === 'founder'
    ? [...navItems, ...founderOnlyItems]
    : navItems;

  const roleLabel = user.role === 'founder' 
    ? 'Admin' 
    : user.role === 'field_sales' 
    ? 'Field Sales' 
    : 'Inside Sales';

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight whitespace-nowrap">Sales OS</span>
        )}
        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="ml-auto md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {allItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="px-2 mb-3">
            <p className="text-sm font-medium text-gray-200 truncate">{user.name}</p>
            <p className="text-xs text-gray-500">{roleLabel}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#1a1a2e] border border-white/10 rounded-full hidden md:flex items-center justify-center hover:bg-indigo-500 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile sidebar (overlay) */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[260px] bg-[#1a1a2e] text-[#e2e8f0] flex flex-col z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar (fixed) */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#1a1a2e] text-[#e2e8f0] flex-col transition-sidebar z-50 hidden md:flex ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
