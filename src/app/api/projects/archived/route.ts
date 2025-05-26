import { NextRequest, NextResponse } from 'next/server';
import { getArchivedProjects } from '../../../../services/projectService';

// GET /api/projects/archived - Get all archived projects
export async function GET() {
  try {
    const projects = await getArchivedProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching archived projects:', error);
    return NextResponse.json({ error: 'Failed to fetch archived projects' }, { status: 500 });
  }
}
