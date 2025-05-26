"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/AppLayout';
import ProjectForm from '@/components/ProjectForm';
import AdvancedFilters from '@/components/AdvancedFilters';
import AuthWrapper from '@/components/AuthWrapper';
import ConfirmationModal from '@/components/ConfirmationModal';
import {
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  ChartBarIcon,
  DocumentTextIcon,
  TrophyIcon,
  SparklesIcon,
  EyeIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  ExclamationTriangleIcon,
  ArrowLongRightIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PrinterIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Squares2X2Icon,
  TableCellsIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

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
  isArchived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
}

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return {
        color: 'from-emerald-500 to-teal-600',
        icon: '✔️',
        iconComponent: <CheckCircleIcon className="h-4 w-4" />,
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        tooltip: 'Project completed successfully'
      };
    case 'execution':
    case 'in progress':
      return {
        color: 'from-blue-500 to-indigo-600',
        icon: '⏳',
        iconComponent: <PlayCircleIcon className="h-4 w-4" />,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        tooltip: 'Project is currently in progress'
      };
    case 'possible':
    case 'planning':
    case 'planned':
      return {
        color: 'from-amber-500 to-orange-600',
        icon: '📋',
        iconComponent: <DocumentTextIcon className="h-4 w-4" />,
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        tooltip: 'Project is in planning phase'
      };
    case 'scoping':
      return {
        color: 'from-purple-500 to-violet-600',
        icon: '🔍',
        iconComponent: <MagnifyingGlassIcon className="h-4 w-4" />,
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        tooltip: 'Project scope is being defined'
      };
    case 'procurement':
      return {
        color: 'from-indigo-500 to-blue-600',
        icon: '🛒',
        iconComponent: <CurrencyDollarIcon className="h-4 w-4" />,
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
        tooltip: 'Project is in procurement phase'
      };
    case 'on hold':
    case 'closed':
      return {
        color: 'from-slate-500 to-gray-600',
        icon: '⏸️',
        iconComponent: <PauseCircleIcon className="h-4 w-4" />,
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-700',
        tooltip: 'Project is on hold or closed'
      };
    case 'delayed':
    case 'at risk':
      return {
        color: 'from-rose-500 to-red-600',
        icon: '⚠️',
        iconComponent: <ExclamationTriangleIcon className="h-4 w-4" />,
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
        tooltip: 'Project is delayed or at risk'
      };
    default:
      return {
        color: 'from-gray-500 to-slate-600',
        icon: '📄',
        iconComponent: <DocumentTextIcon className="h-4 w-4" />,
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        tooltip: 'Project status'
      };
  }
};

const getDepartmentConfig = (department: string) => {
  // Map of department names to specific colors for consistency with departments page
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

  // Define the color and styles based on department
  const getColor = (dept: string) => {
    // If department has a predefined color, use it
    if (departmentColors[dept]) {
      const colorBase = departmentColors[dept].split(' ')[0].replace('from-', '');
      return {
        color: departmentColors[dept],
        bg: `bg-${colorBase.split('-')[0]}-50`,
        text: `text-${colorBase.split('-')[0]}-700`,
        lightBg: `bg-${colorBase.split('-')[0]}-100`,
        lightText: `text-${colorBase.split('-')[0]}-600`
      };
    }

    // Fallback with deterministic color selection
    const distinctColors = [
      { color: 'from-blue-600 to-blue-700', bg: 'bg-blue-50', text: 'text-blue-700', lightBg: 'bg-blue-100', lightText: 'text-blue-600' },
      { color: 'from-indigo-600 to-indigo-700', bg: 'bg-indigo-50', text: 'text-indigo-700', lightBg: 'bg-indigo-100', lightText: 'text-indigo-600' },
      { color: 'from-purple-600 to-purple-700', bg: 'bg-purple-50', text: 'text-purple-700', lightBg: 'bg-purple-100', lightText: 'text-purple-600' },
      { color: 'from-pink-600 to-pink-700', bg: 'bg-pink-50', text: 'text-pink-700', lightBg: 'bg-pink-100', lightText: 'text-pink-600' },
      { color: 'from-red-600 to-red-700', bg: 'bg-red-50', text: 'text-red-700', lightBg: 'bg-red-100', lightText: 'text-red-600' },
      { color: 'from-amber-600 to-amber-700', bg: 'bg-amber-50', text: 'text-amber-700', lightBg: 'bg-amber-100', lightText: 'text-amber-600' },
      { color: 'from-yellow-600 to-yellow-700', bg: 'bg-yellow-50', text: 'text-yellow-700', lightBg: 'bg-yellow-100', lightText: 'text-yellow-600' },
      { color: 'from-emerald-600 to-emerald-700', bg: 'bg-emerald-50', text: 'text-emerald-700', lightBg: 'bg-emerald-100', lightText: 'text-emerald-600' },
      { color: 'from-green-600 to-green-700', bg: 'bg-green-50', text: 'text-green-700', lightBg: 'bg-green-100', lightText: 'text-green-600' },
      { color: 'from-teal-600 to-teal-700', bg: 'bg-teal-50', text: 'text-teal-700', lightBg: 'bg-teal-100', lightText: 'text-teal-600' },
      { color: 'from-cyan-600 to-cyan-700', bg: 'bg-cyan-50', text: 'text-cyan-700', lightBg: 'bg-cyan-100', lightText: 'text-cyan-600' },
      { color: 'from-orange-600 to-orange-700', bg: 'bg-orange-50', text: 'text-orange-700', lightBg: 'bg-orange-100', lightText: 'text-orange-600' },
      { color: 'from-rose-600 to-rose-700', bg: 'bg-rose-50', text: 'text-rose-700', lightBg: 'bg-rose-100', lightText: 'text-rose-600' },
      { color: 'from-lime-600 to-lime-700', bg: 'bg-lime-50', text: 'text-lime-700', lightBg: 'bg-lime-100', lightText: 'text-lime-600' },
      { color: 'from-sky-600 to-sky-700', bg: 'bg-sky-50', text: 'text-sky-700', lightBg: 'bg-sky-100', lightText: 'text-sky-600' }
    ];

    // Create a hash from the department name
    const hash = dept.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return distinctColors[hash % distinctColors.length];
  };

  return getColor(department);
};

const getProgressConfig = (percentage: number, status?: string, isLate?: boolean) => {
  // Risk-based coloring
  if (isLate || status?.toLowerCase().includes('delayed') || status?.toLowerCase().includes('risk')) {
    return {
      color: 'from-rose-500 to-red-600',
      bg: 'bg-rose-100',
      textColor: 'text-rose-700',
      label: 'At Risk'
    };
  }

  // Progress-based coloring for on-track projects
  if (percentage >= 90) {
    return {
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      label: 'Excellent'
    };
  } else if (percentage >= 75) {
    return {
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-100',
      textColor: 'text-blue-700',
      label: 'On Track'
    };
  } else if (percentage >= 50) {
    return {
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-100',
      textColor: 'text-amber-700',
      label: 'In Progress'
    };
  } else if (percentage >= 25) {
    return {
      color: 'from-orange-500 to-red-600',
      bg: 'bg-orange-100',
      textColor: 'text-orange-700',
      label: 'Early Stage'
    };
  } else if (percentage > 0) {
    return {
      color: 'from-slate-400 to-slate-500',
      bg: 'bg-slate-100',
      textColor: 'text-slate-700',
      label: 'Started'
    };
  } else {
    return {
      color: 'from-gray-300 to-gray-400',
      bg: 'bg-gray-100',
      textColor: 'text-gray-600',
      label: 'Not Started'
    };
  }
};

const ProjectDetailsModal = ({ project, onClose, initialEditMode = false }: {
  project: Project;
  onClose: () => void;
  initialEditMode?: boolean;
}) => {
  const statusConfig = getStatusConfig(project.status);
  const deptConfig = getDepartmentConfig(project.department);
  const progressConfig = getProgressConfig(project.percentage);
  const [isEditing, setIsEditing] = useState(initialEditMode);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print project details');
      return;
    }

    // Get the department and status colors for consistent styling
    const deptColorBase = deptConfig.color.split(' ')[0].replace('from-', '');
    const statusColorBase = statusConfig.bg.replace('bg-', '');

    // Create HTML content for the print window
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${project.projectTitle} - Project Details</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.4;
              color: #334155;
              background: white;
              margin: 0;
              padding: 0;
              font-size: 11px;
            }
            .container {
              max-width: 100%;
              margin: 0 auto;
              padding: 10px;
            }
            .project-header {
              background: linear-gradient(to right, var(--dept-color-from), var(--dept-color-to));
              color: white;
              padding: 10px 15px;
              border-radius: 8px 8px 0 0;
              margin-bottom: 10px;
              position: relative;
            }
            .project-header::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 8px 8px 0 0;
            }
            .project-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
            }
            .project-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              font-size: 11px;
              margin-bottom: 5px;
              position: relative;
              z-index: 1;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 12px;
              font-size: 10px;
              margin-right: 5px;
              backdrop-filter: blur(4px);
            }
            .section {
              margin-bottom: 10px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #1e293b;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 5px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .card {
              background: white;
              border-radius: 6px;
              padding: 10px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
              border: 1px solid #e2e8f0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              border-bottom: 1px solid #f1f5f9;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              color: #64748b;
              font-size: 11px;
            }
            .value {
              font-weight: 600;
              color: #1e293b;
              font-size: 11px;
            }
            .progress-container {
              margin-top: 8px;
              background: #f1f5f9;
              height: 6px;
              border-radius: 3px;
              overflow: hidden;
            }
            .progress-bar {
              height: 100%;
              background: linear-gradient(to right, var(--progress-color-from), var(--progress-color-to));
            }
            .progress-label {
              display: flex;
              justify-content: space-between;
              margin-top: 3px;
              font-size: 9px;
              color: #64748b;
            }
            .progress-value {
              font-weight: bold;
              font-size: 16px;
              color: #1e293b;
              margin-bottom: 5px;
            }
            .status-badge {
              display: inline-flex;
              align-items: center;
              padding: 2px 6px;
              background-color: var(--status-bg);
              color: var(--status-color);
              border-radius: 12px;
              font-size: 10px;
              font-weight: 500;
            }
            .metric-icon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              background: linear-gradient(to right, var(--dept-color-from), var(--dept-color-to));
              color: white;
              border-radius: 4px;
              margin-right: 8px;
              font-size: 12px;
            }
            .metric-row {
              display: flex;
              align-items: center;
              margin-bottom: 0;
            }
            .financial-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
            }
            .detail-row {
              display: flex;
              padding: 6px;
              background: #f8fafc;
              border-radius: 4px;
              margin-bottom: 5px;
              font-size: 11px;
            }
            .detail-row .label {
              flex: 0 0 100px;
            }
            .detail-row .value {
              flex: 1;
            }
            @media print {
              body {
                size: A4 portrait;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 100%;
                padding: 10px;
              }
              .card {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #e2e8f0;
              }
              .section {
                break-inside: avoid;
              }
              .project-header {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .status-badge, .progress-bar, .metric-icon {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
          <style>
            :root {
              --dept-color-from: ${deptColorBase === 'blue-600' ? '#2563eb' :
                deptColorBase === 'yellow-600' ? '#ca8a04' :
                deptColorBase === 'purple-600' ? '#9333ea' :
                deptColorBase === 'pink-600' ? '#db2777' :
                deptColorBase === 'red-600' ? '#dc2626' :
                deptColorBase === 'amber-600' ? '#d97706' :
                deptColorBase === 'indigo-600' ? '#4f46e5' :
                deptColorBase === 'emerald-600' ? '#059669' :
                deptColorBase === 'green-600' ? '#16a34a' :
                deptColorBase === 'teal-600' ? '#0d9488' :
                deptColorBase === 'cyan-600' ? '#0891b2' :
                deptColorBase === 'orange-600' ? '#ea580c' :
                deptColorBase === 'lime-600' ? '#65a30d' :
                deptColorBase === 'rose-600' ? '#e11d48' :
                deptColorBase === 'sky-600' ? '#0284c7' :
                deptColorBase === 'slate-600' ? '#475569' : '#4f46e5'};

              --dept-color-to: ${deptColorBase === 'blue-600' ? '#1d4ed8' :
                deptColorBase === 'yellow-600' ? '#a16207' :
                deptColorBase === 'purple-600' ? '#7e22ce' :
                deptColorBase === 'pink-600' ? '#be185d' :
                deptColorBase === 'red-600' ? '#b91c1c' :
                deptColorBase === 'amber-600' ? '#b45309' :
                deptColorBase === 'indigo-600' ? '#4338ca' :
                deptColorBase === 'emerald-600' ? '#047857' :
                deptColorBase === 'green-600' ? '#15803d' :
                deptColorBase === 'teal-600' ? '#0f766e' :
                deptColorBase === 'cyan-600' ? '#0e7490' :
                deptColorBase === 'orange-600' ? '#c2410c' :
                deptColorBase === 'lime-600' ? '#4d7c0f' :
                deptColorBase === 'rose-600' ? '#be123c' :
                deptColorBase === 'sky-600' ? '#0369a1' :
                deptColorBase === 'slate-600' ? '#334155' : '#4338ca'};

              --progress-color-from: ${project.percentage >= 90 ? '#10b981' :
                project.percentage >= 75 ? '#3b82f6' :
                project.percentage >= 50 ? '#f59e0b' :
                project.percentage >= 25 ? '#f97316' : '#f43f5e'};

              --progress-color-to: ${project.percentage >= 90 ? '#0d9488' :
                project.percentage >= 75 ? '#4f46e5' :
                project.percentage >= 50 ? '#ea580c' :
                project.percentage >= 25 ? '#ef4444' : '#e11d48'};

              --status-bg: ${statusColorBase === 'emerald-50' ? '#ecfdf5' :
                statusColorBase === 'blue-50' ? '#eff6ff' :
                statusColorBase === 'amber-50' ? '#fffbeb' :
                statusColorBase === 'purple-50' ? '#faf5ff' :
                statusColorBase === 'rose-50' ? '#fff1f2' : '#f8fafc'};

              --status-color: ${statusColorBase === 'emerald-50' ? '#047857' :
                statusColorBase === 'blue-50' ? '#1d4ed8' :
                statusColorBase === 'amber-50' ? '#b45309' :
                statusColorBase === 'purple-50' ? '#7e22ce' :
                statusColorBase === 'rose-50' ? '#be123c' : '#334155'};
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="project-header">
              <div class="project-title">${project.projectTitle}</div>
              <div class="project-meta">
                <span class="badge">${project.department}</span>
                <span class="badge">Year: ${project.year}</span>
                <span class="badge">${project.status}</span>
                <span>OPD Focal: ${project.opdFocal}</span>
              </div>
            </div>

            <div class="section">
              <div class="grid">
                <!-- Progress -->
                <div class="card">
                  <div class="section-title">Progress</div>
                  <div class="progress-value">${project.percentage}%</div>
                  <div class="progress-container">
                    <div class="progress-bar" style="width: ${project.percentage}%"></div>
                  </div>
                  <div class="progress-label">
                    <span>0%</span>
                    <span>Complete</span>
                    <span>100%</span>
                  </div>
                </div>

                <!-- Project Type -->
                <div class="card">
                  <div class="section-title">Project Type</div>
                  <div class="info-row">
                    <span class="label">Type:</span>
                    <span class="value">${project.type}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Category:</span>
                    <span class="value">${project.capexOpex}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Drivers:</span>
                    <span class="value">${project.drivers}</span>
                  </div>
                </div>

                <!-- Timeline -->
                <div class="card">
                  <div class="section-title">Timeline</div>
                  <div class="info-row">
                    <span class="label">Start:</span>
                    <span class="value">${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Completion:</span>
                    <span class="value">${project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Duration:</span>
                    <span class="value">${project.duration ? `${project.duration} days` : 'Not specified'}</span>
                  </div>
                </div>

                <!-- Team & Department -->
                <div class="card">
                  <div class="section-title">Team</div>
                  <div class="info-row">
                    <span class="label">Department:</span>
                    <span class="value">${project.department}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">OPD Focal:</span>
                    <span class="value">${project.opdFocal}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Area:</span>
                    <span class="value">${project.area}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Overview -->
            <div class="section">
              <div class="section-title">Financial Overview</div>
              <div class="financial-grid">
                <div class="card">
                  <div class="metric-row">
                    <div class="metric-icon">$</div>
                    <div>
                      <div class="label">Budget</div>
                      <div class="value">${project.budget ? `${project.budget.toLocaleString()} OMR` : '-'}</div>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="metric-row">
                    <div class="metric-icon">🏆</div>
                    <div>
                      <div class="label">Award Amount</div>
                      <div class="value">${project.awardAmount ? `${project.awardAmount.toLocaleString()} OMR` : '-'}</div>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="metric-row">
                    <div class="metric-icon">✨</div>
                    <div>
                      <div class="label">Savings (OMR)</div>
                      <div class="value">${project.savingsOMR ? `${project.savingsOMR.toLocaleString()} OMR` : '-'}</div>
                    </div>
                  </div>
                </div>
                <div class="card">
                  <div class="metric-row">
                    <div class="metric-icon">📊</div>
                    <div>
                      <div class="label">Savings %</div>
                      <div class="value">${project.savingsPercentage ? `${project.savingsPercentage}%` : '-'}</div>
                    </div>
                  </div>
                </div>
                ${project.awardedCompany ? `
                <div class="card" style="grid-column: span 4;">
                  <div class="info-row">
                    <span class="label">Awarded Company:</span>
                    <span class="value">${project.awardedCompany}</span>
                  </div>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Reference Numbers -->
            <div class="section">
              <div class="section-title">Reference Numbers</div>
              <div class="grid-2">
                <div class="info-row">
                  <span class="label">PR Number:</span>
                  <span class="value">${project.pr || 'Not assigned'}</span>
                </div>
                <div class="info-row">
                  <span class="label">PO Number:</span>
                  <span class="value">${project.poNumber || 'Not assigned'}</span>
                </div>
                <div class="info-row">
                  <span class="label">PMO Number:</span>
                  <span class="value">${project.pmoNumber || 'Not assigned'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Quarter:</span>
                  <span class="value">${project.quarterOfYear || 'Not specified'}</span>
                </div>
              </div>
            </div>

            ${(project.briefStatus || project.column1) ? `
            <!-- Additional Information -->
            <div class="section">
              <div class="section-title">Additional Information</div>
              ${project.briefStatus ? `
              <div class="card" style="margin-bottom: 5px;">
                <div style="font-weight: 600; margin-bottom: 3px;">Brief Status</div>
                <p style="margin: 0; font-size: 11px;">${project.briefStatus}</p>
              </div>
              ` : ''}
              ${project.column1 ? `
              <div class="card">
                <div style="font-weight: 600; margin-bottom: 3px;">Notes</div>
                <p style="margin: 0; font-size: 11px;">${project.column1}</p>
              </div>
              ` : ''}
            </div>
            ` : ''}
          </div>
          <script>
            // Auto-print after content is loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    // Write the content to the print window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:relative print:bg-white print:p-0 modal-print-container">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/60 print:shadow-none print:border-0 print:max-h-none print:overflow-visible">
        {isEditing ? (
          <ProjectForm
            project={project}
            onClose={() => setIsEditing(false)}
            onSave={() => {
              setIsEditing(false);
              onClose();
              // This will refresh the projects list after edit
              window.location.reload();
            }}
          />
        ) : (
          <>
            {/* Modern Header */}
            <div className={`relative bg-gradient-to-r ${deptConfig.color} p-6 rounded-t-xl print:rounded-none`}>
              <div className="absolute inset-0 bg-white/10 rounded-t-xl print:hidden"></div>
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium print:bg-transparent print:p-0 print:text-black">
                      {project.department}
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium print:bg-transparent print:p-0 print:text-black">
                      {project.year}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3 leading-tight print:text-black">{project.projectTitle}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-white/90 print:text-black">
                    <span className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="font-medium">{project.opdFocal}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}</span>
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm print:bg-transparent print:p-0 print:text-black`}>
                      {statusConfig.icon}
                      <span className="ml-1">{project.status}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 print:hidden">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white"
                    title="Edit project details"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white"
                    title="Print project details"
                  >
                    <PrinterIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white"
                    title="Close"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 print:p-4 print:space-y-4">
              {/* Progress and Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Progress Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">Progress</h3>
                      <span className="text-2xl font-bold text-slate-900">
                        {project.percentage}%
                      </span>
                    </div>
                    <div className="mb-2">
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${progressConfig.color} h-3 rounded-full`}
                          style={{ width: `${project.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span>0%</span>
                      <span>Complete</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Type Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-3">Project Type</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Type:</span>
                        <span className="font-medium text-slate-900">{project.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Category:</span>
                        <span className="font-medium text-slate-900">{project.capexOpex}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Drivers:</span>
                        <span className="font-medium text-slate-900">{project.drivers}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-3">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Start:</span>
                        <span className="font-medium text-slate-900">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Completion:</span>
                        <span className="font-medium text-slate-900">
                          {project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Duration:</span>
                        <span className="font-medium text-slate-900">
                          {project.duration ? `${project.duration} days` : 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Quarter:</span>
                        <span className="font-medium text-slate-900">
                          {project.quarterOfYear || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Financial Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[
                      {
                        label: 'Budget',
                        value: project.budget ? `${project.budget.toLocaleString()} OMR` : '-',
                        icon: <CurrencyDollarIcon className="h-5 w-5" />
                      },
                      {
                        label: 'Award Amount',
                        value: project.awardAmount ? `${project.awardAmount.toLocaleString()} OMR` : '-',
                        icon: <TrophyIcon className="h-5 w-5" />
                      },
                      {
                        label: 'Savings (OMR)',
                        value: project.savingsOMR ? `${project.savingsOMR.toLocaleString()} OMR` : '-',
                        icon: <SparklesIcon className="h-5 w-5" />
                      },
                      {
                        label: 'Savings %',
                        value: project.savingsPercentage ? `${project.savingsPercentage}%` : '-',
                        icon: <ChartBarIcon className="h-5 w-5" />
                      }
                    ].map((metric, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${deptConfig.color} text-white`}>
                            {metric.icon}
                          </div>
                          <span className="font-medium text-slate-700">{metric.label}</span>
                        </div>
                        <div className="text-xl font-semibold text-slate-900">{metric.value}</div>
                      </div>
                    ))}
                  </div>

                  {project.awardedCompany && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">Awarded Company:</span>
                        <span className="font-semibold text-slate-900">{project.awardedCompany}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Team & Department */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-4">Team & Department</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Department:</span>
                        <span className="font-medium text-slate-900">{project.department}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">OPD Focal:</span>
                        <span className="font-medium text-slate-900">{project.opdFocal}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">Area:</span>
                        <span className="font-medium text-slate-900">{project.area}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reference Numbers */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-4">Reference Numbers</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">PR Number:</span>
                        <span className="font-medium text-slate-900">{project.pr || 'Not assigned'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">PO Number:</span>
                        <span className="font-medium text-slate-900">{project.poNumber || 'Not assigned'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-600">PMO Number:</span>
                        <span className="font-medium text-slate-900">{project.pmoNumber || 'Not assigned'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {(project.briefStatus || project.column1) && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 mb-4">Additional Information</h3>

                    {project.briefStatus && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Brief Status</h4>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-slate-900">{project.briefStatus}</p>
                        </div>
                      </div>
                    )}

                    {project.column1 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Notes</h4>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-slate-900">{project.column1}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isEditing, setIsEditing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Enhanced features state
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'project', 'department', 'status', 'teamLead', 'progress', 'budget', 'actions'
  ]));
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning' as 'warning' | 'danger' | 'info',
    confirmText: 'Confirm',
    projectId: ''
  });

  useEffect(() => {
    fetchProjects();
  }, [showArchived]);

  // Close column customizer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColumnCustomizer && !(event.target as Element).closest('.column-customizer')) {
        setShowColumnCustomizer(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnCustomizer]);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      // Fetch active projects
      const activeResponse = await fetch('/api/projects/active');
      if (!activeResponse.ok) {
        throw new Error('Failed to fetch active projects');
      }
      const activeData = await activeResponse.json();

      // Fetch archived projects
      const archivedResponse = await fetch('/api/projects/archived');
      if (!archivedResponse.ok) {
        throw new Error('Failed to fetch archived projects');
      }
      const archivedData = await archivedResponse.json();

      setProjects(activeData);
      setArchivedProjects(archivedData);
      setFilteredProjects(showArchived ? archivedData : activeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Archive/Unarchive functions with optimistic updates
  const handleArchiveProject = async (projectId: string) => {
    // Find the project to archive
    const projectToArchive = projects.find(p => p.id === projectId);
    if (!projectToArchive) return;

    // Optimistically update the UI immediately
    if (showArchived) {
      // If we're viewing archived projects, don't remove it (shouldn't happen)
      return;
    } else {
      // Remove from active projects and add to archived projects
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setArchivedProjects(prev => [...prev, { ...projectToArchive, isArchived: true, archivedAt: new Date().toISOString() }]);
      setFilteredProjects(prev => prev.filter(p => p.id !== projectId));
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to archive project');
      }

      // Success - the optimistic update was correct
    } catch (error) {
      console.error('Error archiving project:', error);

      // Revert the optimistic update on error
      setProjects(prev => [...prev, projectToArchive]);
      setArchivedProjects(prev => prev.filter(p => p.id !== projectId));
      if (!showArchived) {
        setFilteredProjects(prev => [...prev, projectToArchive]);
      }

      alert(`Failed to archive project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUnarchiveProject = async (projectId: string) => {
    // Find the project to unarchive
    const projectToUnarchive = archivedProjects.find(p => p.id === projectId);
    if (!projectToUnarchive) return;

    // Optimistically update the UI immediately
    if (showArchived) {
      // Remove from archived projects view
      setArchivedProjects(prev => prev.filter(p => p.id !== projectId));
      setFilteredProjects(prev => prev.filter(p => p.id !== projectId));
    }

    // Add to active projects (remove archive flags)
    const unarchivedProject = { ...projectToUnarchive, isArchived: false, archivedAt: undefined, archivedBy: undefined };
    setProjects(prev => [...prev, unarchivedProject]);

    try {
      const response = await fetch(`/api/projects/${projectId}/archive`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unarchive project');
      }

      // Success - the optimistic update was correct
    } catch (error) {
      console.error('Error unarchiving project:', error);

      // Revert the optimistic update on error
      setArchivedProjects(prev => [...prev, projectToUnarchive]);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (showArchived) {
        setFilteredProjects(prev => [...prev, projectToUnarchive]);
      }

      alert(`Failed to unarchive project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Show confirmation modal for archive/unarchive
  const showArchiveConfirmation = (project: Project, isArchive: boolean) => {
    setConfirmationModal({
      isOpen: true,
      title: isArchive ? 'Archive Project' : 'Unarchive Project',
      message: isArchive
        ? `Are you sure you want to archive "${project.projectTitle}"? This will move it to the archived projects section.`
        : `Are you sure you want to unarchive "${project.projectTitle}"? This will move it back to active projects.`,
      onConfirm: () => {
        if (isArchive) {
          handleArchiveProject(project.id);
        } else {
          handleUnarchiveProject(project.id);
        }
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      },
      type: isArchive ? 'warning' : 'info',
      confirmText: isArchive ? 'Archive' : 'Unarchive',
      projectId: project.id
    });
  };

  const handleFiltersChange = useCallback((filtered: Project[]) => {
    setFilteredProjects(filtered);
  }, []);

  // Enhanced features functions
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const toggleAllProjects = () => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const toggleRowExpansion = (projectId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const exportToCSV = () => {
    const projectsToExport = selectedProjects.size > 0
      ? filteredProjects.filter(p => selectedProjects.has(p.id))
      : filteredProjects;

    const headers = [
      'Project Title', 'Department', 'Status', 'Sub Status', 'Team Lead',
      'Progress %', 'Budget (OMR)', 'Award Amount (OMR)', 'Type', 'Year',
      'Start Date', 'Completion Date', 'PR Number', 'PO Number', 'PMO Number'
    ];

    const csvContent = [
      headers.join(','),
      ...projectsToExport.map(project => [
        `"${project.projectTitle}"`,
        project.department,
        project.status,
        project.subStatus || '',
        project.opdFocal,
        project.percentage,
        project.budget || 0,
        project.awardAmount || 0,
        project.type,
        project.year,
        project.startDate || '',
        project.completionDate || '',
        project.pr || '',
        project.poNumber || '',
        project.pmoNumber || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `projects_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkArchive = async () => {
    const projectsToArchive = Array.from(selectedProjects);

    for (const projectId of projectsToArchive) {
      await handleArchiveProject(projectId);
    }

    setSelectedProjects(new Set());
    setShowBulkActions(false);
  };

  const availableColumns = [
    { key: 'project', label: 'Project', required: true },
    { key: 'department', label: 'Department' },
    { key: 'status', label: 'Status' },
    { key: 'teamLead', label: 'Team Lead' },
    { key: 'progress', label: 'Progress' },
    { key: 'budget', label: 'Budget' },
    { key: 'awardAmount', label: 'Award Amount' },
    { key: 'type', label: 'Type' },
    { key: 'year', label: 'Year' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'completionDate', label: 'Completion Date' },
    { key: 'actions', label: 'Actions', required: true }
  ];

  if (loading) {
    return (
      <AuthWrapper>
        <AppLayout title="">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </AppLayout>
      </AuthWrapper>
    );
  }

  if (error) {
    return (
      <AuthWrapper>
        <AppLayout title="">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/50 shadow-lg p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-red-100/30"></div>
            <div className="relative flex items-center">
              <div className="p-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl shadow-lg mr-6">
                <XMarkIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Projects</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchProjects}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </AppLayout>
      </AuthWrapper>
    );
  }

  if (showForm) {
    return (
      <AuthWrapper>
        <AppLayout title="">
          <ProjectForm onClose={() => {
            setShowForm(false);
            fetchProjects();
          }} />
        </AppLayout>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <AppLayout title="">
        <div className="space-y-6 print:space-y-3">
          {/* Modern Header with Search */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 print:block">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 print:text-slate-900 print:text-2xl">
                Project Portfolio
              </h1>
              <p className="text-slate-600 flex items-center space-x-2 print:text-slate-700">
                <ChartBarIcon className="h-4 w-4" />
                <span>
                  Showing {filteredProjects.length} of {showArchived ? archivedProjects.length : projects.length} {showArchived ? 'archived' : 'active'} projects
                </span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showArchived
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={showArchived ? 'Show active projects' : 'Show archived projects'}
              >
                {showArchived ? (
                  <ArchiveBoxXMarkIcon className="h-4 w-4 mr-2" />
                ) : (
                  <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                )}
                {showArchived ? `Archived (${archivedProjects.length})` : `Archive (${archivedProjects.length})`}
              </button>

              {/* Bulk Import Button - Admin Only */}
              {session?.user?.role === 'admin' && (
                <Link
                  href="/projects/bulk-import"
                  className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-all duration-300"
                  title="Bulk Import Projects"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Bulk Import
                </Link>
              )}

              <button
                onClick={() => setShowForm(true)}
                className="group relative overflow-hidden px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Project</span>
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            projects={showArchived ? archivedProjects : projects}
            onFiltersChange={handleFiltersChange}
          />

          {/* Enhanced Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Bulk Actions - Left Side */}
            {selectedProjects.size > 0 && (
              <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-blue-700">
                  {selectedProjects.size} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkArchive}
                    className="flex items-center px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-medium rounded-md transition-colors"
                  >
                    <ArchiveBoxIcon className="h-4 w-4 mr-1" />
                    Archive
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-md transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Export
                  </button>
                  <button
                    onClick={() => setSelectedProjects(new Set())}
                    className="flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-md transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Controls - Right Side */}
            <div className="flex items-center space-x-2 ml-auto">
              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors"
                title="Export to CSV"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Export
              </button>

              {/* Column Customizer */}
              {viewMode === 'table' && (
                <div className="relative column-customizer">
                  <button
                    onClick={() => setShowColumnCustomizer(!showColumnCustomizer)}
                    className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors"
                    title="Customize Columns"
                  >
                    <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
                    Columns
                  </button>

                  {showColumnCustomizer && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                      <div className="p-4">
                        <h3 className="font-medium text-slate-900 mb-3">Customize Columns</h3>
                        <div className="space-y-2">
                          {availableColumns.map(column => (
                            <label key={column.key} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={visibleColumns.has(column.key)}
                                disabled={column.required}
                                onChange={(e) => {
                                  const newColumns = new Set(visibleColumns);
                                  if (e.target.checked) {
                                    newColumns.add(column.key);
                                  } else {
                                    newColumns.delete(column.key);
                                  }
                                  setVisibleColumns(newColumns);
                                }}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                              />
                              <span className={`text-sm ${column.required ? 'text-slate-400' : 'text-slate-700'}`}>
                                {column.label}
                                {column.required && ' (required)'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                    ? 'bg-white text-slate-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'}`}
                  title="Grid View"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'table'
                    ? 'bg-white text-slate-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'}`}
                  title="Table View"
                >
                  <TableCellsIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-12 text-center">
              <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <DocumentTextIcon className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {projects.length === 0 ? 'No projects found' : 'No projects match your filters'}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {projects.length === 0 ? 'Create your first project to get started with project management!' : 'Try adjusting your filters or create a new project.'}
              </p>
              {projects.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create First Project</span>
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => {
                const statusConfig = getStatusConfig(project.status);
                const deptConfig = getDepartmentConfig(project.department);
                const progressConfig = getProgressConfig(project.percentage, project.status);

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-sm border border-slate-200/60 overflow-hidden hover:shadow-md transition-shadow duration-300"
                  >
                    <div className={`p-3 bg-gradient-to-r ${deptConfig.color} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm`}>
                            {project.department}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm`}>
                            {project.year}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-white mt-2 line-clamp-2">{project.projectTitle}</h3>
                        <div className="flex items-center mt-1.5 text-white/90">
                          <UserIcon className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs">{project.opdFocal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} cursor-help`}
                          title={statusConfig.tooltip}
                        >
                          <span className="mr-1">{statusConfig.icon}</span>
                          <span>{project.status}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-700">{project.type}</div>
                      </div>

                      <div className="mb-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600">Progress</span>
                          <span className="text-xs font-medium text-slate-900">{project.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${progressConfig.color} h-1.5 rounded-full transition-all duration-700`}
                            style={{ width: `${project.percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2.5">
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <div className="text-xs text-slate-500 mb-0.5">Budget</div>
                          <div className="text-xs font-semibold text-slate-900">
                            {project.budget ? project.budget.toLocaleString() : '-'} OMR
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <div className="text-xs text-slate-500 mb-0.5">Savings (OMR)</div>
                          <div className="text-xs font-semibold text-slate-900">
                            {project.savingsOMR ? project.savingsOMR.toLocaleString() : '-'} OMR
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center space-x-1"
                        >
                          <span>View Details</span>
                          <ArrowLongRightIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setIsEditing(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Project"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {showArchived ? (
                          <button
                            onClick={() => showArchiveConfirmation(project, false)}
                            className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Unarchive Project"
                          >
                            <ArchiveBoxXMarkIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => showArchiveConfirmation(project, true)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Archive Project"
                          >
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {/* Checkbox Column */}
                      <th className="py-4 px-4 w-12">
                        <input
                          type="checkbox"
                          checked={selectedProjects.size === filteredProjects.length && filteredProjects.length > 0}
                          onChange={toggleAllProjects}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>

                      {/* Dynamic Columns */}
                      {visibleColumns.has('project') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Project
                        </th>
                      )}
                      {visibleColumns.has('department') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Department
                        </th>
                      )}
                      {visibleColumns.has('status') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Status
                        </th>
                      )}
                      {visibleColumns.has('teamLead') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Team Lead
                        </th>
                      )}
                      {visibleColumns.has('progress') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Progress
                        </th>
                      )}
                      {visibleColumns.has('budget') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Budget
                        </th>
                      )}
                      {visibleColumns.has('awardAmount') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Award Amount
                        </th>
                      )}
                      {visibleColumns.has('type') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Type
                        </th>
                      )}
                      {visibleColumns.has('year') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Year
                        </th>
                      )}
                      {visibleColumns.has('startDate') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Start Date
                        </th>
                      )}
                      {visibleColumns.has('completionDate') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Completion Date
                        </th>
                      )}
                      {visibleColumns.has('actions') && (
                        <th className="py-4 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjects.map((project) => {
                      const statusConfig = getStatusConfig(project.status);
                      const deptConfig = getDepartmentConfig(project.department);
                      const progressConfig = getProgressConfig(project.percentage, project.status);
                      const isExpanded = expandedRows.has(project.id);
                      const isSelected = selectedProjects.has(project.id);

                      return (
                        <React.Fragment key={project.id}>
                          <tr
                            className={`hover:bg-slate-50 transition-colors duration-200 ${
                              isSelected ? 'bg-blue-50' : ''
                            } border-l-4 ${isSelected ? 'border-l-blue-400' : 'border-l-transparent hover:border-l-blue-400'}`}
                          >
                            {/* Checkbox */}
                            <td className="py-4 px-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleProjectSelection(project.id)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>

                            {/* Project Column */}
                            {visibleColumns.has('project') && (
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <button
                                    onClick={() => toggleRowExpansion(project.id)}
                                    className="mr-2 p-1 hover:bg-slate-200 rounded transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronUpIcon className="h-4 w-4 text-slate-500" />
                                    ) : (
                                      <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                                    )}
                                  </button>
                                  <div>
                                    <div className="text-sm font-medium text-slate-900 mb-1 line-clamp-1">
                                      {project.projectTitle}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                        {project.type}
                                      </span>
                                      {project.subStatus && (
                                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                          {project.subStatus}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            )}

                            {/* Department Column */}
                            {visibleColumns.has('department') && (
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${deptConfig.bg} ${deptConfig.text}`}>
                                  {project.department}
                                </span>
                              </td>
                            )}

                            {/* Status Column */}
                            {visibleColumns.has('status') && (
                              <td className="py-4 px-4">
                                <div
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} cursor-help`}
                                  title={statusConfig.tooltip}
                                >
                                  <span className="mr-1">{statusConfig.icon}</span>
                                  <span>{project.status}</span>
                                </div>
                              </td>
                            )}

                            {/* Team Lead Column */}
                            {visibleColumns.has('teamLead') && (
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center mr-2">
                                    <UserIcon className="h-3.5 w-3.5 text-slate-600" />
                                  </div>
                                  <span className="text-sm text-slate-700">{project.opdFocal}</span>
                                </div>
                              </td>
                            )}

                            {/* Progress Column */}
                            {visibleColumns.has('progress') && (
                              <td className="py-4 px-4">
                                <div className="w-full max-w-[150px]">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-medium ${progressConfig.textColor}`}>
                                      {project.percentage}%
                                    </span>
                                    <span className={`text-xs ${progressConfig.textColor}`}>
                                      {progressConfig.label}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                      className={`bg-gradient-to-r ${progressConfig.color} h-2 rounded-full transition-all duration-700`}
                                      style={{ width: `${project.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            )}

                            {/* Budget Column */}
                            {visibleColumns.has('budget') && (
                              <td className="py-4 px-4">
                                <div className="text-sm font-medium text-slate-900">
                                  {project.budget ? `${project.budget.toLocaleString()} OMR` : '-'}
                                </div>
                              </td>
                            )}

                            {/* Award Amount Column */}
                            {visibleColumns.has('awardAmount') && (
                              <td className="py-4 px-4">
                                <div className="text-sm font-medium text-slate-900">
                                  {project.awardAmount ? `${project.awardAmount.toLocaleString()} OMR` : '-'}
                                </div>
                              </td>
                            )}

                            {/* Type Column */}
                            {visibleColumns.has('type') && (
                              <td className="py-4 px-4">
                                <span className="text-sm text-slate-700">{project.type}</span>
                              </td>
                            )}

                            {/* Year Column */}
                            {visibleColumns.has('year') && (
                              <td className="py-4 px-4">
                                <span className="text-sm text-slate-700">{project.year}</span>
                              </td>
                            )}

                            {/* Start Date Column */}
                            {visibleColumns.has('startDate') && (
                              <td className="py-4 px-4">
                                <span className="text-sm text-slate-700">
                                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}
                                </span>
                              </td>
                            )}

                            {/* Completion Date Column */}
                            {visibleColumns.has('completionDate') && (
                              <td className="py-4 px-4">
                                <span className="text-sm text-slate-700">
                                  {project.completionDate ? new Date(project.completionDate).toLocaleDateString() : '-'}
                                </span>
                              </td>
                            )}

                            {/* Actions Column */}
                            {visibleColumns.has('actions') && (
                              <td className="py-4 px-4">
                                <div className="flex space-x-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setSelectedProject(project);
                                      setIsEditing(false);
                                    }}
                                    className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-colors"
                                    title="View Project"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedProject(project);
                                      setIsEditing(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Edit Project"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  {showArchived ? (
                                    <button
                                      onClick={() => showArchiveConfirmation(project, false)}
                                      className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                      title="Unarchive Project"
                                    >
                                      <ArchiveBoxXMarkIcon className="h-4 w-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => showArchiveConfirmation(project, true)}
                                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                      title="Archive Project"
                                    >
                                      <ArchiveBoxIcon className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>

                          {/* Expandable Row Content */}
                          {isExpanded && (
                            <tr className="bg-slate-50/50">
                              <td colSpan={12} className="px-6 py-4">
                                <div className="max-w-6xl mx-auto">
                                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {/* Financial Information */}
                                    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
                                      <div className="flex items-center mb-4">
                                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                                          <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900">Financial Details</h4>
                                      </div>
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Budget:</span>
                                          <span className="font-semibold text-slate-900">
                                            {project.budget ? `${project.budget.toLocaleString()} OMR` : 'Not specified'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Award Amount:</span>
                                          <span className="font-semibold text-slate-900">
                                            {project.awardAmount ? `${project.awardAmount.toLocaleString()} OMR` : 'Not specified'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                          <span className="text-slate-600 font-medium">Savings:</span>
                                          <span className="font-semibold text-green-600">
                                            {project.savingsOMR ? `${project.savingsOMR.toLocaleString()} OMR` : 'Not specified'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Reference Numbers */}
                                    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
                                      <div className="flex items-center mb-4">
                                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900">Reference Numbers</h4>
                                      </div>
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">PR Number:</span>
                                          <span className="font-semibold text-slate-900">
                                            {project.pr || 'Not assigned'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">PO Number:</span>
                                          <span className="font-semibold text-slate-900">
                                            {project.poNumber || 'Not assigned'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                          <span className="text-slate-600 font-medium">PMO Number:</span>
                                          <span className="font-semibold text-slate-900">
                                            {project.pmoNumber || 'Not assigned'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Timeline & Additional Info */}
                                    <div className="bg-white rounded-lg p-5 shadow-sm border border-slate-200">
                                      <div className="flex items-center mb-4">
                                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                                          <CalendarIcon className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900">Timeline & Info</h4>
                                      </div>
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Start Date:</span>
                                          <span className="font-semibold text-slate-900">
                                            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Completion:</span>
                                          <span className="font-semibold text-slate-900">
                                            {project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'Not set'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Duration:</span>
                                          <span className="font-semibold text-slate-900">
                                            {project.duration ? `${project.duration} days` : 'Not specified'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                          <span className="text-slate-600 font-medium">Area:</span>
                                          <span className="font-semibold text-slate-900">
                                            {project.area || 'Not specified'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Additional Notes Section */}
                                  {(project.briefStatus || project.column1) && (
                                    <div className="mt-6 bg-white rounded-lg p-5 shadow-sm border border-slate-200">
                                      <div className="flex items-center mb-4">
                                        <div className="p-2 bg-amber-100 rounded-lg mr-3">
                                          <InformationCircleIcon className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <h4 className="font-semibold text-slate-900">Additional Information</h4>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {project.briefStatus && (
                                          <div>
                                            <h5 className="font-medium text-slate-700 mb-2">Brief Status</h5>
                                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                                              {project.briefStatus}
                                            </p>
                                          </div>
                                        )}
                                        {project.column1 && (
                                          <div>
                                            <h5 className="font-medium text-slate-700 mb-2">Notes</h5>
                                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">
                                              {project.column1}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Project Details Modal */}
        {selectedProject && (
          <ProjectDetailsModal
            project={selectedProject}
            onClose={() => {
              setSelectedProject(null);
              setIsEditing(false);
            }}
            initialEditMode={isEditing}
          />
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          type={confirmationModal.type}
        />
      </AppLayout>
    </AuthWrapper>
  );
}