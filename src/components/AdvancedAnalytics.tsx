'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line, Scatter } from 'react-chartjs-2';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Project {
  id: string;
  projectTitle: string;
  department: string;
  status: string;
  percentage: number;
  budget?: number;
  savingsOMR?: number;
  startDate?: string;
  completionDate?: string;
  year: number;
  opdFocal: string;
  area: string;
  capexOpex: string;
  createdAt: string;
}

interface AnalyticsFilters {
  departments: string[];
  years: number[];
  statuses: string[];
  dateRange: { start: string; end: string };
}

interface AdvancedAnalyticsProps {
  projects: Project[];
}

export default function AdvancedAnalytics({ projects }: AdvancedAnalyticsProps) {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    departments: [],
    years: [],
    statuses: [],
    dateRange: { start: '', end: '' }
  });

  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [selectedMetric, setSelectedMetric] = useState<'budget' | 'progress' | 'timeline' | 'performance'>('budget');

  // Filter projects based on analytics filters
  useEffect(() => {
    let filtered = [...projects];

    if (filters.departments.length > 0) {
      filtered = filtered.filter(p => filters.departments.includes(p.department));
    }

    if (filters.years.length > 0) {
      filtered = filtered.filter(p => filters.years.includes(p.year));
    }

    if (filters.statuses.length > 0) {
      filtered = filtered.filter(p => filters.statuses.includes(p.status));
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(p => {
        if (!p.startDate) return false;
        const projectDate = new Date(p.startDate);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return projectDate >= startDate && projectDate <= endDate;
      });
    }

    setFilteredProjects(filtered);
  }, [filters, projects]);

  // Calculate advanced metrics
  const calculateMetrics = () => {
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSavings = filteredProjects.reduce((sum, p) => sum + (p.savingsOMR || 0), 0);
    const avgProgress = filteredProjects.reduce((sum, p) => sum + p.percentage, 0) / filteredProjects.length || 0;

    const statusDistribution = filteredProjects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const departmentBudgets = filteredProjects.reduce((acc, p) => {
      acc[p.department] = (acc[p.department] || 0) + (p.budget || 0);
      return acc;
    }, {} as Record<string, number>);

    const yearlyTrends = filteredProjects.reduce((acc, p) => {
      acc[p.year] = acc[p.year] || { count: 0, budget: 0, savings: 0 };
      acc[p.year].count += 1;
      acc[p.year].budget += p.budget || 0;
      acc[p.year].savings += p.savingsOMR || 0;
      return acc;
    }, {} as Record<number, { count: number; budget: number; savings: number }>);

    return {
      totalBudget,
      totalSavings,
      avgProgress,
      statusDistribution,
      departmentBudgets,
      yearlyTrends,
      projectCount: filteredProjects.length,
      savingsRate: totalBudget > 0 ? (totalSavings / totalBudget) * 100 : 0
    };
  };

  const metrics = calculateMetrics();

  // Chart configurations
  const budgetByDepartmentChart = {
    labels: Object.keys(metrics.departmentBudgets),
    datasets: [{
      label: 'Budget (OMR)',
      data: Object.values(metrics.departmentBudgets),
      backgroundColor: [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
      ],
      borderWidth: 0,
      borderRadius: 8,
    }]
  };

  const yearlyTrendsChart = {
    labels: Object.keys(metrics.yearlyTrends).sort(),
    datasets: [
      {
        label: 'Project Count',
        data: Object.keys(metrics.yearlyTrends).sort().map(year => metrics.yearlyTrends[parseInt(year)].count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Total Budget (OMR)',
        data: Object.keys(metrics.yearlyTrends).sort().map(year => metrics.yearlyTrends[parseInt(year)].budget),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };

  const statusDistributionChart = {
    labels: Object.keys(metrics.statusDistribution),
    datasets: [{
      data: Object.values(metrics.statusDistribution),
      backgroundColor: [
        '#10B981', // Completed - Green
        '#3B82F6', // In Progress - Blue
        '#F59E0B', // Planning - Amber
        '#8B5CF6', // On Hold - Purple
        '#EF4444', // Delayed - Red
        '#6B7280'  // Other - Gray
      ],
      borderWidth: 0,
    }]
  };

  // Get unique values for filters
  const uniqueDepartments = [...new Set(projects.map(p => p.department))];
  const uniqueYears = [...new Set(projects.map(p => p.year))].sort((a, b) => b - a);
  const uniqueStatuses = [...new Set(projects.map(p => p.status))];

  const handleFilterChange = (filterType: keyof AnalyticsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      departments: [],
      years: [],
      statuses: [],
      dateRange: { start: '', end: '' }
    });
  };

  return (
    <div className="space-y-6">
      {/* Analytics Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-blue-500" />
            Analytics Filters
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-slate-500 hover:text-red-600 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Departments</label>
            <select
              multiple
              value={filters.departments}
              onChange={(e) => handleFilterChange('departments', Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              size={3}
            >
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Years</label>
            <select
              multiple
              value={filters.years.map(String)}
              onChange={(e) => handleFilterChange('years', Array.from(e.target.selectedOptions, option => parseInt(option.value)))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              size={3}
            >
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              multiple
              value={filters.statuses}
              onChange={(e) => handleFilterChange('statuses', Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              size={3}
            >
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="End Date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.projectCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Budget</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.totalBudget.toLocaleString()} OMR</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Savings</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.totalSavings.toLocaleString()} OMR</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Progress</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.avgProgress.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget by Department */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Budget by Department</h3>
          <div className="h-64">
            <Bar
              data={budgetByDepartmentChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return value.toLocaleString() + ' OMR';
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Status Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={statusDistributionChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Yearly Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Yearly Trends</h3>
          <div className="h-64">
            <Line
              data={yearlyTrendsChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index' as const,
                  intersect: false,
                },
                scales: {
                  x: {
                    display: true,
                    title: {
                      display: true,
                      text: 'Year'
                    }
                  },
                  y: {
                    type: 'linear' as const,
                    display: true,
                    position: 'left' as const,
                    title: {
                      display: true,
                      text: 'Project Count'
                    }
                  },
                  y1: {
                    type: 'linear' as const,
                    display: true,
                    position: 'right' as const,
                    title: {
                      display: true,
                      text: 'Budget (OMR)'
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      callback: function(value) {
                        return value.toLocaleString() + ' OMR';
                      }
                    }
                  },
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.dataset.label === 'Total Budget (OMR)') {
                          label += context.parsed.y.toLocaleString() + ' OMR';
                        } else {
                          label += context.parsed.y;
                        }
                        return label;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {metrics.savingsRate.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-600">Savings Rate</div>
            <div className="text-xs text-slate-500 mt-1">
              Total savings vs total budget
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Object.keys(metrics.departmentBudgets).length}
            </div>
            <div className="text-sm text-slate-600">Active Departments</div>
            <div className="text-xs text-slate-500 mt-1">
              Departments with projects
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Object.keys(metrics.yearlyTrends).length}
            </div>
            <div className="text-sm text-slate-600">Years Covered</div>
            <div className="text-xs text-slate-500 mt-1">
              Project timeline span
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
