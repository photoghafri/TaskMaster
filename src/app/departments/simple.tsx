"use client";

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function SimpleDepartmentsPage() {
  // Static departments data
  const departments = [
    {
      id: '1',
      name: 'AOCC',
      description: 'Airport Operations Control Center',
      budget: 450000,
      memberCount: 18,
      projectCount: 7,
      totalBudget: 450000
    },
    {
      id: '2',
      name: 'AOPS',
      description: 'Airport Operations',
      budget: 320000,
      memberCount: 12,
      projectCount: 5,
      totalBudget: 320000
    },
    {
      id: '3',
      name: 'BHS',
      description: 'Baggage Handling System',
      budget: 180000,
      memberCount: 8,
      projectCount: 4,
      totalBudget: 180000
    },
    {
      id: '4',
      name: 'Commercial',
      description: 'Commercial Operations',
      budget: 380000,
      memberCount: 15,
      projectCount: 6,
      totalBudget: 380000
    },
    {
      id: '5',
      name: 'Fire',
      description: 'Fire Safety Department',
      budget: 150000,
      memberCount: 6,
      projectCount: 3,
      totalBudget: 150000
    },
    {
      id: '6',
      name: 'FM',
      description: 'Facility Management',
      budget: 120000,
      memberCount: 5,
      projectCount: 2,
      totalBudget: 120000
    },
    {
      id: '7',
      name: 'HSE',
      description: 'Health, Safety, and Environment',
      budget: 200000,
      memberCount: 7,
      projectCount: 4,
      totalBudget: 200000
    },
    {
      id: '8',
      name: 'OPD',
      description: 'Operations Planning and Development',
      budget: 280000,
      memberCount: 10,
      projectCount: 5,
      totalBudget: 280000
    },
    {
      id: '9',
      name: 'Security',
      description: 'Airport Security',
      budget: 350000,
      memberCount: 14,
      projectCount: 6,
      totalBudget: 350000
    },
    {
      id: '10',
      name: 'TOPS',
      description: 'Terminal Operations',
      budget: 420000,
      memberCount: 16,
      projectCount: 7,
      totalBudget: 420000
    }
  ];

  // Department colors based on name (for consistency)
  const getDepartmentColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-amber-500 to-amber-600',
      'from-emerald-500 to-emerald-600',
      'from-rose-500 to-rose-600',
      'from-indigo-500 to-indigo-600',
      'from-green-500 to-green-600',
      'from-red-500 to-red-600',
      'from-sky-500 to-sky-600',
    ];
    
    // Create a simple hash from the department name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <AppLayout title="Departments">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">All Departments</h2>
            <p className="text-sm text-slate-500 mt-1">Showing {departments.length} departments</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className={`h-3 w-full bg-gradient-to-r ${getDepartmentColor(dept.name)} rounded-t-xl`}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{dept.name}</h3>
                </div>
                
                {dept.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{dept.description}</p>
                )}
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <UserGroupIcon className="h-4 w-4 text-slate-400 mr-1" />
                      <span className="text-sm font-medium text-slate-900">{dept.memberCount}</span>
                    </div>
                    <p className="text-xs text-slate-500">Members</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DocumentTextIcon className="h-4 w-4 text-slate-400 mr-1" />
                      <span className="text-sm font-medium text-slate-900">{dept.projectCount}</span>
                    </div>
                    <p className="text-xs text-slate-500">Projects</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CurrencyDollarIcon className="h-4 w-4 text-slate-400 mr-1" />
                      <span className="text-sm font-medium text-slate-900">{dept.totalBudget.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-500">Budget (OMR)</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
} 