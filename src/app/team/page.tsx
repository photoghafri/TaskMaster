"use client";

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import AuthWrapper from '@/components/AuthWrapper';
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChartBarIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  tasks?: { id: string }[];
  projectCount?: number;
  projects?: Array<{
    id: string;
    title: string;
    status: string;
    percentage: number;
  }>;
}

interface TeamMemberFormData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  department?: string;
  departmentId?: string;
}

interface CustomSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

interface Department {
  id: string;
  name: string;
  description?: string;
}

export default function TeamPage() {
  const { data: session } = useSession() as { data: CustomSession | null };
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    department: '',
    departmentId: undefined
  });
  const [isEditing, setIsEditing] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<{[key: string]: boolean}>({});

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchTeamMembers();
    fetchDepartments();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/team');

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setError('Failed to load team members. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing ? '/api/team' : '/api/team';
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
        throw new Error(errorData.error || 'Failed to save team member');
      }

      await fetchTeamMembers();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving team member:', error);
      alert(error.message || 'An error occurred while saving the team member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      const response = await fetch(`/api/team?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team member');
      }

      await fetchTeamMembers();
    } catch (error: any) {
      console.error('Error deleting team member:', error);
      alert(error.message || 'An error occurred while deleting the team member');
    }
  };

  const handleEdit = (member: User) => {
    setFormData({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department || '',
      departmentId: member.departmentId || undefined
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER',
      department: '',
      departmentId: undefined
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const toggleProjectsList = (memberId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  return (
    <AuthWrapper>
      <AppLayout title="">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Team
              </h1>
              <p className="text-slate-600 flex items-center space-x-2">
                <UserGroupIcon className="h-4 w-4" />
                <span>Meet the talented professionals driving our success</span>
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl mb-8">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative px-8 py-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-6 lg:mb-0">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm mr-4">
                      <UserGroupIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span>{teamMembers.length} Active Members</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      <span>{new Set(teamMembers.map(m => m.department).filter(Boolean)).size} Departments</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      <span>{teamMembers.reduce((sum, m) => sum + (m.projectCount || 0), 0)} Active Projects</span>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex-shrink-0">
                    <button
                      className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
                      onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                      }}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Team Member
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-slate-600">Loading team members...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Team</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                onClick={fetchTeamMembers}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Enhanced Team Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-xl mr-4">
                      <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{teamMembers.length}</p>
                      <p className="text-sm text-slate-500">Total Members</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-xl mr-4">
                      <StarIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {teamMembers.filter(m => m.role === 'ADMIN').length}
                      </p>
                      <p className="text-sm text-slate-500">Administrators</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-xl mr-4">
                      <BriefcaseIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {new Set(teamMembers.map(m => m.department).filter(Boolean)).size}
                      </p>
                      <p className="text-sm text-slate-500">Departments</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-xl mr-4">
                      <ChartBarIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {teamMembers.reduce((sum, m) => sum + (m.projectCount || 0), 0)}
                      </p>
                      <p className="text-sm text-slate-500">Active Projects</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members Grid */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60">
                <div className="px-8 py-6 border-b border-slate-200">
                  <p className="text-slate-600 mt-1">Connect with your colleagues and view their project assignments</p>
                </div>
                {teamMembers.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <UserGroupIcon className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Team Members Yet</h3>
                    <p className="text-slate-500 mb-6">Start building your team by adding the first member.</p>
                    {isAdmin && (
                      <button
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        onClick={() => {
                          resetForm();
                          setIsModalOpen(true);
                        }}
                      >
                        Add First Team Member
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-8">
                    {teamMembers.map((member) => (
                      <div key={member.id} className={`group bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-lg border transition-all duration-500 overflow-hidden ${
                        member.role === 'ADMIN'
                          ? 'border-amber-200/60 hover:shadow-2xl hover:border-amber-300'
                          : 'border-slate-200/60 hover:shadow-2xl hover:border-blue-200'
                      }`}>
                        {/* Card Header with Gradient Background */}
                        <div className={`relative p-6 text-white ${
                          member.role === 'ADMIN'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        }`}>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                          <div className="relative flex items-center">
                            <div className="flex-shrink-0 h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl border-2 border-white/30">
                              {getInitials(member.name)}
                            </div>
                            <div className="ml-4 flex-1">
                              <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
                              <p className="text-white/90 text-sm font-medium">{member.email}</p>
                            </div>
                            {isAdmin && (
                              <div className="flex flex-col gap-2 ml-4">
                                <button
                                  onClick={() => handleEdit(member)}
                                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
                                  title="Edit member"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(member.id)}
                                  className="p-2 text-white/80 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                                  title="Delete member"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                          {/* Department Information */}
                          {member.department && (
                            <div className="mb-6">
                              <div className="flex items-center text-sm text-slate-600">
                                <div className="p-2 bg-slate-100 rounded-lg mr-3">
                                  <MapPinIcon className="h-4 w-4 text-slate-500" />
                                </div>
                                <span className="font-medium">{member.departmentName || member.department}</span>
                              </div>
                            </div>
                          )}

                          {/* Project Statistics */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                  <BriefcaseIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-700">Active Projects</p>
                                  <p className="text-2xl font-bold text-blue-600">
                                    {member.projectCount || 0}
                                  </p>
                                </div>
                              </div>
                              {member.projectCount && member.projectCount > 0 && (
                                <div className="text-right">
                                  <div className="flex items-center text-xs text-slate-500 mb-1">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    <span>In Progress</span>
                                  </div>
                                  <div className="w-12 h-2 bg-blue-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${member.projects ?
                                          Math.round((member.projects.filter(p => p.status === 'In Progress').length / member.projects.length) * 100)
                                          : 0}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Projects Section - Only show if member has projects */}
                          {member.projectCount && member.projectCount > 0 && member.projects && member.projects.length > 0 && (
                            <div className="border-t border-slate-200 pt-4">
                              <div className="flex justify-between items-center mb-4">
                                <h5 className="text-sm font-semibold text-slate-700 flex items-center">
                                  <BriefcaseIcon className="h-4 w-4 mr-2 text-slate-500" />
                                  Project Assignments
                                </h5>
                                {member.projects.length > 2 && (
                                  <button
                                    onClick={() => toggleProjectsList(member.id)}
                                    className="text-xs text-blue-600 flex items-center hover:text-blue-800 transition-colors font-medium"
                                  >
                                    {expandedProjects[member.id] ? (
                                      <>
                                        <span className="mr-1">Show less</span>
                                        <ChevronUpIcon className="h-3 w-3" />
                                      </>
                                    ) : (
                                      <>
                                        <span className="mr-1">+{member.projects.length - 2} more</span>
                                        <ChevronDownIcon className="h-3 w-3" />
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                              <div className="space-y-3">
                                {member.projects
                                  .slice(0, expandedProjects[member.id] ? undefined : 2)
                                  .map(project => (
                                    <div key={project.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                                      <div className="flex justify-between items-start mb-3">
                                        <h6 className="text-sm font-semibold text-slate-800 truncate pr-2">{project.title}</h6>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                          project.status === 'Completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                          project.status === 'Planning' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                          project.status === 'On Hold' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                          project.status === 'Procurement' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                          project.status === 'Execution' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                                          'bg-slate-100 text-slate-800 border border-slate-200'
                                        }`}>
                                          {project.status}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 mr-4">
                                          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                                            <span>Progress</span>
                                            <span className="font-semibold">{project.percentage}%</span>
                                          </div>
                                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                            <div
                                              className={`h-full rounded-full transition-all duration-500 ${
                                                project.percentage >= 100 ? 'bg-green-500' :
                                                project.percentage >= 75 ? 'bg-blue-500' :
                                                project.percentage >= 50 ? 'bg-yellow-500' :
                                                project.percentage >= 25 ? 'bg-orange-500' :
                                                'bg-red-500'
                                              }`}
                                              style={{ width: `${Math.min(project.percentage, 100)}%` }}
                                            ></div>
                                          </div>
                                        </div>
                                        <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold text-white ${
                                          project.percentage >= 100 ? 'bg-green-500' :
                                          project.percentage >= 75 ? 'bg-blue-500' :
                                          project.percentage >= 50 ? 'bg-yellow-500' :
                                          project.percentage >= 25 ? 'bg-orange-500' :
                                          'bg-red-500'
                                        }`}>
                                          {project.percentage}%
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Add/Edit Member Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {isEditing ? 'Edit Team Member' : 'Add New Team Member'}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-slate-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10 pr-4 py-2.5 block w-full rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Enter full name"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10 pr-4 py-2.5 block w-full rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="email@example.com"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {!isEditing && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 pr-4 py-2.5 block w-full rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="••••••••"
                          required={!isEditing}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                      <div className="relative">
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="pl-10 pr-4 py-2.5 block w-full rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none"
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                          <option value="PMO">PMO</option>
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                      <div className="relative">
                        <select
                          value={formData.departmentId || ''}
                          onChange={(e) => {
                            const deptId = e.target.value;
                            const dept = departments.find(d => d.id === deptId);
                            setFormData({
                              ...formData,
                              departmentId: deptId || undefined,
                              department: dept?.name || ''
                            });
                          }}
                          className="pl-10 pr-4 py-2.5 block w-full rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none"
                        >
                          <option value="">Select Department</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814L10 13.197l-4.419 2.617A1 1 0 014 15V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center"
                  >
                    {isEditing ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7a2 2 0 012-2h1v5.586l-1.293-1.293z" />
                        </svg>
                        Save Changes
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Member
                      </>
                    )}
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




