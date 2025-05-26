"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  HomeIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';

const mainNavItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: DocumentTextIcon },
  { name: 'Team', href: '/team', icon: UserGroupIcon },
  { name: 'Departments', href: '/departments', icon: BuildingOffice2Icon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Activity Logs', href: '/logs', icon: ClipboardDocumentListIcon },
];

const settingsNavItems = [
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'About', href: '/about', icon: InformationCircleIcon },
];

export default function Sidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      // Manual redirect after successful signout
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force redirect if signOut fails
      window.location.href = '/auth/signin';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return session?.user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div
      className={`
        flex h-screen flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800
        sticky top-0 left-0 min-h-screen transition-all duration-300 ease-in-out ${className}
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center px-4 justify-between border-b border-slate-200 dark:border-slate-800">
        {!collapsed ? (
          <div className="flex-1"></div>
        ) : (
          <div className="flex-1"></div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 z-10 h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 hover:bg-blue-600 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeftIcon className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* New Project Button */}
      <div className="p-4">
        <Link
          href="/projects/new"
          className={`
            w-full btn btn-primary rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-all
            flex items-center justify-center py-2.5
            ${collapsed ? 'px-2' : 'px-4'}
          `}
          title="New Project"
        >
          <PlusIcon className="h-4 w-4" />
          {!collapsed && <span className="ml-2">New Project</span>}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'}`}>
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      group flex items-center ${collapsed ? 'justify-center' : 'justify-start'}
                      gap-x-3 rounded-md px-3 py-2 text-sm font-medium
                      ${isActive
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white"
                      }
                      transition-all
                    `}
                    title={collapsed ? item.name : ''}
                  >
                    <item.icon className={`
                      h-5 w-5 flex-shrink-0
                      ${isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400"
                      }
                    `} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider before settings */}
          <div className={`my-6 ${collapsed ? 'px-2' : 'px-4'}`} aria-hidden="true">
            <div className="h-[1px] w-full rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 opacity-70"></div>
          </div>

          <div>
            {!collapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Settings
              </h3>
            )}
            <ul className="space-y-1">
              {settingsNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center ${collapsed ? 'justify-center' : 'justify-start'}
                        gap-x-3 rounded-md px-3 py-2 text-sm font-medium
                        ${isActive
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white"
                        }
                      `}
                      title={collapsed ? item.name : ''}
                    >
                      <item.icon className={`
                        h-5 w-5 flex-shrink-0
                        ${isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400"
                        }
                      `} />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>

      {/* User Profile */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
          >
            <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                {getUserInitials()}
              </div>
              {!collapsed && (
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {session?.user?.role || 'Member'}
                  </p>
                </div>
              )}
            </div>
            {!collapsed && (
              <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className={`absolute ${collapsed ? 'bottom-full -left-32' : 'bottom-full left-0'} w-48 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50`} ref={dropdownRef}>
              <div className="py-1">
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <UserIcon className="h-4 w-4 mr-3" />
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
