"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  CalendarIcon, 
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

export default function Header({ title }: { title: string }) {
  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          
          <div className="ml-8 hidden md:flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button className="px-4 py-1.5 text-sm font-medium rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm">
              Board
            </button>
            <button className="px-4 py-1.5 text-sm font-medium rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/50 dark:hover:text-white dark:hover:bg-slate-600/50">
              Timeline
            </button>
            <button className="px-4 py-1.5 text-sm font-medium rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-white/50 dark:hover:text-white dark:hover:bg-slate-600/50">
              Calendar
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors">
            <CalendarIcon className="h-5 w-5" />
          </button>
          
          <button className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors">
            <QuestionMarkCircleIcon className="h-5 w-5" />
          </button>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="input pl-10 pr-3 py-2 w-64"
              placeholder="Search tasks, projects..."
            />
          </div>
          
          <div className="relative">
            <button type="button" className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              <BellIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 