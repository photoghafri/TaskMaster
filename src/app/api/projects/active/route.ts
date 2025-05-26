import { NextRequest, NextResponse } from 'next/server';
import { getActiveProjects } from '../../../../services/projectService';

// GET /api/projects/active - Get all active (non-archived) projects
export async function GET() {
  try {
    const projects = await getActiveProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching active projects:', error);
    return NextResponse.json({ error: 'Failed to fetch active projects' }, { status: 500 });
  }
}
