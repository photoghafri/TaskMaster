'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  UserCircleIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface ProjectLog {
  id: string;
  projectId: string;
  action: 'STATUS_CHANGE' | 'SUBSTATUS_CHANGE' | 'PROJECT_CREATED' | 'PROJECT_UPDATED' | 'NOTE_ADDED';
  description: string;
  changes: Record<string, { from: any; to: any }>;
  note?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  projectTitle?: string;
}

interface EnhancedActivityLogsProps {
  projectId?: string;
  projectTitle?: string;
  showFilters?: boolean;
  maxHeight?: string;
}

export default function EnhancedActivityLogs({
  projectId,
  projectTitle,
  showFilters = true,
  maxHeight = "600px"
}: EnhancedActivityLogsProps) {
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<'none' | 'date' | 'project'>('date');
  const { data: session } = useSession();

  // Fetch logs
  useEffect(() => {
    fetchLogs();
  }, [projectId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = projectId ? `/api/projects/${projectId}/logs` : '/api/logs';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format field names for display
  const formatFieldName = (field: string): string => {
    const fieldMap: Record<string, string> = {
      'projectTitle': 'Project Title',
      'opdFocal': 'OPD Focal',
      'capexOpex': 'CAPEX/OPEX',
      'subStatus': 'Sub-Status',
      'awardAmount': 'Award Amount',
      'awardedCompany': 'Awarded Company',
      'completionDate': 'Completion Date',
      'startDate': 'Start Date',
      'poNumber': 'PO Number',
      'pmoNumber': 'PMO Number',
      'savingsOMR': 'Savings (OMR)',
      'savingsPercentage': 'Savings %',
      'dateOfReceiveFinalDoc': 'Final Document Date'
    };

    return fieldMap[field] || field.replace(/([A-Z])/g, ' $1').trim();
  };

  // Format values for display
  const formatValue = (value: any, field?: string): string => {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    if (field && (field.includes('Date') || field.includes('date'))) {
      try {
        return new Date(value).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return String(value);
      }
    }

    if (field && (field.includes('Amount') || field.includes('budget') || field.includes('savings'))) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'OMR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(num);
      }
    }

    if (field && field.includes('percentage')) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return `${num}%`;
      }
    }

    return String(value);
  };

  // Generate human-readable summary
  const generateSummary = (log: ProjectLog): string => {
    if (log.action === 'PROJECT_CREATED') {
      return `New project "${log.projectTitle || 'Untitled'}" was created`;
    }

    if (log.action === 'NOTE_ADDED') {
      return `Note added to project`;
    }

    if (log.action === 'STATUS_CHANGE') {
      const statusChange = log.changes?.status;
      if (statusChange) {
        return `Status changed from "${statusChange.from}" to "${statusChange.to}"`;
      }
    }

    if (log.action === 'SUBSTATUS_CHANGE') {
      const subStatusChange = log.changes?.subStatus;
      if (subStatusChange) {
        return `Sub-status updated to "${subStatusChange.to}"`;
      }
    }

    if (log.action === 'PROJECT_UPDATED') {
      const changeCount = Object.keys(log.changes || {}).length;
      if (changeCount === 1) {
        const [field, change] = Object.entries(log.changes || {})[0];
        return `${formatFieldName(field)} updated`;
      } else if (changeCount > 1) {
        return `${changeCount} fields updated`;
      }
    }

    return log.description || 'Project updated';
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    const iconClass = "h-5 w-5";

    switch (action) {
      case 'PROJECT_CREATED':
        return <PlusIcon className={`${iconClass} text-green-500`} />;
      case 'PROJECT_UPDATED':
      case 'STATUS_CHANGE':
      case 'SUBSTATUS_CHANGE':
        return <PencilIcon className={`${iconClass} text-blue-500`} />;
      case 'NOTE_ADDED':
        return <DocumentTextIcon className={`${iconClass} text-purple-500`} />;
      default:
        return <ClipboardDocumentListIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  // Get relative time
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Toggle log expansion
  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (searchTerm && !log.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.createdByName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(log.projectTitle || '').toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (actionFilter && log.action !== actionFilter) {
      return false;
    }

    if (userFilter && log.createdByName !== userFilter) {
      return false;
    }

    if (dateFilter) {
      const logDate = new Date(log.createdAt).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      if (logDate !== filterDate) {
        return false;
      }
    }

    return true;
  });

  // Group logs
  const groupedLogs = () => {
    if (groupBy === 'none') {
      return { 'All Logs': filteredLogs };
    }

    if (groupBy === 'date') {
      const groups: Record<string, ProjectLog[]> = {};
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      filteredLogs.forEach(log => {
        const logDate = new Date(log.createdAt);
        let groupKey: string;

        if (logDate.toDateString() === today.toDateString()) {
          groupKey = 'Today';
        } else if (logDate.toDateString() === yesterday.toDateString()) {
          groupKey = 'Yesterday';
        } else {
          groupKey = logDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        }

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(log);
      });

      return groups;
    }

    if (groupBy === 'project') {
      const groups: Record<string, ProjectLog[]> = {};
      filteredLogs.forEach(log => {
        const groupKey = log.projectTitle || 'Unknown Project';
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(log);
      });
      return groups;
    }

    return { 'All Logs': filteredLogs };
  };

  // Export logs
  const exportLogs = () => {
    const csvContent = [
      ['Date', 'Time', 'User', 'Action', 'Summary', 'Project', 'Details'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.createdAt).toLocaleDateString(),
        new Date(log.createdAt).toLocaleTimeString(),
        log.createdByName,
        log.action,
        generateSummary(log),
        log.projectTitle || '',
        Object.entries(log.changes || {}).map(([field, change]) =>
          `${formatFieldName(field)}: ${formatValue(change.from)} → ${formatValue(change.to)}`
        ).join('; ')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!projectId && (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Activity Logs
            </h1>
            <p className="text-slate-600 dark:text-slate-300 flex items-center space-x-2">
              <ClipboardDocumentListIcon className="h-4 w-4" />
              <span>Track all changes and activities across your projects</span>
            </p>
          </div>
          <button
            onClick={exportLogs}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Actions</option>
              <option value="PROJECT_CREATED">Created</option>
              <option value="PROJECT_UPDATED">Updated</option>
              <option value="STATUS_CHANGE">Status Change</option>
              <option value="SUBSTATUS_CHANGE">Sub-Status Change</option>
              <option value="NOTE_ADDED">Note Added</option>
            </select>

            {/* User Filter */}
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="">All Users</option>
              {Array.from(new Set(logs.map(log => log.createdByName))).map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Group By */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Group by:</span>
            <div className="flex gap-2">
              {[
                { value: 'none', label: 'None' },
                { value: 'date', label: 'Date' },
                { value: 'project', label: 'Project' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setGroupBy(option.value as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    groupBy === option.value
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700" style={{ maxHeight, overflowY: 'auto' }}>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">
              {logs.length === 0 ? 'No activity logs found.' : 'No logs match your current filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {Object.entries(groupedLogs()).map(([groupName, groupLogs]) => (
              <div key={groupName}>
                {groupBy !== 'none' && (
                  <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                    <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {groupName}
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        ({groupLogs.length} {groupLogs.length === 1 ? 'log' : 'logs'})
                      </span>
                    </h3>
                  </div>
                )}

                {groupLogs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(log.action)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-slate-900 dark:text-white">
                              {generateSummary(log)}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                              {log.action.replace('_', ' ').toLowerCase()}
                            </span>
                          </div>
                          <time className="text-sm text-slate-500 dark:text-slate-400" title={new Date(log.createdAt).toLocaleString()}>
                            {getRelativeTime(log.createdAt)}
                          </time>
                        </div>

                        {/* User and Project Info */}
                        <div className="flex items-center gap-4 mb-3 text-sm text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1">
                            <UserCircleIcon className="h-4 w-4" />
                            <span className="font-medium">{log.createdByName || 'Unknown'}</span>
                          </div>
                          {!projectId && log.projectTitle && (
                            <div className="flex items-center gap-1">
                              <TagIcon className="h-4 w-4" />
                              <span>{log.projectTitle}</span>
                            </div>
                          )}
                        </div>

                        {/* Note */}
                        {log.note && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              <span className="font-medium">Note:</span> {log.note}
                            </p>
                          </div>
                        )}

                        {/* Changes Summary */}
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Changes ({Object.keys(log.changes).length})
                              </span>
                              <button
                                onClick={() => toggleLogExpansion(log.id)}
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {expandedLogs.has(log.id) ? (
                                  <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                  <ChevronDownIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>

                            {/* Quick Summary */}
                            {!expandedLogs.has(log.id) && (
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {Object.entries(log.changes).slice(0, 2).map(([field, change]) => (
                                  <div key={field} className="mb-1">
                                    <span className="font-medium">{formatFieldName(field)}:</span>{' '}
                                    <span className="text-red-600 dark:text-red-400">{formatValue(change.from, field)}</span>
                                    {' → '}
                                    <span className="text-green-600 dark:text-green-400">{formatValue(change.to, field)}</span>
                                  </div>
                                ))}
                                {Object.keys(log.changes).length > 2 && (
                                  <span className="text-slate-500 dark:text-slate-400">
                                    +{Object.keys(log.changes).length - 2} more changes
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Detailed Changes */}
                            {expandedLogs.has(log.id) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(log.changes).map(([field, change]) => (
                                  <div key={field} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                                    <div className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                                      {formatFieldName(field)}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                                        {formatValue(change.from, field)}
                                      </span>
                                      <span className="text-slate-400">→</span>
                                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                        {formatValue(change.to, field)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}