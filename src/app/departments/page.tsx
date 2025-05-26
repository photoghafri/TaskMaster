"use client";

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { DepartmentWithStats } from '@/services/departmentService';
import { formatDate } from '@/utils/dateUtils';
import AuthWrapper from '@/components/AuthWrapper';

interface DepartmentFormData {
  id?: string;
  name: string;
  description: string;
  budget: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    budget: ''
  });
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // For demo purposes, always allow admin functions
  const isAdmin = true;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);

      console.log('Fetching departments...');
      const response = await fetch('/api/departments');

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        setDebugInfo(`API Error ${response.status}: ${errorText}`);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Departments data:', data);
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      setError('Failed to load departments. Please try again later.');
      // Fallback mock data
      setDepartments([
        {
          id: 'mock-1',
          name: 'AOCC',
          description: 'Airport Operations Control Center',
          budget: 450000,
          memberCount: 18,
          projectCount: 7,
          totalBudget: 450000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'mock-2',
          name: 'AOPS',
          description: 'Airport Operations',
          budget: 320000,
          memberCount: 12,
          projectCount: 5,
          totalBudget: 320000,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'mock-3',
          name: 'BHS',
          description: 'Baggage Handling System',
          budget: 180000,
          memberCount: 8,
          projectCount: 4,
          totalBudget: 180000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = isEditing ? '/api/departments' : '/api/departments';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save department');
      }

      await fetchDepartments();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      alert(error.message || 'An error occurred while saving the department');
    }
  };

  const handleEdit = (dept: DepartmentWithStats) => {
    setFormData({
      id: dept.id,
      name: dept.name,
      description: dept.description || '',
      budget: dept.budget ? dept.budget.toString() : ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const response = await fetch(`/api/departments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete department');
      }

      await fetchDepartments();
    } catch (error: any) {
      alert(error.message || 'An error occurred while deleting the department');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      budget: ''
    });
    setIsEditing(false);
  };

  // Department colors based on name (for consistency)
  const getDepartmentColor = (name: string) => {
    // Map of department names to specific colors for consistency
    const departmentColors: { [key: string]: string } = {
      'AOCC': 'from-blue-600 to-blue-700',
      'AOPS': 'from-yellow-600 to-yellow-700',
      'BHS': 'from-purple-600 to-purple-700',
      'Commercial': 'from-pink-600 to-pink-700',
      'Fire': 'from-red-600 to-red-700',
      'IT': 'from-amber-600 to-amber-700',
      'Security': 'from-indigo-600 to-indigo-700',
      'TOPS': 'from-emerald-600 to-emerald-700',
      'Facilities': 'from-green-600 to-green-700',
      'FM': 'from-orange-600 to-orange-700',
      'PMO': 'from-teal-600 to-teal-700',
      'Operations': 'from-cyan-600 to-cyan-700',
      'Finance': 'from-lime-600 to-lime-700',
      'HR': 'from-rose-600 to-rose-700',
      'Engineering': 'from-sky-600 to-sky-700',
      'Safety': 'from-slate-600 to-slate-700'
    };

    // If department has a predefined color, use it
    if (departmentColors[name]) {
      return departmentColors[name];
    }

    // Fallback for departments not in the list - create deterministic color
    const distinctColors = [
      'from-blue-600 to-blue-700',
      'from-indigo-600 to-indigo-700',
      'from-purple-600 to-purple-700',
      'from-pink-600 to-pink-700',
      'from-red-600 to-red-700',
      'from-amber-600 to-amber-700',
      'from-yellow-600 to-yellow-700',
      'from-emerald-600 to-emerald-700',
      'from-green-600 to-green-700',
      'from-teal-600 to-teal-700',
      'from-cyan-600 to-cyan-700',
      'from-orange-600 to-orange-700',
      'from-rose-600 to-rose-700',
      'from-lime-600 to-lime-700',
      'from-sky-600 to-sky-700'
    ];

    // Create a hash from the department name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return distinctColors[hash % distinctColors.length];
  };

  // Debug function to log date object type
  const debugDate = (date: any) => {
    if (process.env.NODE_ENV !== 'development') return null;

    console.log('Date object:', date);
    console.log('Type:', typeof date);
    console.log('Is Date instance:', date instanceof Date);
    console.log('Has toDate method:', date && typeof date === 'object' && 'toDate' in date);
    console.log('Has seconds property:', date && typeof date === 'object' && 'seconds' in date);

    if (date && typeof date === 'object') {
      console.log('Object keys:', Object.keys(date));
      console.log('Object prototype:', Object.getPrototypeOf(date));
    }

    return null;
  };

  return (
    <AuthWrapper>
      <AppLayout title="">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Departments
              </h1>
              <p className="text-slate-600 flex items-center space-x-2">
                <UserGroupIcon className="h-4 w-4" />
                <span>Manage departments and their budget allocations</span>
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Department
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 rounded-full animate-spin"></div>
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full mr-4">
                  <XMarkIcon className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Error Loading Departments</h3>
                  <p className="text-slate-600">{error}</p>
                  {debugInfo && (
                    <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto max-h-32">
                      {debugInfo}
                    </pre>
                  )}
                </div>
              </div>
              <button
                onClick={fetchDepartments}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : departments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-12 text-center">
              <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <UserGroupIcon className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">No Departments Found</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Create your first department to start organizing your team and projects.
              </p>
              {isAdmin && (
                <button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create First Department</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {departments.map((dept) => (
                <div key={dept.id} className="bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className={`h-2 w-full bg-gradient-to-r ${getDepartmentColor(dept.name)}`}></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="text-base font-semibold text-slate-900">{dept.name}</h3>
                      {isAdmin && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEdit(dept)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(dept.id)}
                            className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {dept.description && (
                      <p className="text-xs text-slate-600 mb-3 line-clamp-1">{dept.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                      <div className="bg-slate-50 rounded-md p-2">
                        <div className="flex items-center mb-0.5">
                          <DocumentTextIcon className="h-3.5 w-3.5 text-slate-500 mr-1" />
                          <span className="text-xs font-medium text-slate-700">Projects</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{dept.projectCount || 0}</p>
                      </div>

                      <div className="bg-slate-50 rounded-md p-2">
                        <div className="flex items-center mb-0.5">
                          <CurrencyDollarIcon className="h-3.5 w-3.5 text-slate-500 mr-1" />
                          <span className="text-xs font-medium text-slate-700">Budget</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {dept.totalBudget ? `${dept.totalBudget.toLocaleString()} OMR` : '0 OMR'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 text-right">
                      {dept.updatedAt ? (
                        <>
                          {debugDate(dept.updatedAt)}
                          Updated {formatDate(dept.updatedAt, 'datetime')}
                        </>
                      ) : (
                        <>No update date available</>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Department Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {isEditing ? 'Edit Department' : 'Add New Department'}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-slate-500 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                      Department Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2"
                      placeholder="Enter department name"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2"
                      placeholder="Enter department description"
                    />
                  </div>

                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-slate-700 mb-1">
                      Budget (OMR)
                    </label>
                    <input
                      id="budget"
                      name="budget"
                      type="number"
                      step="0.01"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all"
                  >
                    {isEditing ? 'Update Department' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppLayout>
    </AuthWrapper>
  );
}