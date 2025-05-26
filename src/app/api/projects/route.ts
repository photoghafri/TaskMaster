import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject } from '@/services/projectService';
import { logProjectCreation } from '@/services/projectLogService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/projects - Get all projects
export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    // Validate required fields (area is now optional)
    const requiredFields = ['projectTitle', 'drivers', 'type', 'opdFocal', 'department'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Convert numeric values if they come as strings
    const projectData = {
      ...body,
      year: typeof body.year === 'string' ? parseInt(body.year, 10) : body.year,
      percentage: typeof body.percentage === 'string' ? parseInt(body.percentage, 10) : body.percentage,
      budget: body.budget ? parseFloat(body.budget) : null,
      awardAmount: body.awardAmount ? parseFloat(body.awardAmount) : null,
      savingsOMR: body.savingsOMR ? parseFloat(body.savingsOMR) : null,
      savingsPercentage: body.savingsPercentage ? parseFloat(body.savingsPercentage) : null,
      duration: body.duration ? parseInt(body.duration, 10) : null,
      createdBy: session?.user?.id || '',
    };

    const project = await createProject(projectData);

    // Log project creation if user is authenticated
    if (session?.user && project.id) {
      await logProjectCreation(
        project.id,
        project.projectTitle,
        session.user.id || '',
        session.user.name || ''
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}