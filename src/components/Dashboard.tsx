"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatPossibleDate, formatCompletionDate } from '@/utils/dateUtils';
import { toast } from 'react-hot-toast';
import { notifyPriorityChange, notifyStatusChange } from '@/lib/notification-utils';
import ConfirmationModal from './ConfirmationModal';

interface Project {
  id: string;
  projectTitle: string;
  status: string;
  subStatus?: string;
  percentage: number;
  department: string;
  opdFocal: string;
  budget?: number;
  awardAmount?: number;
  savingsOMR?: number;
  completionDate?: string;
  createdAt: string;
  updatedAt?: string;
  statusChangeNote?: string;
  statusChangeDate?: string;
  createdBy?: string;
  updatedBy?: string;
  updatedByName?: string;
  pr?: string;
  poNumber?: string;
  pmoNumber?: string;
}

interface StatusColumn {
  title: string;
  status: string;
  color: string;
  bgColor: string;
  borderColor: string;
  projects: Project[];
}

interface DragItem {
  projectId: string;
  fromStatus: string;
}

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string, subStatus: string, additionalFields: {
    percentage?: number;
    budget?: number;
    awardAmount?: number;
    pr?: string;
    poNumber?: string;
    pmoNumber?: string;
  }) => void;
  projectTitle: string;
  fromStatus: string;
  toStatus: string;
  currentSubStatus: string;
  subStatusOptions: string[];
  project: Project;
}

interface SubStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subStatus: string, note: string, additionalFields: {
    percentage?: number;
    budget?: number;
    awardAmount?: number;
    pr?: string;
    poNumber?: string;
    pmoNumber?: string;
  }) => void;
  project: Project | null;
  currentSubStatus: string;
}

interface ProjectLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

const SubStatusModal = ({ isOpen, onClose, onSave, project, currentSubStatus }: SubStatusModalProps) => {
  const [subStatus, setSubStatus] = useState(currentSubStatus);
  const [note, setNote] = useState('');
  const [percentage, setPercentage] = useState(project?.percentage || 0);
  const [budget, setBudget] = useState(project?.budget || 0);
  const [awardAmount, setAwardAmount] = useState(project?.awardAmount || 0);
  const [pr, setPr] = useState(project?.pr || '');
  const [poNumber, setPoNumber] = useState(project?.poNumber || '');
  const [pmoNumber, setPmoNumber] = useState(project?.pmoNumber || '');

  useEffect(() => {
    setSubStatus(currentSubStatus);
    if (project) {
      setPercentage(project.percentage || 0);
      setBudget(project.budget || 0);
      setAwardAmount(project.awardAmount || 0);
      setPr(project.pr || '');
      setPoNumber(project.poNumber || '');
      setPmoNumber(project.pmoNumber || '');
    }
  }, [currentSubStatus, project]);

  if (!isOpen || !project) return null;

  const handleSave = () => {
    onSave(subStatus, note, {
      percentage,
      budget,
      awardAmount,
      pr,
      poNumber,
      pmoNumber
    });
    onClose();
  };

  const subStatusOptions = {
    'Possible': ['Initial Review', 'Feasibility Study', 'Approval Pending'],
    'Scoping': ['Requirements Gathering', 'Design Phase', 'Cost Estimation', 'Vendor Selection'],
    'Procurement': ['RFQ Preparation', 'Vendor Evaluation', 'Contract Negotiation', 'Purchase Order', 'Award'],
    'Execution': ['Project Kickoff', 'In Progress', 'Testing Phase', 'Final Review', 'Enabling Works'],
    'Completed': ['Documentation', 'Handover', 'Post-Implementation Review'],
    'Closed': ['Archived', 'Cancelled', 'On Hold']
  };

  const availableSubStatuses = subStatusOptions[project.status as keyof typeof subStatusOptions] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Edit Project Details</h3>
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Project: <span className="font-medium dark:text-white">{project.projectTitle}</span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Status: <span className="font-medium dark:text-white">{project.status}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sub-Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sub-Status
              </label>
              <select
                value={subStatus}
                onChange={(e) => setSubStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Sub-Status</option>
                {availableSubStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Completion Percentage */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Completion %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Budget (OMR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Award Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Award Amount (OMR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={awardAmount}
                onChange={(e) => setAwardAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* PR Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                PR Number
              </label>
              <input
                type="text"
                value={pr}
                onChange={(e) => setPr(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter PR number"
              />
            </div>

            {/* PO Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                PO Number
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter PO number"
              />
            </div>

            {/* PMO Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                PMO Number
              </label>
              <input
                type="text"
                value={pmoNumber}
                onChange={(e) => setPmoNumber(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter PMO number"
              />
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this change..."
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
          </div>

          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400 italic">
            <span className="inline-flex items-center">
              <ClipboardDocumentListIcon className="h-3 w-3 mr-1" />
              Sub-status changes will be recorded in the project activity log.
            </span>
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectLogsModal = ({ isOpen, onClose, projectId, projectTitle }: ProjectLogsModalProps) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (isOpen && projectId) {
      fetchLogs();
    }
  }, [isOpen, projectId]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/logs`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch logs: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      // Validate that data is an array
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array of logs');
      }

      setLogs(data);
      console.log(`Loaded ${data.length} logs for project ${projectId}`);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getActionIcon = (action: string) => {
    if (!action || typeof action !== 'string') {
      return <ClipboardDocumentListIcon className="h-4 w-4 text-gray-500" />;
    }

    switch (action) {
      case 'STATUS_CHANGE':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-blue-500" />;
      case 'SUBSTATUS_CHANGE':
        return <PencilIcon className="h-4 w-4 text-green-500" />;
      case 'PROJECT_CREATED':
        return <PlusIcon className="h-4 w-4 text-purple-500" />;
      case 'PROJECT_UPDATED':
        return <DocumentTextIcon className="h-4 w-4 text-amber-500" />;
      default:
        return <ClipboardDocumentListIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Add delete functionality
  const handleDeleteLog = async (logId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/logs?logId=${logId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete log');
      }

      // Remove the deleted log from the state
      setLogs(logs.filter(log => log.id !== logId));
      toast.success('Log deleted successfully');
      setLogToDelete(null);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete log');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/logs`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete logs');
      }

      // Clear the logs state
      setLogs([]);
      toast.success('All logs deleted successfully');
      setDeleteAllConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting logs:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete all logs');
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Unknown time';

    if (timestamp instanceof Date) {
      return formatDate(timestamp, 'datetime');
    }

    try {
      // Try to convert to a date
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return formatDate(date, 'datetime');
      }
    } catch (e) {}

    return 'Unknown time';
  };

  // Format the log title
  const getLogLabel = (log: any) => {
    if (!log) return 'Log entry';

    const action = log.action || '';
    if (typeof log.description === 'string' && log.description) {
      // Clean up the description if it contains JSON or complex date objects
      if (log.description.includes('completionDate')) {
        return 'Updated completion date';
      }
      return log.description;
    }

    switch (action) {
      case 'STATUS_CHANGE': return 'Status changed';
      case 'SUBSTATUS_CHANGE': return 'Sub-status updated';
      case 'PROJECT_CREATED': return 'Project created';
      case 'PROJECT_UPDATED': return 'Project updated';
      default: return 'Log entry';
    }
  };

  // Format the change value for display
  const formatChangeValue = (value: any): string => {
    if (value === undefined || value === null) return '';

    // Handle direct Firebase Timestamp objects
    if (typeof value === 'object' && value !== null && 'seconds' in value && 'nanoseconds' in value) {
      return formatCompletionDate(value, false);
    }

    // Handle serialized timestamp or date objects
    if (typeof value === 'string') {
      // Handle ISO dates and timestamp strings
      if (value.includes('GMT') ||
          value.includes('T00:00:00') ||
          value.includes('-28T') ||
          value.match(/^\d{4}-\d{2}-\d{2}/)) {
        return formatCompletionDate(value, false);
      }

      // Handle serialized timestamp objects
      if (value.includes('"seconds"') && value.includes('"nanoseconds"')) {
        try {
          return formatPossibleDate(value);
        } catch (e) {}
      }

      // Check if it's a stringified object that might contain a timestamp
      if (value.startsWith('{') && value.endsWith('}')) {
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === 'object' && 'seconds' in parsed) {
            return formatCompletionDate(parsed, false);
          }
        } catch (e) {}
      }
    }

    return String(value);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Project Activity Log</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{projectTitle}</p>
            </div>
            {logs.length > 0 && (
              <button
                onClick={() => setDeleteAllConfirmOpen(true)}
                className="px-3 py-1.5 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors flex items-center"
                disabled={loading}
              >
                <TrashIcon className="h-3.5 w-3.5 mr-1" />
                Clear All Logs
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-3 px-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
                {error && error.includes('index') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                    <p className="font-medium mb-1">Firebase Index Required</p>
                    <p className="mb-2">This query requires a composite index in Firestore. Click the link in the console output to create it.</p>
                    <p>After creating the index, wait a few minutes for it to be active before trying again.</p>
                  </div>
                )}
                <button
                  onClick={fetchLogs}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                No activity logs found for this project.
              </div>
            ) : (
              <div className="space-y-5">
                {logs.map((log) => {
                  // Validate log is a proper object with required fields
                  if (!log || typeof log !== 'object' || !log.id) {
                    console.error('Invalid log object:', log);
                    return null;
                  }

                  return (
                    <div key={log.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-lg text-slate-900 dark:text-white">
                              {getLogLabel(log)}
                            </h4>
                            <div className="flex items-center">
                              <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">
                                {formatTimestamp(log.createdAt)}
                              </span>
                              <button
                                onClick={() => {
                                  setLogToDelete(log.id);
                                  setDeleteConfirmOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                disabled={loading}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                            By: {typeof log.createdByName === 'string' ? log.createdByName : 'Unknown user'}
                          </p>
                          {log.note && typeof log.note === 'string' && (
                            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mt-3 mb-3">
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                <span className="font-medium">Note:</span> {log.note}
                              </p>
                            </div>
                          )}
                          {log.changes && typeof log.changes === 'object' && !Array.isArray(log.changes) && Object.keys(log.changes).length > 0 && (
                            <div className="mt-3 space-y-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                              <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">Changes</div>
                              {Object.entries(log.changes).map(([field, change]: [string, any]) => {
                                // Skip if field or change is invalid
                                if (!field || !change || typeof change !== 'object') return null;

                                // Format from/to values
                                const fromValue = change && 'from' in change ?
                                  (typeof change.from === 'object' ? JSON.stringify(change.from) : formatChangeValue(change.from)) : '';

                                const toValue = change && 'to' in change ?
                                  (typeof change.to === 'object' ? JSON.stringify(change.to) : formatChangeValue(change.to)) : '';

                                // Format the field name for better readability
                                const formatFieldName = (name: string) => {
                                  if (!name) return '';
                                  if (name === 'completionDate') return 'Completion Date';
                                  return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
                                };

                                return (
                                  <div key={field} className="text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-medium">{formatFieldName(field)}:</span>{' '}
                                    <span className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                                      {fromValue}
                                    </span>
                                    {' → '}
                                    <span className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                      {toValue}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete Single Log Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Delete Log</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Are you sure you want to delete this log? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 dark:text-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => logToDelete && handleDeleteLog(logToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Log'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Logs Confirmation Modal */}
      {deleteAllConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Delete All Logs</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Are you sure you want to delete <span className="font-bold">ALL</span> logs for this project? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteAllConfirmOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 dark:text-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllLogs}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete All Logs'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const NoteModal = ({ isOpen, onClose, onSave, projectTitle, fromStatus, toStatus, currentSubStatus, subStatusOptions, project }: NoteModalProps) => {
  const [note, setNote] = useState('');
  const [subStatus, setSubStatus] = useState(currentSubStatus);
  const [percentage, setPercentage] = useState(project?.percentage || 0);
  const [budget, setBudget] = useState(project?.budget || 0);
  const [awardAmount, setAwardAmount] = useState(project?.awardAmount || 0);
  const [pr, setPr] = useState(project?.pr || '');
  const [poNumber, setPoNumber] = useState(project?.poNumber || '');
  const [pmoNumber, setPmoNumber] = useState(project?.pmoNumber || '');

  useEffect(() => {
    if (project) {
      setPercentage(project.percentage || 0);
      setBudget(project.budget || 0);
      setAwardAmount(project.awardAmount || 0);
      setPr(project.pr || '');
      setPoNumber(project.poNumber || '');
      setPmoNumber(project.pmoNumber || '');
    }
  }, [project]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(note, subStatus, {
      percentage,
      budget,
      awardAmount,
      pr,
      poNumber,
      pmoNumber
    });
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Status Change & Project Update</h3>
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Moving <span className="font-medium dark:text-white">{projectTitle}</span>
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              From: <span className="font-medium dark:text-white">{fromStatus}</span> → To: <span className="font-medium dark:text-white">{toStatus}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sub-Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sub-Status
              </label>
              <select
                value={subStatus}
                onChange={(e) => setSubStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Sub-Status</option>
                {subStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Completion Percentage */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Completion %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Budget (OMR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Award Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Award Amount (OMR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={awardAmount}
                onChange={(e) => setAwardAmount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* PR Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                PR Number
              </label>
              <input
                type="text"
                value={pr}
                onChange={(e) => setPr(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter PR number"
              />
            </div>

            {/* PO Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                PO Number
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter PO number"
              />
            </div>

            {/* PMO Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                PMO Number
              </label>
              <input
                type="text"
                value={pmoNumber}
                onChange={(e) => setPmoNumber(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter PMO number"
              />
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this status change..."
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
            <span className="inline-flex items-center">
              <ClipboardDocumentListIcon className="h-3 w-3 mr-1" />
              Notes will be saved in the project history and displayed on the project card.
            </span>
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save & Move
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add an error boundary component at the top of the file
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
      <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-red-600 dark:text-red-300 mb-4">
        {error.message || 'An unexpected error occurred while rendering this component.'}
      </p>
      <div className="flex justify-center">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

// Function to reorder projects in a column
const reorder = (list: Project[], startIndex: number, endIndex: number): Project[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Department color configuration function
const getDepartmentConfig = (department: string) => {
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

export default function Dashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusColumns, setStatusColumns] = useState<StatusColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Note modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [projectToUpdate, setProjectToUpdate] = useState<Project | null>(null);
  const [toStatus, setToStatus] = useState<string>('');

  // Sub-status modal state
  const [subStatusModalOpen, setSubStatusModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  // Project logs modal state
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProjectTitle, setSelectedProjectTitle] = useState<string>('');

  // Catch errors in rendering
  const [hasRenderError, setHasRenderError] = useState(false);

  const [projectOrder, setProjectOrder] = useState<{[key: string]: string[]}>({});

  // My Projects toggle state
  const [showMyProjectsOnly, setShowMyProjectsOnly] = useState(false);

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

  // Update date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Format current date and time
  const getCurrentDate = () => formatDate(currentDateTime, 'full');
  const getCurrentTime = () => formatDate(currentDateTime, 'time');

  useEffect(() => {
    fetchProjects();
  }, []);

  // Refetch projects when toggle changes
  useEffect(() => {
    fetchProjects();
  }, [showMyProjectsOnly]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const endpoint = showMyProjectsOnly ? '/api/projects/my-projects' : '/api/projects/active';
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Archive/Unarchive functions with optimistic updates
  const handleArchiveProject = async (projectId: string) => {
    // Optimistically remove the project from the UI immediately
    const projectToArchive = projects.find(p => p.id === projectId);
    if (!projectToArchive) return;

    // Update UI immediately
    setProjects(prev => prev.filter(p => p.id !== projectId));
    toast.success('Project archived successfully');

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

      // Success - the optimistic update was correct, no need to do anything
    } catch (error) {
      console.error('Error archiving project:', error);

      // Revert the optimistic update on error
      setProjects(prev => [...prev, projectToArchive]);
      toast.error(`Failed to archive project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUnarchiveProject = async (projectId: string) => {
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

      const unarchivedProject = await response.json();

      // Add the unarchived project back to the active projects list
      setProjects(prev => [...prev, unarchivedProject]);
      toast.success('Project unarchived successfully');
    } catch (error) {
      console.error('Error unarchiving project:', error);
      toast.error(`Failed to unarchive project: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedItem({
      projectId: project.id,
      fromStatus: project.status
    });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();

    if (!draggedItem) return;

    const project = projects.find(p => p.id === draggedItem.projectId);
    if (!project || project.status === toStatus) return;

    // Show note modal to collect note and sub-status
    setNoteModalOpen(true);
    setProjectToUpdate(project);
    setToStatus(toStatus);
  };

  const handleStatusUpdate = async (note: string, newSubStatus: string, additionalFields?: {
    percentage?: number;
    budget?: number;
    awardAmount?: number;
    pr?: string;
    poNumber?: string;
    pmoNumber?: string;
  }) => {
    if (!projectToUpdate) return;

    const maxRetries = 3;
    let retries = 0;

    const attemptUpdate = async (): Promise<boolean> => {
      try {
        // First update the project status
        console.log(`Attempt ${retries + 1} to update project status`);
        const updateResponse = await fetch(`/api/projects/${projectToUpdate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...projectToUpdate,
            status: toStatus,
            subStatus: newSubStatus || projectToUpdate.subStatus,
            statusChangeNote: note,
            statusChangeDate: new Date().toISOString(),
            ...(additionalFields && {
              percentage: additionalFields.percentage,
              budget: additionalFields.budget,
              awardAmount: additionalFields.awardAmount,
              pr: additionalFields.pr,
              poNumber: additionalFields.poNumber,
              pmoNumber: additionalFields.pmoNumber,
            })
          }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(`Failed to update project status: ${errorData.error || updateResponse.statusText}`);
        }

        const updatedProject = await updateResponse.json();

        // Update local state only after successful API call
        setProjects(prev => prev.map(p =>
          p.id === projectToUpdate.id
            ? {
                ...p,
                status: toStatus,
                subStatus: newSubStatus || p.subStatus,
                statusChangeNote: note,
                statusChangeDate: new Date().toISOString(),
                ...(additionalFields && {
                  percentage: additionalFields.percentage ?? p.percentage,
                  budget: additionalFields.budget ?? p.budget,
                  awardAmount: additionalFields.awardAmount ?? p.awardAmount,
                  pr: additionalFields.pr ?? p.pr,
                  poNumber: additionalFields.poNumber ?? p.poNumber,
                  pmoNumber: additionalFields.pmoNumber ?? p.pmoNumber,
                })
              }
            : p
        ));

        console.log("Project status updated successfully");
        return true;
      } catch (error) {
        console.error(`Attempt ${retries + 1} failed:`, error);
        return false;
      }
    };

    try {
      while (retries < maxRetries) {
        const success = await attemptUpdate();
        if (success) {
          break;
        }

        retries++;
        if (retries < maxRetries) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (retries === maxRetries) {
        throw new Error(`Failed to update project status after ${maxRetries} attempts`);
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      alert(`Failed to update project status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDraggedItem(null);
      setNoteModalOpen(false);
      setProjectToUpdate(null);
      setToStatus('');
    }
  };

  const handleSubStatusUpdate = async (newSubStatus: string, note: string, additionalFields?: {
    percentage?: number;
    budget?: number;
    awardAmount?: number;
    pr?: string;
    poNumber?: string;
    pmoNumber?: string;
  }) => {
    if (!projectToEdit) return;

    try {
      // First update the project sub-status
      const updateResponse = await fetch(`/api/projects/${projectToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectToEdit,
          subStatus: newSubStatus,
          statusChangeNote: note || projectToEdit.statusChangeNote,
          statusChangeDate: note ? new Date().toISOString() : projectToEdit.statusChangeDate,
          ...(additionalFields && {
            percentage: additionalFields.percentage,
            budget: additionalFields.budget,
            awardAmount: additionalFields.awardAmount,
            pr: additionalFields.pr,
            poNumber: additionalFields.poNumber,
            pmoNumber: additionalFields.pmoNumber,
          })
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(`Failed to update project sub-status: ${errorData.error || updateResponse.statusText}`);
      }

      const updatedProject = await updateResponse.json();

      // Update local state only after successful API call
      setProjects(prev => prev.map(p =>
        p.id === projectToEdit.id
          ? {
              ...p,
              subStatus: newSubStatus,
              statusChangeNote: note || p.statusChangeNote,
              statusChangeDate: note ? new Date().toISOString() : p.statusChangeDate,
              ...(additionalFields && {
                percentage: additionalFields.percentage ?? p.percentage,
                budget: additionalFields.budget ?? p.budget,
                awardAmount: additionalFields.awardAmount ?? p.awardAmount,
                pr: additionalFields.pr ?? p.pr,
                poNumber: additionalFields.poNumber ?? p.poNumber,
                pmoNumber: additionalFields.pmoNumber ?? p.pmoNumber,
              })
            }
          : p
      ));

      console.log("Project sub-status updated successfully");
    } catch (error) {
      console.error('Error updating project sub-status:', error);
      alert(`Failed to update project sub-status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubStatusModalOpen(false);
      setProjectToEdit(null);
    }
  };

  // Process projects into columns
  useEffect(() => {
    try {
      if (hasRenderError) return;

      if (projects.length > 0) {
        const columns: StatusColumn[] = [
          {
            title: 'Possible',
            status: 'Possible',
            color: 'text-slate-600 dark:text-slate-200',
            bgColor: 'bg-slate-100 dark:bg-slate-700',
            borderColor: 'border-slate-200 dark:border-slate-600',
            projects: projects.filter((p) => p.status === 'Possible'),
          },
          {
            title: 'Scoping',
            status: 'Scoping',
            color: 'text-indigo-600 dark:text-indigo-300',
            bgColor: 'bg-indigo-50 dark:bg-slate-700',
            borderColor: 'border-indigo-200 dark:border-indigo-700',
            projects: projects.filter((p) => p.status === 'Scoping'),
          },
          {
            title: 'Procurement',
            status: 'Procurement',
            color: 'text-blue-600 dark:text-blue-300',
            bgColor: 'bg-blue-50 dark:bg-slate-700',
            borderColor: 'border-blue-200 dark:border-blue-700',
            projects: projects.filter((p) => p.status === 'Procurement'),
          },
          {
            title: 'Execution',
            status: 'Execution',
            color: 'text-amber-600 dark:text-amber-300',
            bgColor: 'bg-amber-50 dark:bg-slate-700',
            borderColor: 'border-amber-200 dark:border-amber-700',
            projects: projects.filter((p) => p.status === 'Execution'),
          },
          {
            title: 'Completed',
            status: 'Completed',
            color: 'text-green-600 dark:text-green-300',
            bgColor: 'bg-green-50 dark:bg-slate-700',
            borderColor: 'border-green-200 dark:border-green-700',
            projects: projects.filter((p) => p.status === 'Completed'),
          },
          {
            title: 'Closed',
            status: 'Closed',
            color: 'text-red-600 dark:text-red-300',
            bgColor: 'bg-red-50 dark:bg-slate-700',
            borderColor: 'border-red-200 dark:border-red-700',
            projects: projects.filter((p) => p.status === 'Closed'),
          },
        ];
        setStatusColumns(columns);
      }
    } catch (err) {
      console.error('Error processing projects into columns:', err);
      setHasRenderError(true);
      setError('Error processing projects data. Please refresh the page.');
    }
  }, [projects, hasRenderError]);

  // Handle vertical dragging within the same column (priority)
  const handleDragEnd = (result: any) => {
    // Dropped outside a droppable area
    if (!result.destination) {
      return;
    }

    // Same column drag (priority reordering)
    if (result.source.droppableId === result.destination.droppableId) {
      const sourceColumn = statusColumns.find(col => col.status === result.source.droppableId);
      if (!sourceColumn) return;

      const reorderedProjects = reorder(
        sourceColumn.projects,
        result.source.index,
        result.destination.index
      );

      // Get the project that was moved
      const movedProject = sourceColumn.projects[result.source.index];

      // Update the column with new order
      const updatedColumns = statusColumns.map(col =>
        col.status === result.source.droppableId
          ? { ...col, projects: reorderedProjects }
          : col
      );

      setStatusColumns(updatedColumns);

      // Save the order in state to persist it
      setProjectOrder(prev => ({
        ...prev,
        [result.source.droppableId]: reorderedProjects.map(p => p.id)
      }));

      // Send notification using the notification utility
      notifyPriorityChange(
        movedProject.projectTitle,
        session?.user?.id,
        movedProject.id
      );
    }

    // Cross column drag (status change)
    if (result.source.droppableId !== result.destination.droppableId) {
      const sourceColumn = statusColumns.find(col => col.status === result.source.droppableId);
      const destColumn = statusColumns.find(col => col.status === result.destination.droppableId);

      if (!sourceColumn || !destColumn) return;

      // Get the project being moved
      const movedProject = {...sourceColumn.projects[result.source.index]};

      // Update project status
      movedProject.status = result.destination.droppableId;

      // Remove from source column
      const sourceProjects = Array.from(sourceColumn.projects);
      sourceProjects.splice(result.source.index, 1);

      // Add to destination column
      const destProjects = Array.from(destColumn.projects);
      destProjects.splice(result.destination.index, 0, movedProject);

      // Update columns
      const updatedColumns = statusColumns.map(col => {
        if (col.status === result.source.droppableId) {
          return { ...col, projects: sourceProjects };
        }
        if (col.status === result.destination.droppableId) {
          return { ...col, projects: destProjects };
        }
        return col;
      });

      setStatusColumns(updatedColumns);

      // Show status change modal to add notes
      setProjectToUpdate(movedProject);
      setToStatus(result.destination.droppableId);
      setNoteModalOpen(true);

      // Show notification for status change
      notifyStatusChange(
        movedProject.projectTitle,
        sourceColumn.status,
        destColumn.status,
        session?.user?.id,
        movedProject.id
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="mt-4 text-slate-600 dark:text-slate-400">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (error || hasRenderError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">Error Loading Projects</h3>
        <p className="text-red-600 dark:text-red-300 mb-4">{error || 'An unexpected error occurred'}</p>
        <button
          onClick={() => {
            setHasRenderError(false);
            setError(null);
            fetchProjects();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <>
        {/* My Projects Toggle - Always show even when no projects */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMyProjectsOnly(!showMyProjectsOnly)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                showMyProjectsOnly
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Show My Projects Only
            </button>

            {showMyProjectsOnly && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Showing projects where you are the OPD Focal
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/projects"
              className="text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              View All Projects →
            </Link>
          </div>
        </div>

        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="mb-4">
            <DocumentTextIcon className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">No Projects Found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {showMyProjectsOnly
              ? "You don't have any projects assigned to you yet. Try switching to 'Show All Projects' or create a new project."
              : "There are no projects available yet. Create your first project to get started."
            }
          </p>
          <Link href="/projects/new" className="btn btn-primary">
            <PlusIcon className="h-4 w-4 mr-1" />
            Create New Project
          </Link>
        </div>
      </>
    );
  }

  try {
    return (
      <>
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-xl p-8 mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 opacity-10">
            <DocumentTextIcon className="w-64 h-64 -mt-12 -mr-12" />
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
            <div>
              <h2 className="text-3xl font-bold mb-3 text-white">Dashboard</h2>
              <p className="text-white/90 text-lg">Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}!</p>
              <p className="text-white/80 mt-2">You have <span className="font-semibold">{projects.length}</span> total projects, with <span className="font-semibold">{projects.filter(p => ['Scoping', 'Procurement', 'Execution'].includes(p.status)).length}</span> in progress.</p>
              <div className="mt-4 text-white/70 flex items-center text-sm">
                <span className="inline-flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {getCurrentDate()} | {getCurrentTime()}
                </span>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <Link href="/projects/new" className="bg-white text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Project
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 pt-4 pb-2">
          <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
            <div className="card p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow hover:shadow-md transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="rounded-full p-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Total Projects</div>
                  <div className="text-2xl font-semibold text-slate-900 dark:text-white">{projects.length}</div>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow hover:shadow-md transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-900/10 dark:to-transparent"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="rounded-full p-3 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 shadow-sm">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">In Progress</div>
                  <div className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {projects.filter(p => ['Scoping', 'Procurement', 'Execution'].includes(p.status)).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow hover:shadow-md transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/10 dark:to-transparent"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="rounded-full p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 shadow-sm">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Completed</div>
                  <div className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {projects.filter(p => p.status === 'Completed').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Projects Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMyProjectsOnly(!showMyProjectsOnly)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                  showMyProjectsOnly
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Show My Projects Only
              </button>

              {showMyProjectsOnly && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Showing projects where you are the OPD Focal
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href="/projects"
                className="text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
              >
                View All Projects →
              </Link>
            </div>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {statusColumns.map((column) => (
              <div
                key={column.status}
                className={`card min-h-[200px] overflow-hidden flex flex-col ${hasRenderError ? 'hidden' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                <div className={`p-4 ${column.bgColor} ${column.borderColor} border-b flex items-center justify-between`}>
                  <h3 className={`font-medium ${column.color}`}>{column.title}</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-slate-700 rounded-full shadow-sm">
                    {column.projects?.length || 0}
                  </span>
                </div>

                <Droppable
                  droppableId={String(column.status)}
                  isDropDisabled={false}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                >
                  {(provided, snapshot) => (
                    <div
                      className={`flex-1 overflow-y-auto p-3 space-y-3 bg-white dark:bg-slate-800 ${snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {column.projects?.map((project, index) => (
                        <Draggable
                          key={project.id}
                          draggableId={String(project.id)}
                          index={index}
                        >
                          {(provided, snapshot) => {
                            const deptConfig = getDepartmentConfig(project.department);

                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`card-hover cursor-pointer min-h-[160px] flex flex-col border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all overflow-hidden rounded-lg ${snapshot.isDragging ? 'shadow-lg border-blue-300 dark:border-blue-500' : ''}`}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.9 : 1
                                }}
                              >
                                {/* Department Header */}
                                <div className={`p-2 bg-gradient-to-r ${deptConfig.color} relative overflow-hidden`}>
                                  <div className="absolute inset-0 bg-white/10"></div>
                                  <div className="relative flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                                      {project.department}
                                    </span>
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setProjectToEdit(project);
                                          setSubStatusModalOpen(true);
                                        }}
                                        className="text-xs p-1 text-white/80 hover:text-white hover:bg-white/20 rounded transition-colors"
                                        title="Edit sub-status"
                                      >
                                        <PencilIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedProjectId(project.id);
                                          setSelectedProjectTitle(project.projectTitle);
                                          setLogsModalOpen(true);
                                        }}
                                        className="text-xs p-1 text-white/80 hover:text-white hover:bg-white/20 rounded transition-colors"
                                        title="View activity logs"
                                      >
                                        <EyeIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          showArchiveConfirmation(project, true);
                                        }}
                                        className="text-xs p-1 text-white/80 hover:text-white hover:bg-white/20 rounded transition-colors"
                                        title="Archive project"
                                      >
                                        <ArchiveBoxIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Project Content */}
                                <div className="p-3 flex-1 flex flex-col">
                                  {/* Project Title */}
                                  <h4 className="font-medium text-slate-900 dark:text-white mb-2 text-sm leading-tight line-clamp-2">
                                    {project.projectTitle}
                                  </h4>

                                  <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mb-2">
                                    <ClockIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">
                                      {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'No date'}
                                    </span>
                                  </div>

                                  {project.subStatus && (
                                    <div className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 inline-block mb-2 w-fit">
                                      {project.subStatus}
                                    </div>
                                  )}

                                  {project.statusChangeNote && (
                                    <div className="mt-1 mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-2 border-blue-200 dark:border-blue-700 text-xs">
                                      <p className="text-blue-700 dark:text-blue-300 break-words">
                                        <span className="font-medium">Note:</span> {project.statusChangeNote}
                                      </p>
                                      {project.statusChangeDate && (
                                        <div className="flex justify-between items-center mt-1">
                                          <p className="text-blue-600 dark:text-blue-400 text-xs">
                                            {formatDate(project.statusChangeDate, 'short')}
                                          </p>
                                          <p className="text-blue-600 dark:text-blue-400 text-xs">
                                            By: {session?.user?.name || "Admin"}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <div className="flex-grow"></div>

                                  <div className="flex items-center justify-between text-xs mt-auto">
                                    <div className="flex items-center">
                                      <UserGroupIcon className="h-3 w-3 mr-1" />
                                      <span className="truncate w-32 text-slate-600 dark:text-slate-300" title={project.opdFocal || 'Unassigned'}>
                                        {project.opdFocal || 'Unassigned'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-slate-600 dark:text-slate-400">Progress</span>
                                      <span className="text-xs font-medium text-slate-900 dark:text-white">{project.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                                      <div
                                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                                        style={{ width: `${project.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {column.projects?.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-24 text-slate-400 dark:text-slate-500 text-sm">
                          <p>No projects</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Status Change Note Modal */}
        {noteModalOpen && projectToUpdate && (
          <NoteModal
            isOpen={noteModalOpen}
            onClose={() => {
              setNoteModalOpen(false);
              setProjectToUpdate(null);
              setToStatus('');
            }}
            onSave={handleStatusUpdate}
            projectTitle={projectToUpdate.projectTitle}
            fromStatus={projectToUpdate.status}
            toStatus={toStatus}
            currentSubStatus={projectToUpdate.subStatus || ''}
            project={projectToUpdate}
            subStatusOptions={(() => {
              const subStatusOptions = {
                'Possible': ['Initial Review', 'Feasibility Study', 'Approval Pending'],
                'Scoping': ['Requirements Gathering', 'Design Phase', 'Cost Estimation', 'Vendor Selection'],
                'Procurement': ['RFQ Preparation', 'Vendor Evaluation', 'Contract Negotiation', 'Purchase Order', 'Award'],
                'Execution': ['Project Kickoff', 'In Progress', 'Testing Phase', 'Final Review', 'Enabaling Works'],
                'Completed': ['Documentation', 'Handover', 'Post-Implementation Review'],
                'Closed': ['Archived', 'Cancelled', 'On Hold']
              };
              return subStatusOptions[toStatus as keyof typeof subStatusOptions] || [];
            })()}
          />
        )}

        {/* Sub-Status Edit Modal */}
        {subStatusModalOpen && (
          <SubStatusModal
            isOpen={subStatusModalOpen}
            onClose={() => {
              setSubStatusModalOpen(false);
              setProjectToEdit(null);
            }}
            onSave={handleSubStatusUpdate}
            project={projectToEdit}
            currentSubStatus={projectToEdit?.subStatus || ''}
          />
        )}

        {/* Project Logs Modal */}
        {logsModalOpen && (
          <ProjectLogsModal
            isOpen={logsModalOpen}
            onClose={() => {
              setLogsModalOpen(false);
              setSelectedProjectId('');
              setSelectedProjectTitle('');
            }}
            projectId={selectedProjectId}
            projectTitle={selectedProjectTitle}
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
      </>
    );
  } catch (error) {
    console.error('Render error in Dashboard:', error);
    return (
      <ErrorFallback
        error={error instanceof Error ? error : new Error('Unknown rendering error')}
        resetErrorBoundary={() => {
          setHasRenderError(false);
          fetchProjects();
        }}
      />
    );
  }
}

