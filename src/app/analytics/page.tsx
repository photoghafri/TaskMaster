'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import AuthWrapper from '@/components/AuthWrapper';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ChartBarIcon, CurrencyDollarIcon, ClockIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';



type ActivityType = 'success' | 'info' | 'warning' | 'danger';

interface Project {
  id: string;
  projectTitle: string;
  status: string;
  percentage: number;
  department: string;
  opdFocal: string;
  budget?: number;
  awardAmount?: number;
  savingsOMR?: number;
  completionDate?: string;
  startDate?: string;
  createdAt: string;
  type: string;
  year: number;
  area: string;
  capexOpex: string;
}

interface Activity {
  action: string;
  time: string;
  type: ActivityType;
}

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
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

  // Calculate project status distribution
  const statusDistribution = {
    Possible: projects.filter(p => p.status === 'Possible').length,
    Scoping: projects.filter(p => p.status === 'Scoping').length,
    Procurement: projects.filter(p => p.status === 'Procurement').length,
    Execution: projects.filter(p => p.status === 'Execution').length,
    Completed: projects.filter(p => p.status === 'Completed').length,
    Closed: projects.filter(p => p.status === 'Closed').length,
  };

  // Calculate project completion rate
  const completionStats = {
    onTime: 0,
    delayed: 0,
    atRisk: 0,
    total: projects.length
  };

  projects.forEach(project => {
    const completionDate = project.completionDate ? new Date(project.completionDate) : null;
    const today = new Date();

    if (project.status === 'Completed' || project.status === 'Closed') {
      completionStats.onTime++;
    } else if (completionDate && completionDate < today) {
      completionStats.delayed++;
    } else if (project.percentage < 50 && project.status !== 'Possible' && project.status !== 'Scoping') {
      completionStats.atRisk++;
    }
  });

  // Calculate budget metrics
  const budgetStats = {
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalAwarded: projects.reduce((sum, p) => sum + (p.awardAmount || 0), 0),
    totalSavings: projects.reduce((sum, p) => sum + (p.savingsOMR || 0), 0)
  };

  // Calculate department distribution
  const departmentData = projects.reduce((acc: {[key: string]: number}, project) => {
    acc[project.department] = (acc[project.department] || 0) + 1;
    return acc;
  }, {});

  // Calculate KPIs
  const activeProjects = projects.filter(p => !['Completed', 'Closed'].includes(p.status)).length;
  const avgDuration = projects
    .filter(p => p.startDate && p.completionDate)
    .map(p => {
      const start = new Date(p.startDate!);
      const end = new Date(p.completionDate!);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    })
    .reduce((sum, days, _, arr) => sum + days / arr.length, 0) || 0;

  // Get recent activities
  const recentActivities = projects
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(p => ({
      action: `Project "${p.projectTitle}" ${p.status === 'Completed' ? 'completed' : 'updated'}`,
      time: new Date(p.createdAt).toLocaleDateString(),
      type: p.status === 'Completed' ? 'success' as ActivityType :
            p.status === 'Delayed' ? 'danger' as ActivityType :
            'info' as ActivityType
    }));

  // Chart data
  const statusChartData = {
    labels: Object.keys(statusDistribution),
    datasets: [
      {
        data: Object.values(statusDistribution),
        backgroundColor: [
          'rgba(148, 163, 184, 0.85)',  // Possible - slate
          'rgba(129, 140, 248, 0.85)',  // Scoping - indigo
          'rgba(96, 165, 250, 0.85)',   // Procurement - blue
          'rgba(251, 191, 36, 0.85)',   // Execution - amber
          'rgba(74, 222, 128, 0.85)',   // Completed - green
          'rgba(248, 113, 113, 0.85)',  // Closed - red
        ],
        borderColor: [
          'rgba(148, 163, 184, 1)',
          'rgba(129, 140, 248, 1)',
          'rgba(96, 165, 250, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(74, 222, 128, 1)',
          'rgba(248, 113, 113, 1)',
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff',
        borderRadius: 4,
      },
    ],
  };

  const budgetChartData = {
    labels: ['Budget', 'Awarded', 'Savings'],
    datasets: [
      {
        label: 'Amount (OMR)',
        data: [
          budgetStats.totalBudget,
          budgetStats.totalAwarded,
          budgetStats.totalSavings
        ],
        backgroundColor: [
          'rgba(96, 165, 250, 0.8)',  // blue
          'rgba(251, 191, 36, 0.8)',  // amber
          'rgba(74, 222, 128, 0.8)',  // green
        ],
        borderColor: [
          'rgba(96, 165, 250, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(74, 222, 128, 1)',
        ],
        borderWidth: 2,
        borderRadius: 6,
        hoverBorderWidth: 3,
      },
    ],
  };

  // Department distribution chart
  const departmentChartData = {
    labels: Object.keys(departmentData),
    datasets: [
      {
        label: 'Projects by Department',
        data: Object.values(departmentData),
        backgroundColor: 'rgba(129, 140, 248, 0.8)',
        borderColor: 'rgba(129, 140, 248, 1)',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: 'rgba(129, 140, 248, 0.9)',
        hoverBorderColor: 'rgba(129, 140, 248, 1)',
        barThickness: 20,
        maxBarThickness: 30,
      },
    ],
  };

  // Project progress over time (simplified example)
  const progressChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Project Completion',
        data: [10, 25, 30, 40, 50, completionStats.onTime],
        fill: true,
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        borderColor: 'rgba(74, 222, 128, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(74, 222, 128, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(74, 222, 128, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  if (loading) {
    return (
      <AppLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Analytics">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AuthWrapper>
      <AppLayout title="">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Advanced Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 flex items-center space-x-2">
                <ChartBarIcon className="h-4 w-4" />
                <span>Comprehensive project performance insights and metrics</span>
              </p>
            </div>
          </div>

          {/* Advanced Analytics Component */}
          <AdvancedAnalytics projects={projects} />
        </div>
      </AppLayout>
    </AuthWrapper>
  );
}