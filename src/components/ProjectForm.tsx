"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  projectTitle: string;
  department: string;
  status: string;
  subStatus?: string;
  completionDate?: string;
  startDate?: string;
  percentage: number;
  budget?: number;
  awardAmount?: number;
  awardedCompany?: string;
  savingsOMR?: number;
  savingsPercentage?: number;
  drivers: string;
  type: string;
  opdFocal: string;
  area: string;
  capexOpex: string;
  year: number;
  briefStatus?: string;
  pr?: string;
  duration?: number;
  poNumber?: string;
  pmoNumber?: string;
  column1?: string;
  dateOfReceiveFinalDoc?: string;
  quarterOfYear?: string;
  createdAt: string;
}

interface ProjectFormData {
  drivers: string;
  type: string;
  year: number;
  opdFocal: string;
  capexOpex: string;
  status: string;
  subStatus: string;
  percentage: number;
  projectTitle: string;
  briefStatus: string;
  budget: number | null;
  pr: string;
  duration: number | null;
  startDate: string;
  completionDate: string;
  poNumber: string;
  pmoNumber: string;
  department: string;
  area: string;
  awardAmount: number | null;
  awardedCompany: string;
  savingsOMR: number | null;
  savingsPercentage: number | null;
  column1: string;
  dateOfReceiveFinalDoc: string;
  quarterOfYear: string;
}

const initialFormData: ProjectFormData = {
  drivers: '',
  type: '',
  year: new Date().getFullYear(),
  opdFocal: '',
  capexOpex: 'CAPEX',
  status: 'Planning',
  subStatus: '',
  percentage: 0,
  projectTitle: '',
  briefStatus: '',
  budget: null,
  pr: '',
  duration: null,
  startDate: '',
  completionDate: '',
  poNumber: '',
  pmoNumber: '',
  department: '',
  area: '',
  awardAmount: null,
  awardedCompany: '',
  savingsOMR: null,
  savingsPercentage: null,
  column1: '',
  dateOfReceiveFinalDoc: '',
  quarterOfYear: 'Q1',
};

const driversOptions = [
  'Passenger experience',
  'Operational excellence',
  'Environmental sustainability',
  'Business transformation',
  'People well-being'
];

const typeOptions = [
  'Planned',
  'AD-HOC'
];

const statusOptions = [
  'Possible',
  'Scoping',
  'Procurement',
  'Execution',
  'Completed',
  'Closed'
];

const subStatusOptions = [
  'Enabaling Works',
  'Award',
  'Side Submission',
  'Scoping',
  'Float'
];

const departmentOptions = [
  'AOCC',
  'AOPS',
  'BHS',
  'Commercial',
  'Fire',
  'FM',
  'HSE',
  'OPD',
  'Security',
  'TOPS'
];

const quarterOptions = ['Q1', 'Q2', 'Q3', 'Q4'];

interface ProjectFormProps {
  onClose?: () => void;
  onSave?: () => void;
  project?: Project;
}

export default function ProjectForm({ onClose, onSave, project }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<{id: string, name: string}[]>([]);
  const router = useRouter();
  const isEditing = !!project;

  // Fetch team members for OPD Focal dropdown
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        console.log('Fetching team members...');
        const response = await fetch('/api/team');
        console.log('Team API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Team members data:', data);

          const members = data.map((member: any) => ({
            id: member.id,
            name: member.name
          }));

          console.log('Processed team members:', members);
          setTeamMembers(members);
        } else {
          console.error('Failed to fetch team members:', response.status);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  // Initialize form with project data if editing
  useEffect(() => {
    if (project) {
      setFormData({
        drivers: project.drivers || '',
        type: project.type || '',
        year: project.year || new Date().getFullYear(),
        opdFocal: project.opdFocal || '',
        capexOpex: project.capexOpex || 'CAPEX',
        status: project.status || 'Planning',
        subStatus: project.subStatus || '',
        percentage: project.percentage || 0,
        projectTitle: project.projectTitle || '',
        briefStatus: project.briefStatus || '',
        budget: project.budget || null,
        pr: project.pr || '',
        duration: project.duration || null,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        completionDate: project.completionDate ? new Date(project.completionDate).toISOString().split('T')[0] : '',
        poNumber: project.poNumber || '',
        pmoNumber: project.pmoNumber || '',
        department: project.department || '',
        area: project.area || '',
        awardAmount: project.awardAmount || null,
        awardedCompany: project.awardedCompany || '',
        savingsOMR: project.savingsOMR || null,
        savingsPercentage: project.savingsPercentage || null,
        column1: project.column1 || '',
        dateOfReceiveFinalDoc: project.dateOfReceiveFinalDoc ? new Date(project.dateOfReceiveFinalDoc).toISOString().split('T')[0] : '',
        quarterOfYear: project.quarterOfYear || 'Q1',
      });
    }
  }, [project]);

  // Auto-calculate savings when budget or award amount changes
  useEffect(() => {
    if (formData.budget !== null && formData.awardAmount !== null) {
      const savings = formData.budget - formData.awardAmount;
      const savingsPercentage = formData.budget > 0 ? (savings / formData.budget) * 100 : 0;

      setFormData(prev => ({
        ...prev,
        savingsOMR: savings,
        savingsPercentage: parseFloat(savingsPercentage.toFixed(2))
      }));
    }
  }, [formData.budget, formData.awardAmount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : Number(value)) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Project title is required';
    if (!formData.drivers.trim()) newErrors.drivers = 'Drivers field is required';
    if (!formData.type.trim()) newErrors.type = 'Project type is required';
    if (!formData.opdFocal.trim()) newErrors.opdFocal = 'OPD Focal is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    // Area is now optional - removed validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const formattedData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      completionDate: formData.completionDate ? new Date(formData.completionDate).toISOString() : null,
      dateOfReceiveFinalDoc: formData.dateOfReceiveFinalDoc ? new Date(formData.dateOfReceiveFinalDoc).toISOString() : null,
    };

    try {
      let response;

      if (isEditing && project) {
        // Update existing project
        response = await fetch(`/api/projects/${project.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });
      } else {
        // Create new project
        response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });
      }

      if (response.ok) {
        if (onSave) {
          onSave();
        } else if (onClose) {
          onClose();
          router.push('/projects');
        } else {
          router.push('/projects');
        }
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || `Failed to ${isEditing ? 'update' : 'create'} project` });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto form-modal">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500 dark:text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.projectTitle ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'} focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white`}
                    placeholder="Enter project title"
                  />
                  {errors.projectTitle && <p className="text-red-500 text-xs mt-1">{errors.projectTitle}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Drivers <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="drivers"
                    value={formData.drivers}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.drivers ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'} focus:border-transparent focus:outline-none focus:ring-2 appearance-none bg-white dark:bg-slate-700 dark:text-white`}
                  >
                    <option value="">Select Driver</option>
                    {driversOptions.map(driver => (
                      <option key={driver} value={driver}>{driver}</option>
                    ))}
                  </select>
                  {errors.drivers && <p className="text-red-500 text-xs mt-1">{errors.drivers}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.type ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'} focus:border-transparent focus:outline-none focus:ring-2 appearance-none bg-white dark:bg-slate-700 dark:text-white`}
                  >
                    <option value="">Select Type</option>
                    {typeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    min="2020"
                    max="2030"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    OPD Focal <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="opdFocal"
                    value={formData.opdFocal}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.opdFocal ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'} focus:border-transparent focus:outline-none focus:ring-2 appearance-none bg-white dark:bg-slate-700 dark:text-white`}
                  >
                    <option value="">Select OPD Focal</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.name}>{member.name}</option>
                    ))}
                  </select>
                  {errors.opdFocal && <p className="text-red-500 text-xs mt-1">{errors.opdFocal}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    CAPEX/OPEX
                  </label>
                  <select
                    name="capexOpex"
                    value={formData.capexOpex}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 appearance-none bg-white dark:bg-slate-700 dark:text-white"
                  >
                    <option value="CAPEX">CAPEX</option>
                    <option value="OPEX">OPEX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 appearance-none bg-white dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sub-Status
                  </label>
                  <select
                    name="subStatus"
                    value={formData.subStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 appearance-none bg-white dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select Sub-Status</option>
                    {subStatusOptions.map(subStatus => (
                      <option key={subStatus} value={subStatus}>{subStatus}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Completion %
                  </label>
                  <input
                    type="number"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.department ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'} focus:border-transparent focus:outline-none focus:ring-2 appearance-none bg-white dark:bg-slate-700 dark:text-white`}
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.area ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'} focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white`}
                    placeholder="Project area/location"
                  />
                  {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Quarter of Year
                  </label>
                  <select
                    name="quarterOfYear"
                    value={formData.quarterOfYear}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 appearance-none bg-white dark:bg-slate-700 dark:text-white"
                  >
                    {quarterOptions.map(quarter => (
                      <option key={quarter} value={quarter}>{quarter}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center border-t border-slate-200 dark:border-slate-700 pt-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                Financial Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Budget (OMR)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Award Amount (OMR)
                  </label>
                  <input
                    type="number"
                    name="awardAmount"
                    value={formData.awardAmount || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Savings (OMR)
                  </label>
                  <input
                    type="number"
                    name="savingsOMR"
                    value={formData.savingsOMR || ''}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-600 cursor-not-allowed dark:text-slate-300"
                    placeholder="Auto-calculated"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Savings %
                  </label>
                  <input
                    type="number"
                    name="savingsPercentage"
                    value={formData.savingsPercentage || ''}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-600 cursor-not-allowed dark:text-slate-300"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center border-t border-slate-200 dark:border-slate-700 pt-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                Project Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    PR Number
                  </label>
                  <input
                    type="text"
                    name="pr"
                    value={formData.pr}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    placeholder="Purchase Request number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    placeholder="Project duration in days"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    name="completionDate"
                    value={formData.completionDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    PO Number
                  </label>
                  <input
                    type="text"
                    name="poNumber"
                    value={formData.poNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    placeholder="Purchase Order number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    PMO Number
                  </label>
                  <input
                    type="text"
                    name="pmoNumber"
                    value={formData.pmoNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    placeholder="PMO number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Awarded Company
                  </label>
                  <input
                    type="text"
                    name="awardedCompany"
                    value={formData.awardedCompany}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date of Final Documentation
                  </label>
                  <input
                    type="date"
                    name="dateOfReceiveFinalDoc"
                    value={formData.dateOfReceiveFinalDoc}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center border-t border-slate-200 dark:border-slate-700 pt-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                Additional Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Brief Status
                  </label>
                  <textarea
                    name="briefStatus"
                    value={formData.briefStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    placeholder="Brief description of current status"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Additional Notes
                  </label>
                  <input
                    type="text"
                    name="column1"
                    value={formData.column1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 dark:bg-slate-700 dark:text-white"
                    placeholder="Additional information"
                  />
                </div>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-sm hover:shadow transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Project' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}