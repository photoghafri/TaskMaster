"use client";

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import NotificationCenter from './NotificationCenter';
import ThemeToggle from './ThemeToggle';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

// Define the navigation items
const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: ClipboardDocumentListIcon },
  { name: 'Team', href: '/team', icon: UserGroupIcon },
  { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Activity Logs', href: '/logs', icon: ClipboardDocumentListIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'About', href: '/about', icon: InformationCircleIcon },
];

export default function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Toaster position="bottom-right" />
      <div className="flex flex-col h-screen">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <button
                  type="button"
                  className="px-4 border-r border-slate-200 dark:border-slate-700 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex items-center flex-shrink-0 px-4">
                  <Link href="/" className="flex items-center">
                    <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center mr-2 p-1">
                      <img
                        src="https://res.cloudinary.com/daiil8ury/image/upload/v1747259495/x5sdqf4sw2bfl78atskh.png"
                        alt="Oman Airports Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      TaskMaster
                    </span>
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                <ThemeToggle />
                <div className="relative">
                  <button
                    type="button"
                    className="flex max-w-xs items-center rounded-full bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    {session?.user?.image ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={session.user.image}
                        alt="User profile"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {session?.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-slate-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {session?.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {session?.user?.email || 'user@example.com'}
                        </p>
                      </div>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <UserCircleIcon className="mr-2 h-4 w-4" />
                          Your Profile
                        </div>
                      </Link>
                      <button
                        onClick={async () => {
                          try {
                            await signOut({ redirect: false });
                            // Manual redirect after successful signout
                            window.location.href = '/auth/signin';
                          } catch (error) {
                            console.error('Error signing out:', error);
                            // Force redirect if signOut fails
                            window.location.href = '/auth/signin';
                          }
                        }}
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left"
                      >
                        <div className="flex items-center">
                          <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                          Sign out
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex max-w-xs w-full bg-white dark:bg-slate-800">
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center h-16 px-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center mr-2 p-1">
                    <img
                      src="https://res.cloudinary.com/daiil8ury/image/upload/v1747259495/x5sdqf4sw2bfl78atskh.png"
                      alt="Oman Airports Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    TaskMaster
                  </span>
                </div>
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-slate-500" aria-hidden="true" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive(item.href)
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <Sidebar />
          </div>

          {/* Main content */}
          <div className="flex flex-col w-0 flex-1 overflow-hidden">
            <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
              {title && (
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
                </div>
              )}
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}