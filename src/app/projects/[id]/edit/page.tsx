'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ProjectForm from '@/components/ProjectForm';

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

export default function EditProject() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout title="Edit Project">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout title="Edit Project">
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
          <p className="text-red-600 dark:text-red-400">{error || 'Project not found'}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Edit: ${project.projectTitle}`}>
      <ProjectForm project={project} />
    </AppLayout>
  );
}